// Deps
import $ from 'jquery';

// Constants
const MODULE_NAME  = "Settings";

const FORM_URI      = location.href,
      FORM_REFERRER = location.referrer,
      FORM_ORIGIN   = "funeral-plan-options";

var apiBaseUrl = '';      

module.exports.envCheck = function(hostname) {
  if (hostname === 'staging.this-is-to-be-decided-upon.com') {
    return "staging";
  } else if (hostname === 'www.this-is-to-be-decided-upon.com') {
    return "production"     
  } else {
    return "development";
  }
}      

module.exports.form = {
  'types': {
    'lead': {
      'id': 'leadCaptureForm'
    }
  },
  'completionParam': 'r',
  'requiredClassName': 'js-validate-required-field',
  'optionalClassName': 'js-validate-optional-field',
  'fieldErrorClassName':   'field-error',
  'fieldSuccessClassName': 'field-saved'
}

module.exports.browser = {
  'storage': {
    'namespace': 'LT',
    'storages': ['cookie', 'local'],
    'expireDays': 31
  }
}

exports.pardot = {
  "account_id": '0',
  "campaign_id": '0',
  "form_handler": 'https://go.pardot.com/to-be-done-by-lead-tech'
}

exports.formProfile = {
  'thanksPageUri': 'thank-you',  
  "uri": FORM_URI,
  "ref": FORM_REFERRER,
  "origin":  FORM_ORIGIN
}

module.exports.referrerProfile = {}

module.exports.communicationsProfile = {}

module.exports.enviroment = {
  "type":  exports.envCheck(window.location.hostname)
}

if (exports.enviroment.type === 'staging') { 
  console.log('API: Staging URLs');
  apiBaseUrl = "//staging.api.lead-tech.co.uk";
} else if (exports.enviroment.type === 'production') {
  console.log('API: Production URLs');  
  apiBaseUrl = "//api.lead-tech.co.uk";
} else {
  console.log('API: Local URLs');    
  apiBaseUrl = "//staging.api.lead-tech.co.uk";  
  //apiBaseUrl = "//localhost/lead-tech-apis";
}

exports.API = {    
  "referrerUrl": apiBaseUrl + "/services/http/referrer/getReferrer/",
  "validationPostUrl":  apiBaseUrl + "/services/validation/form/post",
  "submissionPostUrl":  apiBaseUrl + "/services/lead/insert/",
  "leadResponsePollUrl":    apiBaseUrl + "/services/lead/allocator/poll/",
  "leadResponseProcessUrl": apiBaseUrl + "/services/lead/allocator/process/",
  "leadResponseProcessPardotUrl": apiBaseUrl + "/services/lead/handler/process/",    
  "sessionUrl": apiBaseUrl + "/services/http/session/"    
}   

exports.formMultiFieldTemplates = {
  'companyStagingDate' : {
    'concatTemplate' : 'month/year',        
    'concatToField'  : $('[name="company_staging_date"]'),
    'dataGroup'  : $('[data-field-name="company_staging_date"]'),
    'dataMatch'  : {
      'month' : $('#companyStagingDateMonthVal'),
      'year'  : $('#companyStagingDateYearVal')          
    }           
  }     
}
