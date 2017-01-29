// Deps
import $ from 'jquery';
import _ from 'lodash';

// Module
import util from 'modules/util';

class PageNav {
  constructor() {
  }
  init() {
    var _this = this,
        openEl  = $('.js-slide-nav--open'),
        showSubEl  = $('.js-show-submenu'),
        mobileNavEl = $(".o-main-nav--mobile");

    $(window).on('scroll', function(e) {
      _.throttle(_this.showHide, 200)();

      e.preventDefault(); 
    });    

    openEl.on('click touchstart',function (e) {
      $(this).toggleClass('icon-nav-close');
      $(this).toggleClass('icon-hamburger-menu');
      $('.js-slide-nav').toggleClass('slide-nav--active');     

      e.preventDefault();       
    });   

    showSubEl.on('click touchstart',function (e) {
      var thisLi = $(this).parent();
      var thisLiSiblings = thisLi.siblings();
      thisLiSiblings.find('ul').slideUp("fast");
      thisLi.find('ul').slideToggle("fast");
      e.preventDefault();
    });

  }
  showHide() {
    if ( $('.o-main-nav--mobile').scrollTop() > 15 ) { 
      $(".js-slide-nav--open").hide(); 
    } else { 
      $(".js-slide-nav--open").show(); 
    } 
  }

}

export {PageNav};