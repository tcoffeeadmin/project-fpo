// Deps
import $ from 'jquery';

class previousPageButton {
  constructor() {
  }
  init() {
    var _this = this;

    $(".js-prev-page").on('click', function() {
      _this.goBack();
    });    
  }
  goBack() {
    window.history.back();
  }
}

export {previousPageButton};