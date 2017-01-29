// Deps
import $ from 'jquery';
import _ from 'lodash';

class podHeightMatch {
  constructor() {
  }
  init() {
    var _this = this;

    $(window).on('resize', function() {
      _.throttle(function() {
        // Reset all heights on elements.    
        $(".js-category-pod").height('auto');
        _this.syncHeight("js-category-pod--1", "js-category-pod--2")
        _this.syncHeight("js-category-pod--3", "js-category-pod--4")
        _this.syncHeight("js-category-pod--5", "js-category-pod--6")

      }, 400)();
    });    
    
    $(window).trigger('resize');
  }
  syncHeight(elOneClass, elTwoClass) {

    if ($(window).width() < 768)
      return false;

    // Cache the class selectors
    var elOne = $('.' + elOneClass),
        elTwo = $('.' + elTwoClass);

    // If either one of these selectors could not be found on the page.
    if ( (elOne.length === 0) || elTwo.length === 0)
      return false;
  
    // Cache their current heights
    var elOneHeight = elOne.height(),
        elTwoHeight = elTwo.height();

    // If Element 1 is higher than Element 2
    if (elOneHeight > elTwoHeight) {
      elTwo.height(elOneHeight); // Set Element 2s height to Element 1s height
    } else {
      elOne.height(elTwoHeight); // Vice-versa
    }
  }
}

export {podHeightMatch};