

jQuery(document).ready(function ($) {


  var steps = $(".step");
  console.dir(steps);

  // var count_found_enigmas = $('#count_found_enigmas').val();
  // if (count_found_enigmas > 0) {
  //   setTimeout(function () {
  //     steps.each(function (index) {
  //       var _t = $(this);
  //       if (index < count_found_enigmas) {

  //         animateProgressBar(index + 1);
  //       }
  //     });
  //   }, 1000);
  // }

  setProgressBarDimensions();
  $(window).resize(function () { setProgressBarDimensions(); })


});
function animateProgressBar(step_index, with_time_out = true) {
  var count_steps = $('.step').length;
  var left = $('#step_container_' + step_index).position().left + $('#step_container_' + step_index).width() - $("#detective").width() / 2;

  
  if (with_time_out) {
    setTimeout(function () {
      console.log(left);
      $("#detective").animate({
        left: left + "px",
      }, 1000);
      $('#step_container_' + step_index).addClass('done');
    }, 1250 * step_index * 1.5);

  } else {
    if(step_index == count_steps){
      left = $('#step_container_' + step_index).position().left - $("#detective").width() / 2;
    }

    $("#detective").animate({
      left: left + "px",
    }, 1000);

    $('#progress_bar_content_inside').animate({
      width: left - 25 + "px",
    }, 1000);
    var steps = $('.step ');

    var full_points = $('#full_points').val();
    for (var i = 0; i <= parseInt(step_index); i++) {
      $("#progress_bar_content_inside").addClass('play_' + step_index);
    }

    // $("#progress_bar_content").animate({ 
    //   'mask-size': left+"px 64px",
    // }, 1000 );
    //  $('#progress_bar_content').css( 'mask-size', left+"px 64px");
    $.each(steps, function (index, step) {
      var step_id = $(step).attr('id');
      step_id = parseInt(step_id.replace("step_container_", ""));

      if (step_id <= step_index) {
        // $('#step_container_'+enigma_number).addClass('done');
        $("#step_container_"+step_id).find('.level_line').css('opacity', '1');
        $(step).addClass('done');
      }
    })

  }


}
function setProgressBarDimensions() {

  var full_points = $('#full_points').val();

  var first_step_position = $('#step_container_1').position();
  var step_1_round_height = $('#step_1').outerHeight();
  var step_width = $('#step_container_1').width();
  var icon_width = $('.step_checkmark').first().width();

  $('#detective').css({
    top: first_step_position.top - $('#detective').height() + 10,
    // top: first_step_position.top - step_1_round_height*2,
    // top: first_step_position.top - step_1_round_height - 2 - $('#detective').height(),
    left: first_step_position.left + ($('#step_1').width() / 2) - $("#detective").width() / 2,
  })


  $('.icon-checkmark').css({
    top: 0,
    // top: $('#step_container_1 .step-progress').height()/ 2 - $('.icon-checkmark').height()/2,
    // left: first_step_position.left - ($('#step_1').width()/2) ,
  });

  var icon_wrapper_width = parseInt($('.icon-wrapper').first().width());
  $('.icon-wrapper-end').css({
    right: -(icon_wrapper_width / 2)
  });
  $('.icon-wrapper-last').css({
    right: 0
  });

  $('.step-text-end').each(function (index, element) {
    if($(element).hasClass('step-last')){
      $(this).css({
        right: 0
      });
    }else{
      var text_width = $(this).width();
      $(this).css({
        right: -text_width / 2
      });
    }

  })

  $('.step-text-first').each(function (index, element) {
    var text_width = $(this).width();
    $(this).css({
      left: text_width / 2
    });
  })
  $('.level_line').each(function (index, element) {
    console.log(icon_width);
    $(this).css({
      left: icon_width / 2
    });
    if( $(this).hasClass('level_line_even')){
      $(this).css({
        top: -14
      });
    
    }
  })


  // var step_texts = $('.step-text');
  // $.each(step_texts, function(index, step){
  //   var text_width = $(this).width();
  //   $(this).css({
  //     right: -text_width / 2
  //   });
  // })
  //create style to be injected

  // var html = '<style type="text/css">';
  // for (var i = 0; i < parseInt(full_points); i++) {
  //   html += '#progress_bar_content.play_' + i + '{mask-size:' + i * step_width + 'px 64px; animation: mask-play_' + i + ' 2s steps(100) forwards;}';
  //   html += '@keyframes mask-play_' + i + ' {from {mask-size: ' + i * step_width + 'px 64px;}to {mask-size:' + (i + 1) * step_width + 'px 64px;}}';
  // }
  // html += '</style>';

  //  $('#progression_wrapper').append(html);

}