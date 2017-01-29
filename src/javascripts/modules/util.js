// Deps
import $ from 'jquery';

// Constants
const MODULE_NAME  = "Util";

exports.init = function() {

  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
}

exports.addParameterToUrl = function(url, param, value) {
  url += (url.split('?')[1] ? '&':'?') + param + '=' + value;
  
  return url;
}

exports.getParameterFromUrl = function(param) {
  var vars = {};
  window.location.href.replace( 
    /[?&]+([^=&]+)=?([^&]*)?/gi, 
    function( m, key, value ) {
      vars[key] = value !== undefined ? value : '';
    }
  );

  if ( param ) {
    return vars[param] ? vars[param] : null;  
  }
  return vars;
}

exports.replaceElementTag = function(currentTag, newTag) {
  $(currentTag).replaceWith(function(){
    return $(newTag).append($(this).contents());
  });
}

exports.serializeJSON = function (str) {
  var o = {};
  var a = str.serializeArray();
  $.each(a, function () {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

exports.scrollView = function (el) {
  $('html, body').animate({
    scrollTop: el.offset().top
  }, 400);
}

/**
 * This function checks if the bottom of the element is higher than the current window’s scrollTop.
 * Then it checks if the top of the element is lower than the window’s scroll bottom.
 * If both are true, it’s out of view.
 */
exports.isScrolledIntoView = function(el) {
  el = $(el);

  if (el.length === 0)
    return false;

  var elTop     = el.offset().top,
      elHeight  = el.height(),
      winHeight = $(window).height(),
      docBottom = $(window).scrollTop() + (winHeight / 2);
      
  return (elTop + elHeight >= $(window).scrollTop() && elTop < docBottom);
}

exports.onChangeEvent = function(elClass, callbackFunc) {
  var $el = $(elClass);

  $el.on('change', function (e) {
    var $changedEl = $(this);

    callbackFunc($changedEl);
  });
}

exports.onClickEvent = function(elClass, callbackFunc) {
  var $el = $(elClass);

  $el.on('click', function (e) {
    e.preventDefault();

    var $clickedEl = $(this);

    callbackFunc($clickedEl);
  });
}

exports.onDelegatedClickEvent = function(elParentClass, elClass, callbackFunc) {
  var $elParent = $(elParentClass),
      $el = $(elClass);

  $elParent.on('click', $el,  function (e) {
    e.preventDefault();

    var $changedEl = $(this);

    callbackFunc($changedEl);
  });
}