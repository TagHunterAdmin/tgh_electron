jQuery(document).ready(function ($) {
    $('#first_game_screen').click(function() {
        $(this).hide();
    });

    fullScreen();
 
});





/*
 * Create a step for game animation.
 ** Stage: wait for 4 duration time
 ** Hide: hide the target
 **
 ** @param array steps_array
 ** @param string container_name
 ** @param string type
 ** @param bool stage
 ** @param bool hide
 ** @param string target
 ** @param int or bool value
 ** 
 */
function createStep(steps_array, container_name, type, stage, hide, target, value = false) {

    step = steps_array.length;
    steps_array[step] = [];
    steps_array[step]['type'] = type;
    steps_array[step]['container_name'] = container_name;
    steps_array[step]['action'] = 'show';
    steps_array[step]['value'] = value;

    if (target) {
        steps_array[step]['target'] = target;
    }

    step++;

    if (stage) {
        var steps_stage = 4;
        if ($.isNumeric(stage)) {
            steps_stage = stage;
        }
        for (var i = 1; i <= steps_stage; i++){
            steps_array[step] = [];
            steps_array[step]['type'] = type;
            steps_array[step]['action'] = 'stage';
            step++;
        }
    }

    if (hide) {
        steps_array[step] = [];
        steps_array[step]['type'] = type;
        steps_array[step]['action'] = 'hide';
        if (target) {
            steps_array[step]['target'] = target;
        }
        step++;
    }

    return steps_array;
}
/*
 * Hide element
 ** Set opacity to 0
 */
 function hideElement(container_name, animation_duration, target = false) {
    if (target) {
        $(container_name + ' ' + target).animate({
            opacity: 0
        }, animation_duration);
    } else {
        $(container_name).animate({
            opacity: 0
        }, animation_duration);
    }
}

/*
 * Show element
 ** Set opacity to 1
 */
function showElement(container_name, animation_duration, target = false) {
    // $(container_name).show();
    if (target) {
        $(container_name + ' ' + target).animate({
            opacity: 1
        }, animation_duration);
    } else {
        $(container_name).animate({
            opacity: 1
        }, animation_duration);
    }
    
}
/* 
 * Scroll to element.
 */
function scrollToElement(animation_duration, element, target, offset = 200) {
    var full_target = element;
    if (target) {
        full_target = element + ' ' + target;
    }
    $('html, body').stop().animate({
        scrollTop: $(full_target).offset().top - offset
    }, animation_duration);
}

/*
 * Show message from server return
 */
function showMessage(animation_duration, type, text) {


    scrollToElement(1, '#game_message_container');
    $('#game_message_container').removeClass();
    $('#game_message_container').addClass(type);
    $('.game_message_text').html(text);
    $('#game_message_wrapper').show();
    $('#game_message_wrapper').css('opacity', 1);
    $('#game_message_container').css('z-index', 10000);
    $('#game_message_container').animate({
        opacity: 1
    }, animation_duration);

    //If game type is survival
    if ($('.game_instructions_wrapper').length) {
        $('.game_instructions_wrapper').css('opacity', 0);
    }
}

/*
 * Hide message from server return
 */
function hideMessage(animation_duration) {
    $('#game_message_container').removeClass();
    $('.game_message_text').html('');
    $('#game_message_wrapper').hide();
    $('#game_message_container').css('z-index', -1);
    $('#game_message_wrapper').animate({
        opacity: 0
    }, animation_duration);
    //If game type is survival
    if ($('.game_instructions_wrapper').length) {
        setTimeout(function () {
            $('.game_instructions_wrapper').css('opacity', 1);
        }, animation_duration + 200);
    }
}

/*
 * Show loading spinner
 */
function showLoading() {
    $('#game_loading_wrapper').show();
    $('#game_loading_wrapper').animate({
        opacity: 1
    }, 1000);
    console.log($('#loading_image').length);
    if($('#loading_image').length){

        $('#loading_image img').effect( "pulsate", {times:10}, 18000 );
        // var heigth = $('#loading_image').height(),
        // scale = 1.1,
        // sh = heigth*scale;
        // scaleUp($('#loading_image img'), sh, heigth);
    }
}

/*
 * Hide loading spinner
 */
function hideLoading() {
    $('#game_loading_wrapper').hide();
    $('#game_loading_wrapper').animate({
        opacity: 0
    }, 1000);
}

/*
 * Go fullscreen
 */
function fullScreen() {
    $('#fullscreen').click(function () {
        $('body').fullscreen();
        return false;
    });
}

