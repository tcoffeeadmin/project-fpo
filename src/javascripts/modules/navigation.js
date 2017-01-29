// Deps
import $ from 'jquery';

// Constants
const MODULE_NAME = "Navigation";

exports.init = function() {
  setNavigation();
}

var setNavigation = function() {
  var path = window.location.pathname;
  path = path.replace(/\/$/, "");
  path = decodeURIComponent(path);

  $(".js-main-nav__ul a").each(function () {
    var href = $(this).attr('href');
    if (path.substring(7, href.length) === href.substring(7)) {
      $(this).closest('li').addClass('active-page');
    }
  });
}