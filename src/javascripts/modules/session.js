// Modules
import settings from './settings';
import util from './util';
import form from './form';

// Deps
import $ from 'jquery';
import qW from 'qwest';
import bzL from 'basil.js';

// Constants
const MODULE_NAME  = "Session";

var _bzL = new Basil(settings.browser.storage),  // do we need to put this on the window?
    pingCount = 0;


exports.init = function() {

  // QWEST specific 
  qW.setDefaultDataType('json');

  // We don't want to request a referrer profile after a form completion.
  if ($.isEmptyObject(settings.formResponse))
    processReferrerStorage();

  pingSession = setInterval(pingSession, 30000);    
}

var processReferrerStorage = function() {
  var profile = _bzL.get("Referrer");

  if (profile) {
    settings.referrerProfile = profile;

    console.log('Loaded Cached Profile: ', settings.referrerProfile);

    updateFormSession('#leadCaptureForm');    
  } else {
    getReferrerProfile(settings.formProfile.uri, settings.formProfile.ref);
  }
}

var pingSession = function() {
  try {
    if (settings.referrerProfile.UUID) {      

      var pingString = "Ping (" + pingCount++ + "): ";

      // If session has been pinging for more than 6 hours, prevent further pings till page reload
      if(pingCount > 720)
        return false;

      qW.get(
        settings.API.sessionUrl + 'ping/' + settings.referrerProfile.UUID)
          .then(function(xhr, response) {            
            var result = response['Result'];

            if(result === false) {
              reloadReferrerProfile();
            }
            
            console.log(pingString, result);                      
          })
          ['catch'](function(e, xhr, response) {
            console.log(e);
          }); 
    } else {
      console.log("No UUID");    
      clearInterval(pingSession);
    }
  } catch(e) {
    console.log(e);      
  }    
}

var updateSession = function(updateKey, updateObject) {
  var obj = {};

  // Append data to object
  obj[updateKey] = updateObject;

  try {
    qW.post(
        settings.API.sessionUrl + 'update/' + settings.referrerProfile.UUID, obj)
          .then(function(xhr, response) {
            console.log(response);
          })
          ['catch'](function(e, xhr, response) {
            console.log(e);
          }); 

  } catch(e) {
    console.log(e);      
  }    
}

var updateFormSession = function(formId) {
  formId = $(formId);

  if (formId.length === 0)
    return false;

  var updateKey = 'form',
      updateObject = {
        "name": form.getFormName(),
        "product": form.getFormProduct(),
        "origin": settings.formProfile['origin'],          
        "fieldCount": form.getFormFields(),
        "stepCount": form.getFormSteps(),     
        // "fieldCount": _forms.getFormFields(),
        // "stepCount": _forms.getFormSteps(),
        "uri": settings.formProfile['uri'],
        "thanksPageUri": settings.formProfile['thanksPageUri']
      };

  updateSession(updateKey, updateObject);
}

/**
* Prepares an object of field/value data to submit to partialSubmission
*/
var getReferrerProfile = function(uri, referrer) {
  // TODO: Check if referrer is empty (or self) and no utm_source attributes presents, then make it a direct!
  // {ChannelId: "8"}

  // Remove a hash on the URL
  var uri = uri.replace(/#.*$/,'');

  if (referrer) {
    var paramName = "referrer";

    uri = util.addParameterToUrl(uri, paramName, referrer);
  }

  // Append a UUID request along with the Referrer information
  if (uri) {
    var paramName  = "reqUUID",
        paramValue = "true";

    uri = util.addParameterToUrl(uri, paramName, paramValue);
  }

  qW.post(
    settings.API.sessionUrl + 'new', {"referrer":uri})
      .then(function(xhr, response) {
        responseCallback(response);
      })
      ['catch'](function(e, xhr, response) {
        console.log(e);
      });    
}

var reloadReferrerProfile = function() {

  console.log("Session: Posting ReferrerProfile");

  qW.post(
    settings.API.sessionUrl + 'reload', {
        "referrer": JSON.stringify(settings.referrerProfile)
      })
      .then(function(xhr, response) {
        console.log(response["Referrer"]);
      })
      ['catch'](function(e, xhr, response) {
        console.log(e);
      });    
}

var responseCallback = function(response) {
  // Nail down into the Referrer part
  response = response["Referrer"];  

  console.log('Loaded Profile: ', response);

  // Store it
  _bzL.set("Referrer", response);

  // Set the current referrerProfile to use the returned JSON object
  settings.referrerProfile = response;

  updateFormSession('#leadCaptureForm');
}