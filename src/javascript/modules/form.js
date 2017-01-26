// Modules
import settings from './settings';
import util from './util';
import messages from './messages';

// Deps
import $ from 'jquery';
import qW from 'qwest';
import bzL from 'basil.js';

// Constants
const MODULE_NAME  = "Forms";

var _bzL = new Basil(settings.browser.storage);  // do we need to put this on the window?

/**
 * Stores the string value of the submit button, usually mid XHR request.
 *
 * @type {String}
 */
var submitBtnText = "";      

/**
 * Stores a literal array of objects that are returned from serverside
 * validation checks.
 * 
 * @type {Object}
 */
var validationCache = {};

/**
 * Stores an array of fields currently within the XHR que
 * 
 * @type {Array}
 */
var loadingXHRCache = [];

/**
 * Stores an array of required fields
 * 
 * @type {Array}
 */
var fieldCache = [];

/**
 * Stores current validity of the form
 * 
 * @type {Boolean}
 */
var isValid = true;

/**
 * Form multi field templates, for times where multiple fields build up to a single string or value,
 * it makes sense to validate one field instead of several.
 *
 * Fields are bound by their [data-field-name], and are run through a pattern match based on the 'concatTemplate'
 *
 * Eg: heightImperial = [6 ft 2 in], dob = [19/08/1989]
 *
 * XXX: (one exception though...)
 * title / martialStatus are examples where I didn't want to run validation directly on the select element,
 * due to the HTML markup, a little sneaky, but a time saver for now.
 *
 */
var formMultiFieldTemplates = settings.formMultiFieldTemplates; 

exports.init = function() {
  // QWEST specific 
  qW.setDefaultDataType('json');
  qW.limit(4);

  util.onChangeEvent('.' + settings.form.requiredClassName, validateRequiredField);

  // Build up a fieldCache on load
  createFieldCache();

  // Setup On Submit event listener for form
  interceptFormSubmission('#' + settings.form.types.lead.id);    

  // Check for Ctrl + Alt + A for Autofill 
  $(document).keyup(function(e) {
    var key = e.keyCode || e.charCode || 0;
    var c = e.ctrlKey;
    var s = e.shiftKey;

    if (s && c && key == 65)
      autoFill();
  });    

  window.addEventListener('popstate', function(e) {
    var oldStep = e.state;  

    console.log(oldStep);

    if (oldStep !== null)
      exports.prevStep();
  });  

  // TODO: Offload onChange event listener to the onChange callback function inside utilities module
  $.each(formMultiFieldTemplates, function(name, obj) {

    var dataMatch = obj.dataMatch,
        field = obj.concatToField;

    $(obj.dataGroup).on('change', function() {

      // Prepare template for RegEx to replace;
      formMultiFieldTemplates[name].concatData = formMultiFieldTemplates[name].concatTemplate;

      $.each(dataMatch, function(key, obj) {
        var re = new RegExp(key, 'g'),
            val = $(obj.selector).val();

        if (val) {
          formMultiFieldTemplates[name].concatData = formMultiFieldTemplates[name].concatData.replace(re, val);

          obj.addClass(settings.form.fieldSuccessClassName);
        }
      });

      field.val(formMultiFieldTemplates[name].concatData).trigger('change');

      console.log('Manually Triggered: validateRequiredField');

      // TODO: Not all fields are required but still may need to be validated under the same circumstances
      // We may wish to improve this mechanism later down the line
      validateRequiredField(field);
    });
  });   
}

exports.getFormFields = function() {
  var _this = $(settings.form.types.lead.id),
      fields = _this.find('[data-required]').length;

  return fields++;
}

exports.getFormSteps = function() {
  var steps = $('#' + settings.form.types.lead.id).find('fieldset').length;

  return steps++;
}

exports.getFormName = function() {
  var _this = $('#' + settings.form.types.lead.id),
      name = _this.data('name');

  return name;
}  

exports.getFormProduct = function() {
  var _this = $('#' + settings.form.types.lead.id),
      product = _this.find('#formProduct').val();

  return product;
}

var interceptFormSubmission = function(form) {
  var form = $(form);

  var submitBtn = $('.js-fieldset-submit', form),
      _this = this;

  submitBtnText = submitBtn.html();

  $(form).on('submit', function (e) {

    e.preventDefault();

    // Trigger a blur to setoff any change events that weren't triggered
    // TODO: What about fields that aren't inputs!
    $('input[value=""]').blur();

    submitBtn
      .attr("disabled", true)
      .html("<span>Please wait...</span>");     

    // Submit partial submission for customers intention to submit their data
    partialFormSubmission(settings.referrerProfile.UUID, {'submit_btn':'Triggered'});        

    var waitForRequests = setInterval(function(){ requestsCheck() }, 250);

    // Interval check on how many XHR requests are qued up.
    function requestsCheck() {
      console.log("Pending XHR Requests: ", loadingXHRCache);

      if(loadingXHRCache.length === 0)
        requestsFinished();
    }
    // Fired upon finished XHR que.
    function requestsFinished() {
      clearInterval(waitForRequests);

      setTimeout(function() { 
        var isValid = flushValidation();

        if (!isValid) {
          setTimeout(function() { 
            submitBtn
              .attr("disabled", false)
              .html(submitBtnText);                
          }, 1500);
        } else {
          var fieldData = util.serializeJSON(form),
              postObj = {};

          var product = exports.getFormProduct();

          if (product) {
            settings.formProfile.product = product;
          }

          postObj['formProfile']     = settings.formProfile;
          postObj['referrerProfile'] = settings.referrerProfile;
          postObj['fieldData']       = fieldData;

          // Convert fieldData object to JSON Object
          var post = JSON.stringify(postObj);

          console.log('Post Request: ', postObj);

          qW.post(
            settings.API.submissionPostUrl, JSON.parse(post))
              .then(function(xhr, response) {
                console.log('Post Response: ', response);      

                submissionResponse(response);          
              })
              ['catch'](function(e, xhr, response) {
                  console.log(e);
              }); 
        }
      }, 500);       
    }        
  });
}

var submissionResponse = function(response) {
  var url = response.ThanksPageURI,
      host = window.location.host;

  if (settings.enviroment.type === "development") {
    host = host + '/_site';
  }

  // Store it
  _bzL.set(MODULE_NAME, response);
      
  // Append updated link on dom.location and base64 response object for added obscurity.
  // We may pick this object up via the encoded URL (r) param when required.  
  window.location.href = '//' + host + '/' + url + '?r=' + btoa(response.UUID);
}

/**
 * Iterates over the validationCache array, checks for the result and 
 * processes validation errors accordingly.
 * 
 * @return {[bool]} [description]
 */
var flushValidation = function() {
  var errors = validationCache,
      fields = fieldCache;

  console.log('fieldCache:', fields);

  // Set default isValid
  var errorCount = 0;        

  $.each(fields, function( index, name ) {

    var field = $('[name="' + name + '"], [data-field-name="' + name + '"]'),
        fieldValue = field.val() ? field.val() : false,
        fieldError = $('[name="' + name + '"]').data('required');

    // If the value of the field is empty
    if(fieldValue === false) {
      var errorReason = (fieldError) ? fieldError : 'Please provide this information.';
      // Bypass an API call and trigger error
      messages.showError(name, {"empty":errorReason});

      field.addClass(settings.form.fieldErrorClassName);

      errorCount++;
    } else {
      // If the errors object has an index of this field name
      if (typeof errors[name] !== "undefined") {
        // If validation cache has a result of true, remove the error (if exists), or show one.
        if (errors[name].Result === true) {
          messages.removeError(errors[name].FieldName);

          field.removeClass(settings.form.fieldErrorClassName);
        } else {
          messages.showError(errors[name].FieldName, errors[name].Result);

          field.addClass(settings.form.fieldErrorClassName);

          errorCount++;
        }  
      } else {
        // It would appear a field is filled but not yet validated, validate now
        // This happens when a field is autofilled, or anything that could bypass a 'change' event.
        //validateField(name, fieldValue);
        console.log('Manually Triggered: validateRequiredField');

        // TODO: Not all fields are required but still may need to be validated under the same circumstances
        // We may wish to improve this mechanism later down the line
        validateRequiredField(field);
      }
    }

  });

  console.log('Form Error Count: ', errorCount);

  isValid = (errorCount === 0) ? true : false;

  return isValid;
}

/**
 * Callback Func for OnChangeEvent defined in initialisation
 * Gets fieldName/Value off element, packages it up ready for POSTing
 * 
 * @param  {[object]} $el [description]
 */
var validateRequiredField = function($el) {
  var fieldName  = $el.attr("name"),
      fieldValue = $el.val(),
      data = {};

  // Append data to object
  data[fieldName] = fieldValue;

  partialFormSubmission(settings.referrerProfile.UUID, data, validateRequiredFieldResponse);
}

/**
* Posts field/value data to external validation service
*
* @param  {[string]} uuid      [description]
* @param  {[object]} fieldData [description]
* @param  {Function} callback  [description]
*/
var partialFormSubmission = function(uuid, fieldData, callback) {
  var data = {};

  // Append data to object
  data['UUID']      = uuid;
  data['fieldData'] = fieldData;

  // Convert fieldData object to JSON Object
  var post = JSON.stringify(data)

  // Concise browser compatible way of getting the first key out of the fieldData object.
  for (var fieldName in fieldData) if (fieldData.hasOwnProperty(fieldName)) break;        

  qW.post(
    settings.API.validationPostUrl, JSON.parse(post), null, function(xhr) {
      beforeRequest(xhr, fieldName);        
    })
    .then(function(xhr, response) {
      if(typeof callback === "function")
        callback(response);
    })
    ['catch'](function(e, xhr, response) {
      console.log(e);
    })
    .complete(function() {
      completedRequest();
    });     

  function beforeRequest(xhr, fieldName) {
    try {
      xhr.upload.onprogress = function(e) {
        loadingXHRCache.push(fieldName);
      };
    } catch(err) {

    }
  }

  function completedRequest(fieldName) {
    loadingXHRCache.splice($.inArray(fieldName, loadingXHRCache), 1);
  }      
}

/**
 * Callback Func for validateRequiredField
 * Stores Validation Result into validationCache object
 * 
 * @param  {[object]} response [description]
 */
var validateRequiredFieldResponse = function(response) {
  // Get the current fieldname, to use as an array index
  // This will override the previous index if set.
  var index = response.Validate.FieldName,
      value = response.Validate.FieldValue,
      field = $('[name="' + index + '"]');

  // If validation came back with a cleansed result, then use it!
  if (response.Validate.Cleansed)
    field.val(value);   

  field.addClass(settings.form.fieldSuccessClassName);

  // Push API responses into the validationCache
  validationCache[index] = response.Validate;

  if (index === 'email' && (response.Validate.Result === true)) {
    pardotFormHandler(value);
  }  
}

var pardotFormHandler = function(email) {
  var postUrl = settings.pardot.form_handler;

  if (postUrl) {
    postUrl = postUrl.replace(/^http(|s):\/\//i, '//');

    console.log('Pardot: Posted email (' + email + ')');

    // XXX: Pardot doesn't support CORS, they allow for an iframe implementation though!
    $('body').append('<iframe src="' + postUrl + '?email=' + encodeURIComponent(email) + '" width="1" height="1"></iframe>');   
  }
}

/**
 * Creates an array of the current visible fieldsets required fields
 * @param  {[bool]} recreate [cleans the current array]
 */
var createFieldCache = function(recreate) {
  if (recreate === true)
    fieldCache = [];

  $('[data-required]:enabled').each(function() {
    var fieldName = $(this).attr("name");

    if ($.inArray(fieldName, fieldCache)==-1) {
      console.log('Field Cached: ', fieldName);
      fieldCache.push(fieldName);
    }
  });    
}

var autoFill = function() {
  var fakeDetails = {
    'fullname': 'Tee Bizzle',
    'firstname': 'Lead',
    'lastname': 'Tech',      
    'telephone': '01943462551',
    'telephone_data8': '01943462551',          
    'email': 'test@test.com',
    'postcode': 'LS21 3JP',
  },
  fields = fieldCache;

  $.each(fields, function( index, value ) {
    var field = $('[name="' + value + '"]');

    if(field.val().length < 1) {
      field.val(fakeDetails[value]).trigger("change");
    } 
  });  
}