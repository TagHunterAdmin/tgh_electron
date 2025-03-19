var launched_game_meta,
    game,
    game_meta,
    launched_game,
    launched_game_meta,
    updateLaunchedGameUrl,
    notifyTeamAnimationEndedUrl,
    search_new_data_timeout,
    animation_duration,
    enigma_animation_duration,
    animation_message_duration,
    device_id;


jQuery(document).ready(function ($) {
    'use strict';
    // scrollToElement(0, '#top_page_ancre', false, 0);
    imageLoad();
    $(window).on('resize', function () {
        imageLoad();
    });

    //Retreive data from hidden inputs
    game = $.parseJSON($('#game').val());
    game_meta = $.parseJSON($('#game_meta').val());
    launched_game = $.parseJSON($('#launched_game').val());
    launched_game_meta = $.parseJSON($('#launched_game_meta').val());
    updateLaunchedGameUrl = $('#updateLaunchedGameUrl').val();
    notifyTeamAnimationEndedUrl = $('#notifyTeamAnimationEndedUrl').val();
    search_new_data_timeout = $('#search_new_data_timeout').val();
    device_id = $('#device_id').val(),
        animation_duration = $('#animation_image_duration').val() * 1000,
        enigma_animation_duration = $('#animation_image_duration').val() * 500,
        animation_message_duration = $('#animation_message_duration').val() * 1000;

    $(document).keypress(function (e) {
        if (e.which == 13) {
            onKeyOrClick();
        }
    });
    $('#game_instructions_button_image_container').click(function () {
        onKeyOrClick();
    })
    $('#reload_page').click(function () {
        // window.location.reload(true);
        resetGame();
    })
    $('#game_instructions_button_image_container').mouseenter(function () {
        $("#game_instructions_button_image").toggleClass('hide');
        $("#game_instructions_button_hover_image").toggleClass('hide');
    }).mouseleave(function () {
        $("#game_instructions_button_image").toggleClass('hide');
        $("#game_instructions_button_hover_image").toggleClass('hide');
    });
    $('#reload_page').mouseenter(function () {
        $("#game_refresh_button_image").toggleClass('hide');
        $("#game_refresh_button_hover_image").toggleClass('hide');
    }).mouseleave(function () {
        $("#game_refresh_button_image").toggleClass('hide');
        $("#game_refresh_button_hover_image").toggleClass('hide');
    });

});

function resetGame() {

    showElement('.game_instructions_wrapper', 1000);
    hideElement('.progress_bar_container', 1000);
    hideElement('.enigmas_wrapper', 1000);
    hideElement('#enigmas_grid_wrapper', 1000);
    hideElement('#final_score_container', 1000);


    $("#progress_bar_content_inside").width(0);
    $("#progress_bar_content_inside").removeClass()

    $('#ajax_running').val(0);
    $('#animation_ended').val(0);
    $('#time_background_image_text').html('');
    $('#game_score_container_score').text(0);
    $('#time_full_container_detail').html('');
    $('#time_full_container_malus span').html('');
    $('#final_score_level_container').html('');
    $('#final_score_score').html('');
    $('#survival_team_name_container .survival_team_name_container_text').html('');

    $.each($('.enigma_answer_image_background'), function (index, element) {
        $(element).css('background', 'transparent');
    })
    $.each($('.enigma_answer_image_icon'), function (index, element) {
        $(element).css('opacity', '0');
    })
    $.each($('.enigma_answer_image'), function (index, element) {
        $(element).removeClass('no_blur');
    })
    $.each($('.team_bonus_container'), function (index, element) {
        $(element).removeClass('bonus_to_show');
        $(element).removeClass('bonus_showing');
    })

    $("#detective").animate({
        left: 0,
    }, 1000);
    $.each($('.step'), function (index, element) {
        $(element).removeClass('done');
    })
    $.each($('.level_line'), function (index, element) {
        $(element).css('opacity', 0);
    })


}

function onKeyOrClick() {

    var running = $('#ajax_running').val();
    var animation_ended = $('#animation_ended').val();
    /*
    ** running == 1 : the animation or search or ajax is running => do nothing
    ** animation_ended == 0 : the animation is running  i.e. the animation has not ended => do nothing
    */

    if (running == 0 && animation_ended == 0) {
        hideElement('.game_instructions_wrapper', animation_duration);
        setTimeout(function () {
            showLoading();
        }, animation_duration);

        // $('#ajax_running').val(1); // set ajax running
        /*
        * Do ten loops to search for new data 
        ** Whey several loops => the data may have taken some time to be written on the files
        ** @example writting in file: storage\app\launched_games_data\user_825005c33898011bc494a6e46ace4a16\device_48.csv
        **
        ** If gets over ten loops => show error message
        */
        var intervelGetBip_step = 0;
        var intervalGetBip = setInterval(function () {

            if (intervelGetBip_step >= 10) {
                clearInterval(intervalGetBip);
                setTimeout(function () {
                    hideLoading();

                }, animation_duration * 4);
                showMessage(2000, "game_alert", search_new_data_timeout)
                setTimeout(function () {
                    hideMessage(2000);
                    $('#ajax_running').val(0);
                }, 6000);

            } else {

                    getBaliseFromBip(intervalGetBip);

            }

            intervelGetBip_step++;
        }, 3000);

    } else if (animation_ended == 1) {
        //ajax call to say animation ended

        // scrollToElement(0, '#top_page_ancre', false, 0);
        // window.location.reload(true);
        resetGame();
    }

}
/*
 * Get balise data from bip after key press.
 **
 ** @param int intervalGetBip
 */
function notifyTeamAnimationEnded(team) {

    var data = { // data to be send through ajax call
        'team_id': team.id,
        'launched_game_id': team.launched_game_id,
        // 'game_victory_type': launched_game.game_victory_type,
        // 'device_id': device_id,
        // 'game_id': game.id
    };

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: notifyTeamAnimationEndedUrl,
        data: data,
        success: function (response) {
            console.log(response);
        }
    });
}
/*
 * Get balise data from bip after key press.
 **
 ** @param int intervalGetBip
 */
function getBaliseFromBip(intervalGetBip) {

    var current_image = $(".current_image").data('current');
    var ajaxTime = new Date().getTime();

   if( $('#ajax_running').val() == 0){
        var data = { // data to be send through ajax call
            'launched_game_id': launched_game.id,
            'game_victory_type': launched_game.game_victory_type,
            'device_id': device_id,
            'game_id': game.id
        };

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'GET',
            url: updateLaunchedGameUrl,
            data: data,
            start: function(){
                $('#ajax_running').val(1);
            },
            success: function (response) {

                var delay = 0;
                $('#ajax_running').val(0);
                clearInterval(intervalGetBip);
                console.log(response);
                // enigma_animation_duration = 200;
                // animation_duration = 200;
                setTimeout(function () {
                    hideLoading();

                    if (response == 'No records found') {
                        showLoading();
                        $('#ajax_running').val(0);
                        return 'ok';
                    }

                    if (response.message && response.message.text != '' && !response.game_ended_all) {

                        showMessage(animation_duration, response.message.type, response.message.text);

                        setTimeout(function () {
                            hideMessage(animation_duration);
                        }, animation_message_duration);
                        clearInterval(intervalGetBip);
                        if (!response.team_game_ended) {
                            $('#ajax_running').val(0);
                        }
                    }

                    if (response.score_percentage || response.score_percentage == 0) {


                        var intervalCheckEnigmaAnimationsOver = setInterval(function () {
                            if ($('#enigmas_animations_ended').val() == 1) {
                                clearInterval(intervalCheckEnigmaAnimationsOver);
                                launchMainAnimation(animation_duration, response);
                                return;
                            }
                        }, 1000);

                        var print_url = $('#print_team_url').val();
                        $('#print_team a').attr('href', print_url + '/' + response.team.team_number);

                        clearInterval(intervalGetBip);
                        $('#ajax_running').val(1);
                        let steps_array = [];

                        //set general team_name
                        //set general time_background_image


                        launchAnimationTime(animation_duration, response);
                        //time out animation_duration *3
                        // setScore(response);

                        setTimeout(function () {
                            showElement('.progress_bar_container', animation_duration);
                            showElement('.enigmas_wrapper', animation_duration);
                        }, animation_duration);
                        //time out animation_duration
                        // if (launched_game_meta.animation == 'full') {
                        steps_array = createStepsEnigmas(response);
                        setTimeout(function () {
                            launchEnigmasAnimation(enigma_animation_duration, steps_array, response)
                        }, animation_duration * 3, steps_array);
                        //time out animation_duration
                        // }

                        //                     var steps_with_duration = 0;
                        //                     $.each(steps_array, function (index, step) {
                        //                         if(step['type']=="show" || step['type']=="hide"){
                        //                             steps_with_duration++;
                        //                         }
                        //                     });

                        //                     steps_with_duration = (8*enigma_animation_duration)*12
                        //                     var timeout = steps_array.length;
                        // console.log(steps_array);
                        // console.log(steps_with_duration);
                        // console.log(enigma_animation_duration);
                        // console.log(animation_duration);
                        // setTimeout(function () {
                        //     // steps_array_main = createStepsMain(response);
                        //     // console.log(steps_array_main);

                        // }, steps_with_duration+ (animation_duration * 3));
                    }

                }, animation_duration * 2);


            },
            error: function (response) {
                console.log('in error');
                console.log(response);
                $('#ajax_running').val(0);
            }
        });
    }
}

function toogleInstructionsContainer(action) {


    // $('.game_instructions_wrapper').hide();
}

/*
 * Launch Enigmas Animations
 **
 ** Specific to Survival
 ** @param object response
 ** @param int animation_duration
 ** @param array steps_array
 **
 ** Scroll to display element
 ** Show display element
 ** Create Interval => each step = animation_duration
 **
 */
function launchEnigmasAnimation(animation_duration, steps_array, response) {
    step = 0;
    // Scroll to enigma wrapper
    // scrollToElement(animation_duration, '.enigmas_wrapper', false);

    $('.enigmas_wrapper').removeClass('hide');
    $('.enigmas_subwrapper').removeClass('hide');

    var number_of_steps = steps_array.length;
    // color_enigma_success = 'green',
    // color_enigma_wrong = 'red',
    // color_enigma_both = 'orange',
    // color_enigma_none = 'gray';

    //each step must last the same for example 1 second
    var intervalId = setInterval(function () {
        var step_data = steps_array[step];

        if (typeof step_data !== 'undefined') {

            // Show and update Html
            if (step_data['type'] == 'html') {
                $(step_data['container_name']).html(step_data['value']);
                showElement(step_data['container_name'], animation_duration);
            }

            // Show element
            if (step_data['type'] == 'show') {
                // scrollToElement(step_data['container_name']);
                // scrollToElement(animation_duration, step_data['container_name'], false, 20);
                var target = typeof (step_data['target']) != "undefined" && step_data['target'] !== null ? step_data['target'] : false;
                // setTimeout(
                //     function() 
                //     {
                showElement(step_data['container_name'], animation_duration, target);
                // }, 1000);

            }
            if (step_data['type'] == 'hide') {
                // scrollToElement(step_data['container_name']);
                // scrollToElement(animation_duration, step_data['container_name'], false, 20);
                var target = typeof (step_data['target']) != "undefined" && step_data['target'] !== null ? step_data['target'] : false;
                // setTimeout(
                //     function() 
                //     {
                hideElement(step_data['container_name'], animation_duration, target);
                // }, 1000);

            }

            // Enigma Success or fail
            if (step_data['type'] == 'enigma_success') {

                // Update background
                enigma_color_and_status = getEnigmaAnswerColor(step_data['value']);
                var target = typeof (step_data['target']) != "undefined" && step_data['target'] !== null ? step_data['target'] : false;

                // setTimeout(
                // function () {
                showElement(step_data['container_name'], animation_duration, target);

                $('#enigma_container_' + step_data['target'] + ' .enigma_answer_image_background').css('background', enigma_color_and_status['color_enigma']);
                switch (step_data['value']) {
                    case 'yes':
                        $('#enigma_container_' + step_data['target'] + ' .enigma_answer_image_icon_good').css('opacity', '1');
                        break;
                    case 'no':
                        $('#enigma_container_' + step_data['target'] + ' .enigma_answer_image_icon_wrong').css('opacity', '1');
                        break;
                    case 'both':
                        $('#enigma_container_' + step_data['target'] + ' .enigma_answer_image_icon_both').css('opacity', '1');
                        break;
                }

                // $('#enigma_container_' + step_data['target'] + ' .enigma_subcontainer').css('border', '4px solid ' + color_enigma);
                // Play sound
                if (enigma_color_and_status['enigma_status'] && $('.sounds #enigma_' + enigma_color_and_status['enigma_status']).length) {
                    $('.sounds #enigma_' + enigma_color_and_status['enigma_status'])[0].play();
                }
                // }, 1000);

            }

            if (step_data['type'] == 'enigma_success_recap') {
                enigma_color_and_status = getEnigmaAnswerColor(step_data['value']);
                $('#enigmas_recap_enigma_container_' + step_data['target'] + ' .enigma_answer_image').addClass('no_blur');
                $('#enigmas_recap_enigma_container_' + step_data['target'] + ' .enigma_answer_image_background').css('background', enigma_color_and_status['color_enigma']);
            }
            if (step_data['type'] == 'show_bonus') {
                $('#game_overscore_image_container_' + step_data['target']).addClass('bonus_showing')
            }
            if (step_data['type'] == 'progress_bar') {
                animateProgressBar(step_data['target'], false);
                // $('#game_overscore_image_container_'+step_data['target']).addClass('bonus_showing')
            }


            // Update total score
            if (step_data['type'] == 'update_score') {
                //get score from element
                var score = parseInt($(step_data['container_name'] + ' ' + step_data['target']).html());
                score_color = getEnigmaAnswerScoreColor(step_data['value']);
                score_floating = step_data['value'];
                if (step_data['value'] > 0) {
                    score_floating = '+' + step_data['value'];
                }
                // $('#floating_enigma_score').html(score_floating);
                // $('#floating_enigma_score').css('color', score_color);
                // showElement('#floating_enigma_score', animation_duration);

                $(step_data['container_name'] + ' ' + step_data['target']).prop('Counter', score).animate({
                    Counter: score + step_data['value']
                }, {
                    duration: animation_duration,
                    // duration: 1000,
                    easing: 'swing',
                    step: function (now) {
                        $(this).text(Math.ceil(now));
                    }
                });

                $('#floating_enigma_score').animate({
                    opacity: 0
                }, animation_duration);
            }

            if (step == number_of_steps - 1) {
                $('#enigmas_animations_ended').val(1);
                clearInterval(intervalId);
                // $('#ajax_running').val(0);
            }

        }
        step++
    }, animation_duration);

}
function launchMainAnimation(animation_duration, response) {
    var margin_left = response.score_percentage;
    if (response.score_percentage < 0) {
        margin_left = 0;
    }

    setTimeout(function () {
        // if ($('#full_image').length) {
        //     $('#full_image')[0].play();
        // }

        // $('#game_main_image').show();
        // showElement('#game_main_image', animation_duration);
        // setScore(response);
        var overlay_width = 100 - margin_left;

        // setTimeout(function () {
        //     $('.game_main_image_overlay').animate({
        //         marginLeft: margin_left + '%',
        //         width: overlay_width + '%'
        //     }, animation_duration * 3);
        //     if ($('#full_image').length) {
        //         $('#full_image')[0].play();
        //     }
        // }, animation_duration);

        // setTimeout(function () {
        //     hideElement('#game_main_image', animation_duration);
        // }, animation_duration * 5);

        // setTimeout(function () {
        $('#final_score_score').html(response.total_score);
        $('#final_score_complete_score').html(game_meta.score_full_game);
        showElement('#final_score_container', animation_duration);
        if (response.level) {
            var html_level = '<h2>Niveau atteint: ' + response.level.name + '</h2><h4>' + response.level.description + '</h4>';
            $('#final_score_level_container').html(html_level);
            showElement('#final_score_level_container', animation_duration);
        }
        showElement('#game_respawn_container', animation_duration);
        // }, animation_duration);
        // clearInterval(intervalMain);
        $('#ajax_running').val(0);
        notifyTeamAnimationEnded(response.team);
        $('#animation_ended').val(1);
        $('#enigmas_animations_ended').val(0);
    }, animation_duration);


    // setTimeout(function () {

    //     var step = 1;
    //     var intervalMain = setInterval(function () {
    //         if (step <= response.enigmas.length) {
    //             var enigma = response.enigmas[step];
    //             var enigma_success = 'yes';
    //             if (enigma.good_answers_times > 0 && enigma.wrong_answers_times > 0) {
    //                 enigma_success = 'both';
    //             } else if (enigma.good_answers_times == 0 && enigma.wrong_answers_times == 0) {
    //                 enigma_success = 'none';
    //             } else if (enigma.wrong_answers_times > 0) {
    //                 enigma_success = 'no';
    //             }

    //             enigma_color_and_status = getEnigmaAnswerColor(enigma_success);

    //             $('#enigmas_recap_enigma_container_' + enigma.number + ' .enigma_answer_image').addClass('no_blur');
    //             $('#enigmas_recap_enigma_container_' + enigma.number + ' .enigma_answer_image').css('background', enigma_color_and_status['color_enigma']);
    //             step++;
    //         } else {
    //             clearInterval(intervalMain);
    //         }
    //     }, 1000);
    //     var step_overscore = 1;
    //     var intervalOverscore = setInterval(function () {
    //         var overscore = response.overscore[step_overscore]
    //         if (response.step_overscore <= response.overscore.length) {
    //             showElement('#game_overscore_image_container_' + step_overscore, animation_duration);
    //         } else {
    //             clearInterval(intervalOverscore);
    //         }
    //     }, 1000);
    //     // $.each(response.enigmas, function (index, enigma) {
    //     //     // $('#enigmas_recap_enigma_container_'+enigma.number +' .enigma_answer_image').removeClass('blur');


    //     //     $('#enigmas_recap_enigma_container_' + enigma.number + ' .enigma_answer_image').addClass('no_blur');
    //     // });
    //     $.each(response.overscore, function (index, overscore) {
    //         if (response.total_score > overscore) {
    //             showElement('#game_overscore_image_container_' + index, animation_duration);
    //         }
    //     });
    // }, animation_duration);
    //showEnigma grid answers




}
/*
 * Launch Main Animation
 **
 ** Specific to Survival
 ** @param int animation_duration
 ** @param int game_complete_score
 **
 ** Scroll to display element
 ** Show display element
 ** Show total score + time + level
 ** Show main image
 ** Show bonuses
 ** Show back to top and print team summary
 **
 */
function launchMainAnimation_old(animation_duration, steps_array_main, response) {
    step = 0;
    // hideElement('#floating_total_score', animation_duration);
    // Scroll to main animation wrapper
    // scrollToElement(animation_duration, '#game_images_container', false, 50);
    // scrollToElement('#game_images_container');

    var number_of_steps = steps_array_main.length;
    var intervalMain = setInterval(function () {

        var step_data = steps_array_main[step];

        if (typeof step_data !== 'undefined') {

            if (step_data['action'] != 'stage') {

                if (step_data['type'] == 'show_time') {
                    var html_time = '<h2><strong>Votre temps:</strong> ' + response.time.time + '</h2>';
                    $('#time_container').html(html_time);
                    showElement(step_data['container_name'], animation_duration);
                }

                if (step_data['type'] == 'show_late_time') {
                    var over_time = '<h2>Malus de retard: -' + response.time.malus + '</h2>';
                    $('#over_time_container').html(over_time);
                    showElement('#over_time_container', animation_duration);
                }

                if (step_data['type'] == 'show_main_image') {
                    showElement('#game_main_image', animation_duration * 2);
                }

                if (step_data['type'] == 'animate_main_image') {

                    setScore(response);

                    var overlay_width = 100 - margin_left;
                    $('.game_main_image_overlay').animate({
                        marginLeft: margin_left + '%',
                        width: overlay_width + '%'
                    }, animation_duration * 3);
                    setTimeout(function () {
                        if ($('#full_image').length) {
                            $('#full_image')[0].play();
                        }
                    }, animation_duration);

                }
                if (step_data['type'] == 'scroll_to') {
                    //    scrollToElement(step_data['container_name']);
                    // scrollToElement(animation_duration, step_data['container_name'], false, step_data['value']);
                    // $('#game_overscore_images_container').show();
                }
                if (step_data['type'] == 'show_overscores') {
                    $('#game_final_score_container_score').html(game_meta.score_full_game);
                    $('#game_final_score_container_game_complete_score').html(game_meta.score_full_game);
                    showElement("#game_overscore_text", animation_duration);
                    showElement("#overscore_score", animation_duration);
                }
                if (step_data['type'] == 'show_overscore_image') {
                    showElement("#game_overscore_image_container_" + step_data['target'], animation_duration);
                    // $("#game_overscore_image_container_" + step_data['target'] + ' img').css('filter', 'blur(0)');
                }

                if (step_data['type'] == 'show_overscore_score') {

                    var score = parseInt($('#floating_overscore_total_score').html());
                    var overscore = step_data['value'];

                    $('#floating_enigma_score').html('+' + overscore);
                    showElement('#floating_overscore_score', animation_duration);

                    // $('#floating_overscore_score').html(overscore);
                    showElement('#floating_overscore_score', animation_duration);
                    $(step_data['container_name'] + ' ' + step_data['target']).prop('Counter', score).animate({
                        Counter: parseInt(step_data['value'])
                    }, {
                        duration: 1000,
                        easing: 'swing',
                        step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });

                    $('#floating_overscore_score').animate({
                        opacity: 0
                    }, animation_duration);


                    var steps_overscore = response.overscore;
                    var overscore_length = Object.keys(steps_overscore).length;
                    var overscore = step_data['value'];
                    var overscore_start;
                    var overscore_end;

                    // if (step_data['target'] == '1') {
                    //     overscore_start = game_meta.score_full_game;
                    // } else {
                    //     overscore_start = response.overscore[1];
                    // }

                    // if (step_data['target'] == overscore_length) {
                    //     overscore_end = response.total_score;
                    // } else {
                    //     overscore_end = response.overscore[step_data['target']];
                    // }

                    // $('#game_final_score_container_score').html(overscore_end);
                    // $('#game_final_score_container_game_complete_score').html(game_meta.score_full_game);

                    // $('#game_final_score_container_score')
                    //     .prop("Counter", overscore_start)
                    //     .animate({
                    //         Counter: $('#game_final_score_container_score').text(),
                    //     }, {
                    //         duration: animation_duration,
                    //         easing: "swing",
                    //         step: function (now) {
                    //             now = Number(Math.ceil(now)).toLocaleString('en');
                    //             $('#game_final_score_container_score').text(now);
                    //         },
                    //     });
                    //     if ($('#sound_overscore_'+step_data['target'] ).length) {
                    //         $('#sound_overscore_'+step_data['target'])[0].play();
                    //     }
                }
                if (step_data['type'] == 'final') {
                    hideElement('#overscore_score', animation_duration);
                    $('#final_score_team').html(response.team.team_name);
                    $('#final_score_score').html(response.total_score);
                    $('#final_score_complete_score').html(response.full_score);
                    if (response.level) {
                        $('#final_score_level_container').show();
                        $('#final_score_level').html(response.level.name);
                        $('#final_score_level_description').html(response.level.description);
                    }

                    showElement('#final_score_container', animation_duration);

                }
                if (step_data['type'] == 'end') {
                    showElement('#game_respawn_container', animation_duration);
                    showElement('#print_team', animation_duration);
                }
                if (step == number_of_steps - 1) {
                    clearInterval(intervalMain);
                    $('#ajax_running').val(0);
                    notifyTeamAnimationEnded(response.team);
                    $('#animation_ended').val(1);
                }
            }
        }
        step++
    }, animation_duration);
}
function launchAnimationTime(animation_duration, response) {

    var time_text = response.time.time;
    time_text = time_text.replace("minutes et", "mn");
    time_text = time_text.replace("secondes", "s");
    if (response.time.malus) {
        $('#time_full_container_malus span').html(response.time.malus);
        $('#time_full_container_malus').removeClass('hide');
        // $('#game_score_container_score').html(-response.time.malus);
        //    setScore(-response.time.malus)
    }
    $('#time_full_container_detail').html(response.time.time);
    $('#survival_team_name_container .survival_team_name_container_text').html(response.team.team_name);


    showElement('#time_full_container', animation_duration);
    showElement('#time_full_container_detail', animation_duration);

    setTimeout(function () {
        if (response.time.malus) {
            setScore(-response.time.malus);
        }
        hideElement('#time_full_container', animation_duration);
        // showElement('#final_score_container', animation_duration);
        $('#time_background_image_text').html(time_text);
        showElement('#time_background_image_text', animation_duration);
    }, animation_duration * 3);
}



function setScore(score) {

    $('#game_score_container_score').html(score);
    $('#game_score_container_score')
        .prop("Counter", 0)
        .animate({
            Counter: $('#game_score_container_score').text(),
        }, {
            duration: animation_duration,
            easing: "swing",
            step: function (now) {
                now = Number(Math.ceil(now)).toLocaleString('en');
                $('#game_score_container_score').text(now);
            },
        });
}

function setScore2(response) {
    var first_score = response.total_score;
    if (response.total_score >= game_meta.score_full_game) {
        first_score = game_meta.score_full_game;
    }
    $('#game_score_container #game_score_container_score').html(first_score);
    $('#game_score_container #game_score_container_game_complete_score').html(game_meta.score_full_game);
    showElement('#game_score_container', animation_duration);
    var margin_left = response.score_percentage;
    if (response.score_percentage < 0) {
        margin_left = 0;
    }

    $('#game_score_container #game_score_container_score')
        .prop("Counter", 0)
        .animate({
            Counter: $('#game_score_container #game_score_container_score').text(),
        }, {
            duration: animation_duration * 3,
            easing: "swing",
            step: function (now) {
                now = Number(Math.ceil(now)).toLocaleString('en');
                $('#game_score_container #game_score_container_score').text(now);
            },
        });
}
function launchMainAnimation2(animation_duration, steps_array_main, response) {


    // scrollToElement(animation_duration, '#game_images_container', false, 100);

    setTimeout(function () {
        $('#game_score_container #game_score_container_score').html(response.total_score);
        $('#game_score_container #game_score_container_game_complete_score').html(game_meta.score_full_game);

        showElement('#game_score_container', animation_duration);


        showElement('#time_container', animation_duration);


        if (response.level) {
            var html_level = '<h2>Niveau atteint: ' + response.level + '</h2>';
            $('#level_container').html(html_level);
            showElement('#level_container', animation_duration);
        }
        showElement('#game_respawn_container', animation_duration);
        // $('.game_instructions_wrapper').hide();


        showElement('#game_images_container', animation_duration);

        var margin_left = response.score_percentage;
        if (response.score_percentage < 0) {
            margin_left = 0;
        }

        $('#game_score_container #game_score_container_score')
            .prop("Counter", 0)
            .animate({
                Counter: $('#game_score_container #game_score_container_score').text(),
            }, {
                duration: 4000,
                easing: "swing",
                step: function (now) {
                    now = Number(Math.ceil(now)).toLocaleString('en');
                    $('#game_score_container #game_score_container_score').text(now);
                },
            });


        var overlay_width = 100 - margin_left;
        $('.game_main_image_overlay').animate({
            marginLeft: margin_left + '%',
            width: overlay_width + '%'
        }, animation_duration);
        setTimeout(function () {
            if ($('.sounds #full_image').length) {
                $('.sounds #full_image')[0].play();
            }
        }, animation_duration);

        setTimeout(function () {
            if (response.overscore) {
                var steps_overscore = response.overscore;
                var overscore_length = Object.keys(steps_overscore).length;
                var count_interval = 1;
                // scrollToElement(animation_duration, '#game_overscore', false, 100);
                $('#game_overscore_images_container').show();
                for (var i = 1; i <= overscore_length; i++) {
                    $("#game_overscore_image_container_" + i).show();
                    $("#game_overscore_image_container_" + i).animate({
                        opacity: 1
                    }, 500);
                    $("#game_overscore_image_container_" + i + ' img').css('filter', 'blur(0)');
                    if ($('.sounds #sound_overscore_' + i).length) {
                        $('.sounds #sound_overscore_' + i)[0].play();
                    }
                }
            }
            $('#animation_ended').val(1);

        }, animation_duration + 200);
        showElement('#game_respawn_container', animation_duration);

        //change url print

        showElement('#print_team', animation_duration);
    }, animation_duration);
}

/*
* Create steps for main animation
**
** Specific to Survival
** @param object response
**
** @return steps_array_main
*/
function createStepsMain(response) {

    var steps_array_main = [];

    //show time
    // steps_array_main = createStep(steps_array_main, '#time_container', 'show_time', false, false, false);

    //show late malus
    // if (response.time.over) {
    //     steps_array_main = createStep(steps_array_main, '#over_time_container', 'show_late_time', false, false, false);
    // }
    //show score up to 100 % + main image

    // steps_array_main = createStep(steps_array_main, '#game_image', 'show_main_image', 2, false, false);
    // steps_array_main = createStep(steps_array_main, '#game_image', 'animate_main_image', 3, false, false);

    //show oversore + add points to score
    if (response.overscore) {

        // steps_array_main = createStep(steps_array_main, '#game_overscore', 'scroll_to', false, false, false, 0);
        // steps_array_main = createStep(steps_array_main, '#game_overscore', 'show_overscores', false, false, false);

        $.each(response.overscore, function (index, overscore) {
            // steps_array_main = createStep(steps_array_main, '#game_overscore_image_container_' + index, 'scroll_to', false, false, false, 0);
            steps_array_main = createStep(steps_array_main, '#game_overscore', 'show_overscore_image', false, false, index, overscore);
            // steps_array = createStep(steps_array, '#enigmas_grid_score', 'update_score', false, false, '#floating_total_score', enigma.good_answers_score - enigma.wrong_answers_score);

            steps_array_main = createStep(steps_array_main, '#game_overscore', 'show_overscore_score', false, false, '#floating_overscore_total_score', overscore);
        });
        //show final score
        // steps_array_main = createStep(steps_array_main, '#final_score', 'show_final_score', false, false, false);
    }
    //show level
    steps_array_main = createStep(steps_array_main, '#final_score', 'show_level_score', false, false, false);
    //show final
    // steps_array_main = createStep(steps_array_main, '#final_score_container', 'scroll_to', false, false, false, 0);
    steps_array_main = createStep(steps_array_main, '#final_score_container', 'final', false, false, false);
    steps_array_main = createStep(steps_array_main, '#final_score_container', 'end', false, false, false);
    return steps_array_main;
}

/*
* Create animations steps
**
** Specific to Survival
** @param object response
**
** @return steps_array
*/
function createStepsEnigmas(response) {
    var steps_array = [];
    var enigmas = response.enigmas;

    // Show team name
    steps_array = createStep(steps_array, '.team_name_container', 'html', false, false, false, response.team.team_name);
    steps_array = createStep(steps_array, '#enigmas_grid_wrapper', 'show', false, false, false, false);

    var current_score = 0;
    if (response.time.malus) {
        current_score = -response.time.malus;
    }
    $(enigmas).each(function (index, enigma) {
        var container_name = '#enigma_container_' + enigma.number;

        //Show enigma title
        steps_array = createStep(steps_array, container_name, 'show', false, false);
        steps_array = createStep(steps_array, container_name, 'show', false, false, '.enigma_text');

        //Show enigma answer
        steps_array = createStep(steps_array, container_name, 'show', false, false, '.enigma_answer');

        //Border change according to correctness of answer
        var enigma_success = 'yes';
        if (enigma.good_answers_times > 0 && enigma.wrong_answers_times > 0) {
            enigma_success = 'both';
        } else if (enigma.good_answers_times == 0 && enigma.wrong_answers_times == 0) {
            enigma_success = 'none';
        } else if (enigma.wrong_answers_times > 0) {
            enigma_success = 'no';
        }


        steps_array = createStep(steps_array, container_name, 'enigma_success', false, false, enigma.number, enigma_success);
        steps_array = createStep(steps_array, '#enigmas_recap_enigma_container_' + enigma.number, 'enigma_success_recap', false, false, enigma.number, enigma_success);

        current_score += enigma.good_answers_score - enigma.wrong_answers_score;

        $.each(response.overscore, function (index, overscore) {
            if (current_score >= parseInt(overscore) + parseInt(response.full_score)) {
                if (!$('#game_overscore_image_container_' + index).hasClass('bonus_to_show')) {
                    $('#game_overscore_image_container_' + index).addClass('bonus_to_show')
                    steps_array = createStep(steps_array, '#game_overscore_image_container_' + index, 'show_bonus', false, false, index, enigma_success);
                }
            }
        })

        //Update score right column
        steps_array = createStep(steps_array, '.team_score_container', 'update_score', false, false, '#game_score_container_score', enigma.good_answers_score - enigma.wrong_answers_score);
        if (current_score <= response.full_score) {
            if (current_score <= 0) {
                steps_array = createStep(steps_array, '#step_container_1', 'progress_bar', false, false, 1, current_score);
            } else if (current_score > 0) {
                steps_array = createStep(steps_array, '#step_container_' + current_score, 'progress_bar', false, false, current_score, current_score);
            }

        } else {
            steps_array = createStep(steps_array, '#step_container_' + response.full_score, 'progress_bar', false, false, response.full_score, response.full_score);
        }
        steps_array = createStep(steps_array, container_name, 'hide', false, true, false);
    });

    steps_array = createStep(steps_array, '', 'wait', false, false, false);
    return steps_array;
}

/*
 * Get score color from engima answer to element.
** 
** @param string step_data_value
**
** @return string color_score
**
 */
function getEnigmaAnswerScoreColor(step_data_value) {
    var color_score = 'green';
    if (step_data_value < 0) {
        color_score = 'red';
    } else if (step_data_value == 0) {
        color_score = 'gray';
    }

    return color_score;
}

/*
 * Get colors from engima answer to element.
** 
** @param string step_data_value
**
** @return array response
**
 */
function getEnigmaAnswerColor(step_data_value) {
    var color_enigma_success = '#00800045',
        color_enigma_wrong = '#ff000036',
        color_enigma_both = '#ffa5004a',
        color_enigma_none = '#80808063';
    var color_enigma;
    var enigma_status;
    switch (step_data_value) {
        case 'yes':
            color_enigma = color_enigma_success;
            enigma_status = 'success';
            break;
        case 'no':
            color_enigma = color_enigma_wrong;
            enigma_status = 'error';
            break;
        case 'both':
            color_enigma = color_enigma_both;
            enigma_status = 'no_answer';
            break;
        default:
            color_enigma = color_enigma_none;
            enigma_status = 'no_answer';
    }

    var response = [];
    response['color_enigma'] = color_enigma;
    response['enigma_status'] = enigma_status;

    return response;
}




/*
 * Css adjustments for main image.
 */
function imageLoad() {
    var onImgLoad = function (selector, callback) {
        $(selector).each(function () {
            if (this.complete || /*for IE 10-*/ $(this).height() > 0) {
                callback.apply(this);
            } else {
                $(this).on('load', function () {
                    callback.apply(this);
                });
            }
        });
    };

    var right_column_height = $('#right_column_survival').height(),
        right_column_width = $('#right_column_survival').width(),
        enigmas_grid_wrapper_width = $('#enigmas_grid_wrapper').width(),
        team_name_height = $('#survival_team_name_container').outerHeight(true),
        artefacts_container_height = $('#artefacts_container').outerHeight(true),
        enigmas_recap_height = right_column_height - (team_name_height + artefacts_container_height),
        enigma_recap_height = enigmas_recap_height / 4 - 10,
        enigma_recap_width = right_column_width / 3 - 10;

    if (enigma_recap_width < enigma_recap_height) {
        enigma_recap_height = enigma_recap_width;
    }

    $.each($('.enigmas_recap_enigma_container'), function (index, element) {

        $(element).height(enigma_recap_height);
        $(element).width(enigma_recap_height);

        $(element).find('.enigma_answer_image img').height(enigma_recap_height);
        $(element).find('.enigma_answer_image img').width(enigma_recap_height);
    });


    $.each($('.enigma_wrapper'), function (index, element) {
        $(element).height(right_column_height);
        $(element).width(enigmas_grid_wrapper_width);
    });

    $.each($('.enigma_container'), function (index, element) {
        var container_height = $(element).outerHeight(true);
        var text_height = $(element).find('.enigma_text').outerHeight(true);
        var image_height = container_height - text_height;

        $(element).height(image_height);
        $(element).width(image_height);
        $(element).find('.enigma_answer_image_background').height(image_height - 30);
        $(element).find('.enigma_answer_image_background').width(image_height - 30);
        $(element).find('.enigma_answer_image_icon').height(image_height);
        $(element).find('.enigma_answer_image_icon').width(image_height);
        $(element).find('.enigma_answer').height(image_height);
        $(element).find('.enigma_answer').width(image_height);
        $(element).find('.enigma_answer_image').height(image_height);
        $(element).find('.enigma_answer_image img').height(image_height);
        $(element).width(container_height);




        //get div height
        //get text height
        //set img height

        // onImgLoad('#game_images_container .game_main_image img', function () {

        //     var main_image_width = $('#game_images_container .game_main_image img').width();
        //     var main_image_height = $('#game_images_container .game_main_image img').height();

        //     $('#game_images_container .game_main_image_overlay').width(main_image_width);
        //     $('#game_images_container .game_main_image_overlay').height(main_image_height);
        //     $('#game_images_container .game_main_image_overlay_container').width(main_image_width);
        //     $('#game_images_container .game_main_image_overlay_container').height(main_image_height);

        // });
    })
    onImgLoad('#game_images_container .game_main_image img', function () {

        var main_image_width = $('#game_images_container .game_main_image img').width();
        var main_image_height = $('#game_images_container .game_main_image img').height();

        $('#game_images_container .game_main_image_overlay').width(main_image_width);
        $('#game_images_container .game_main_image_overlay').height(main_image_height);
        $('#game_images_container .game_main_image_overlay_container').width(main_image_width);
        $('#game_images_container .game_main_image_overlay_container').height(main_image_height);

    });
}
