// Modules
import settings from './settings';
import util from './util';

// Deps
import $ from 'jquery';
import qW from 'qwest';
import bzL from 'basil.js';

// Constants
const MODULE_NAME  = "Result";

var _bzL = new Basil(settings.browser.storage);

exports.init = function() {
  // QWEST specific 
  qW.setDefaultDataType('json');
  qW.limit(4);

  checkUriForCompletion(); 
}

var checkUriForCompletion = function() {
  var paramExists = util.getParameterFromUrl(settings.form.completionParam);

  if (paramExists) {
    console.log('Run Processing to External(s)');

    // Delete current referrer session, force it to grab a new one!
    _bzL.remove("Referrer"); 

    // Add parsed form response object to app namespace
    var formResponse = _bzL.get("Forms");

    console.log(formResponse);

    if (formResponse.Result === true) {

      if (window.location.pathname.match(/thank-you/g)) {

        processToPardot(formResponse.UUID);        

        try {
          var productName = settings.productMap[formResponse.Product],
              firstName   = formResponse.FieldData.fullname.split(' ');

          if (typeof productName === "undefined") {
            $('.js-replace-product-name').remove();
          } else {
            $('.js-replace-product-name').text(productName);            
          }

          $('.js-replace-first-name').text(firstName[0]);          
        } catch(e) {

        }

        if (formResponse.Test === false) {
          dataLayer.push({
            'event': 'transaction',
            'transactionId': formResponse.UUID,
            'transactionTotal': formResponse.TransactionData.price,
            'transactionTax': '0',
            'transactionShipping': '0',
            'transactionProducts': [{
                'sku': formResponse.TransactionData.sku,
                'name': formResponse.TransactionData.name,
                'price': formResponse.TransactionData.price,
                'quantity': '1'
            }]
          });
        }   
      }
    } else {
      return false;
    }   
  }
}

var processToPardot = function(uuid) {
  qW.get(
    settings.API.leadResponseProcessPardotUrl + uuid)
      .then(function(xhr, response) {
        console.log('Processed Pardot: ', response);
      })
      ['catch'](function(e, xhr, response) {
        console.log(e);
      });   
}