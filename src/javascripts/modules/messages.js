// Deps
import $ from 'jquery';

// Modules
import settings from './settings';

// Constants
const MODULE_NAME = "Messages";

exports.init = function() {
  console.log('Loaded: ', MODULE_NAME);
}

exports.removeError = function(fieldName, instant) {
  var target = $('.error-message--' + fieldName);

  if (instant) {
    target.remove();
  } else {
    target.fadeOut(300, function() { target.remove(); });       
  }
}

/**
* Prepares an object of field/value data to submit to partialSubmission
*/
exports.showError = function(fieldName, errorMessage, target) {
  var errorTemplate,
      isValid = false;

  console.log('Show Error: ', fieldName);

  // Before we begin showing error messages, clean up what's already visible.
  exports.removeError(fieldName, true);

  // Loop over error message object
  for (var key in errorMessage) {
    errorTemplate = $('<p class="is-invisible o-message o-message--alert error-message error-message--' +
      fieldName + ' error-message--' + key + '" tabindex="-1">' + errorMessage[key] + '</p>');

    if (target) {
      errorTemplate.appendTo(target).fadeIn(160);
    } else {
      errorTemplate.insertAfter($('[name="' + fieldName + '"]')).fadeIn(160);      
    }
  }
}