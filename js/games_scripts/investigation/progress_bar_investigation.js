jQuery(document).ready(function ($) {


  var steps = $(".step");
  console.dir(steps);

  var count_found_enigmas = $('#count_found_enigmas').val();
  if (count_found_enigmas > 0) {
    setTimeout(function () {
      steps.each(function (index) {
        var _t = $(this);
        if (index < count_found_enigmas) {

          animateProgressBar(index + 1);
        }
      });
    }, 1000);
  }

  setProgressBarDimensions();
  $(window).resize(function () { setProgressBarDimensions(); })


});

function setProgressBarDimensions() {
  var first_step_position = $('#step_container_1').position();
  var step_1_round_height = $('#step_1').outerHeight();


  console.log(first_step_position);
  console.log('step_1_round_height ' +step_1_round_height);
  $('#detective').css({
    top: first_step_position.top - $('#detective').height() - 5,
    // top: first_step_position.top - step_1_round_height*2,
    // top: first_step_position.top - step_1_round_height - 2 - $('#detective').height(),
    left: first_step_position.left + ($('#step_1').width() / 2) - $("#detective").width() / 2,
  })


  $('.icon-checkmark').css({
    top: 0,
    // top: $('#step_container_1 .step-progress').height()/ 2 - $('.icon-checkmark').height()/2,
    // left: first_step_position.left - ($('#step_1').width()/2) ,
  });

  var icon_wrapper_width = parseInt($('.icon-checkmark').first().width());
  $('.icon-wrapper-end').css({
    right: icon_wrapper_width / 2
  });

  $('.step-text-end').each(function (index, element) {
    var text_width = $(this).width();
    $(this).css({
      right: -text_width / 2
    });
  })
  $('.step-text-first').each(function (index, element) {
    var text_width = $(this).width();
    $(this).css({
      left: text_width / 2
    });
  })
}