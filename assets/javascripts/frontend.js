//go-to-top script

$(window).scroll(function () {
  if ($(this).scrollTop() >= 50) {        // If page is scrolled more than 50px
    $('#return-to-top').fadeIn(200);    // Fade in the arrow
  } else {
    $('#return-to-top').fadeOut(200);   // Else fade out the arrow
  }
});
$('#return-to-top').click(function () {      // When arrow is clicked
  $('body,html').animate({
    scrollTop: 0                       // Scroll to top of body
  }, 500);
});

//go-to-top script for cta-button-sm

$(window).scroll(function () {
  if ($(this).scrollTop() >= 650) {        // If page is scrolled more than 50px
    $('.fixed-cta').fadeIn(200);    // Fade in the arrow
  } else {
    $('.fixed-cta').fadeOut(200);   // Else fade out the arrow
  }
});
$('.fixed-cta').click(function () {      // When arrow is clicked
  $('body,html').animate({
    scrollTop: 0                       // Scroll to top of body
  }, 500);
});