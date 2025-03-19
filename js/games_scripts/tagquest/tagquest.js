var game_url;
var launched_game;
var launched_game_id;
var device_id;

jQuery(document).ready(function ($) {
    game_url = $('#game_url').val(),
        launched_game = $.parseJSON($('#launched_game').val()),
        launched_game_id = launched_game.id,
        device_id = $('#device_id').val();


    // setTimeout(function() { 
    setImagesDimensions();
    // }, 3000);
    $(window).on('resize', function () {
        setImagesDimensions();
    });

    // toggleRankings();

    var intervalNewBip = setInterval(function () {
        if ($('#ajax_running').val() == 0) {
            checkNewBip();
        }
    }, 3000);




});

/*
 * Check if a new bip has been detected
 */
function checkNewBip() {
    var game = $.parseJSON($('#game').val()),
        game_meta = $.parseJSON($('#game_meta').val());


    var data = {
        'launched_game_id': launched_game_id,
        'game_id': game.id,
        'device_id': device_id,
        'malus_late_value': game_meta['malus_late_value'],
        'malus_value': game_meta['malus_value']
    };
    console.log(data);
    var ended = false;

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: game_url + '/checkNewBip',
        data: data,
        success: function (response) {
            console.log('Réponse checkNewBip');
            console.log(response);
            if (response) {
                if (response == 'ended') {
                    $('#ajax_running').val(1);
                    window.location.href = game_url + '/launched/final/' + launched_game.game_type + '/' + launched_game.id;
                } else {
                    $('#ajax_running').val(1);
                    showLoading();
                    getBaliseFromBip();
                }


            } else {
                $('#ajax_running').val(0);
            }

        },
        error: function (data) {
            console.log('A lire par Coralie 2: ligne en dessous');
            console.log(data);
        }
    });

    return ended;

}


function getBaliseFromBip() {

    var game = $.parseJSON($('#game').val()),
        game_meta = $.parseJSON($('#game_meta').val()),
        current_image = $(".current_image").data('current'),
        data = {
            'launched_game_id': launched_game_id,
            'device_id': device_id,
            'game_id': game.id
        },
        ajaxTime = new Date().getTime();

    $.ajaxSetup({
        headers: { 
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: game_url + '/updateLaunchedGame',
        data: data,
        success: function (response) {

            console.log(response);
            var delay = 0,
                animation_image_duration = $('#animation_image_duration').val() * 1000,
                animation_message_duration = $('#animation_message_duration').val() * 1000;
                // animation_message_duration = ('animation_message_duration' in launched_game_meta ? launched_game_meta.animation_message_duration : 2) * 1000;
console.log(animation_image_duration);
            response.update = true;
            if (response.error || response.is_cheating || response.team_game_ended) {
                hideLoading();

                setTimeout(function () {
                    showMessage(animation_message_duration, response.message.type, response.message.text);
                }, 1000);

                setTimeout(function () {
                    hideMessage(animation_message_duration);
                }, 1000 + animation_message_duration * 2);

                $('#ajax_running').val(0);
            }
            else if (response.update) {
                hideLoading();

                steps_array = createSteps(response);
                console.log(steps_array);
                $('#team_' + response.team.team_number + '_container .score_team .score_team_span').html(response.score.total_score);

                //update team data ex if from overview admin
                updateTeamsData(response);
                updateImagesDisplay(response);
                launchAnimation(animation_image_duration, animation_message_duration, steps_array, response);

                $(response.teams).each(function (index, team) {
                    if (team.id != response.team.id) {
                        $(team.images_retreived).each(function (index_image, image) {
                            if (image.times > 0) {
                                $('#team_' + team.team_number + '_container .team_advancement_main_image_' + index_image).addClass('no_gray_filter');
                            }
                        })
                    }
                });
            }

        },
        error: function (response) {
            console.log('in error');
            console.log(response);
        }
    });
}

function updateImagesDisplay(response) {
    $.each(response.score.images, function (team_number, image) {
        if (image.times != 0) {
            $('#team_' + response.team.team_number + '_container .team_advancement_main_image_' + team_number).addClass('no_gray_filter');
        }

    })
}

function updateTeamsData(response) {
    var all_teams_data = response.all_teams_data;

    $.each(all_teams_data, function (team_number, team) {
        //update malus
        $('#team_' + team_number + '_container .image_malus .malus_times span').html(team.malus.times);
        $('#team_' + team_number + '_container .image_malus .score_malus span').html(team.malus.score);

        //update images
        $.each(team.images, function (image_number, image) {
            $('#team_' + team_number + '_container .team_advancement_main_image_' + image_number +
                ' .main_image_times_retreived span').html(image.times);
            $('#team_' + team_number + '_container .team_advancement_main_image_' + image_number +
                ' .main_image_times_retreived_score span').html(image.score);
            //change opacity if times > 0
            if (image.times > 0) {
                $('#team_' + team_number + '_container .team_advancement_main_image_' +
                    image_number).addClass('no_gray_filter');
            }
        });

    });

}


/*
 * Launch animation from steps array
 **
 ** @param object respons
 */
function launchAnimation(animation_image_duration, animation_message_duration, steps_array, response) {

    step = 0;

    showElement('#team_' + response.team.team_number + '_container', animation_image_duration / 2);

    //hide teams ranking
    // hideElement('.teams_ranking_wrapper', animation_image_duration / 2)

    var number_of_steps = steps_array.length,
        count_image_division = 1;

    //each step must last the same ie 1 second
    var intervalId = setInterval(function () {

        var step_data = steps_array[step];

        if (step_data['type'] == 'error') {
            if (step_data['action'] == 'show') {
                showMessage(animation_message_duration, response.message.type, response.message.text);
            }
            if (step_data['action'] == 'hide') {
                hideMessage(animation_message_duration);
            }
        }
        if (step_data['type'] == 'game_ended') {
            if (step_data['action'] == 'show') {
                $('.game_timer').hide();
                $('#taghunter_success_sound')[0].play();
                showMessage(animation_message_duration, response.message.type, response.message.text);
            }
        }

        if (step_data['type'] == 'team_game_ended') {
            if (step_data['action'] == 'show') {
                $('#taghunter_success_sound')[0].play();
                showMessage(animation_message_duration, response.message.type, response.message.text);
            }
            if (step_data['action'] == 'hide') {
                hideMessage(animation_message_duration);
            }
        }
        if (step_data['type'] == 'cheating') {
            if (step_data['action'] == 'show') {
                $('#taghunter_error_sound')[0].play();
                showMessage(animation_message_duration, response.message.type, response.message.text);
            }
            if (step_data['action'] == 'hide') {
                hideMessage(animation_message_duration);
            }
        }
        if (step_data['type'] == 'image_already_retreived') {
            if (step_data['action'] == 'show') {
                $('#taghunter_error_sound')[0].play();
                showMessage(animation_message_duration, response.message.type, response.message.text);
            }
            if (step_data['action'] == 'hide') {
                hideMessage(animation_message_duration);
            }
        }
        if (step_data['type'] == 'cheating') {
            if (step_data['action'] == 'show') {
                $('#taghunter_error_sound')[0].play();
                showMessage(animation_message_duration, response.message.type, response.message.text);
            }
            if (step_data['action'] == 'hide') {
                hideMessage(animation_message_duration);
            }
        }

        if (step_data['type'] == 'show_malus') {

            if (step_data['action'] == 'show') {
                $('#taghunter_malus_sound')[0].play();
                $('.taghunter_malus_image_container').animate({
                    opacity: 1
                }, animation_image_duration);
            }
            $('#team_' + response.team.team_number + '_container .tagquest_malus_balise_container .image_malus img').css('filter', 'grayscale(0)');
            $('#team_' + response.team.team_number + '_container .tagquest_malus_balise_container .malus_square_times span').html(response.malus.total_malus);
            $('#team_' + response.team.team_number + '_container .tagquest_malus_balise_container .malus_square_points .malus_square_points_span').html(response.malus.score_malus);

            if (step_data['action'] == 'hide') {
                $('.taghunter_malus_image_container').animate({
                    opacity: 0
                }, animation_image_duration);
            }
        }
    
        if (step_data['type'] == "show_late_malus") {

            if (step_data['action'] == 'show') {
                showElement('.taghunter_time_late_malus_image_container', animation_image_duration);
                $('#taghunter_late_malus_malus_sound')[0].play();
                $('#team_' + response.team.team_number + '_container .tagquest_late_malus_container .image_late_malus  img').css('filter', 'grayscale(0)');
                $('#team_' + response.team.team_number + '_container .tagquest_late_malus_container  .malus_square_times span').html(response.score.malus.times_late_malus);
                $('#team_' + response.team.team_number + '_container .tagquest_late_malus_container  .malus_square_points .malus_square_points_span').html(response.score.malus.total_late_malus_points);
            }


            if (step_data['action'] == 'hide') {
                hideElement('.taghunter_time_late_malus_image_container', animation_image_duration);
            }
        }

        if (step_data['type'] == 'show_image_division') {
            var balise_data = response.expected[step_data['target']];
            var position = balise_data.position;

            if (step_data['action'] == 'show') {
                showElement('.taghunter_image_' + response.expected[step_data['target']]['image'], animation_image_duration, '.image_position_' + position);
                count_image_division++;
            }

        }

        if (step_data['type'] == "hide_image_divisions") {
            var image_id = step_data['target'];
            var images_divisions = $('.taghunter_image_' + image_id + ' .taghunter_images .taghunter_image_division');

            $(images_divisions).each(function (index, division) {
                $(division).animate({
                    opacity: 0,
                }, animation_image_duration);
            })
        }

        if (step_data['type'] == 'show_full_image') {

            var balises = response.balises;

            if (step_data['action'] == 'show') {

                showElement('.taghunter_image_' + step_data['target'] + ' .taghunter_full_image', animation_image_duration);
            }
            if ($('#taghunter_image_' + response.image.image_number + '_sound')) {
                $('#taghunter_image_' + response.image.image_number + '_sound')[0].play();
            }
            $('#team_' + response.team.team_number + '_container .team_advancement_main_image_' + response.image.image_number + ' img').css('filter', 'grayscale(0)');
            $('#team_' + response.team.team_number + '_container .team_advancement_main_image_' + response.image.image_number + ' .main_image_times_retreived_score .main_image_times_retreived_score_span').html(response.score.images[response.image.image_number].score);
            $('#team_' + response.team.team_number + '_container .team_advancement_main_image_' + response.image.image_number + ' .main_image_times_retreived span').html(response.score.images[response.image.image_number].times);
            $('#team_' + response.team.team_number + '_container .team_combos_total_points span').html(response.score.combo.combos_score);

            if (launched_game.game_victory_type == 'score') {

                var combos = $.parseJSON($('#combos').val());

                $.each(combos, function (index, combo) {
                    $('#team_' + response.team.team_number + '_container .tagquest_combo_' + index + '_container .combo_times').html(response.score.combo[index].times);
                    $('#team_' + response.team.team_number + '_container .tagquest_combo_' + index + '_container .combo_points').html(response.score.combo[index].score);
                });
            }

            if (step_data['action'] == 'hide') {
                $('.taghunter_image_division').each(function () {
                    $(this).css('opacity', 0);
                });
                $('.taghunter_image_' + step_data['target'] + ' .taghunter_full_image').animate({
                    opacity: 0
                }, animation_image_duration * 3);
            }
        }

        if (step_data['type'] == 'show_level_up') {
            if (step_data['action'] == 'show') {
                showMessage(animation_message_duration, response.levelup.message.type, response.levelup.message.text);
            }
            if (step_data['action'] == 'hide') {
                hideMessage(animation_message_duration);
            }
        }

        if (step_data['type'] == 'show_team_game_ended_first') {
            if (step_data['action'] == 'show') {
                $('#taghunter_success_sound')[0].play();
                showMessage(animation_message_duration, response.message.type, response.message.text);
            }
            if (step_data['action'] == 'hide') {
                hideMessage(animation_message_duration);
            }
        }

        if (step == number_of_steps - 1) {
            //hide team details
            $('#team_' + response.team.team_number + '_container').animate({
                opacity: 0
            }, animation_message_duration);

            clearInterval(intervalId);
            $('#ajax_running').val(0);
        }
        step++
    }, animation_image_duration);

}

/*
 * Create steps
 **
 ** @param object respons
 */
function createSteps(response) {

    var steps_array = [],
        step = 0;

    if (response.error) {
        steps_array = createStep(steps_array, false, 'error', true, true, false);
        return steps_array;
    }
    // if (response.game_ended) {
    //     steps_array = createStep(steps_array, false, 'game_ended', true, false, false);
    //     return steps_array;
    // }
    if (response.team_game_ended) {
        steps_array = createStep(steps_array, false, 'team_game_ended', true, true, false);
        return steps_array;
    }
    if (response.is_cheating) {
        steps_array = createStep(steps_array, false, 'cheating', true, true, false);
        return steps_array;
    }
    if (response.image_already_retreived) {
        steps_array = createStep(steps_array, false, 'image_already_retreived', true, true, false);
        return steps_array;
    }

    if (launched_game.game_victory_type == 'score' && response.score.malus.times_late_malus) {
        steps_array = createStep(steps_array, 'times_late_malus', 'show_late_malus', true, true, false);
    }

    if (response.malus.has_malus > 0) {
        steps_array = createStep(steps_array, 'malus', 'show_malus', true, true, false);
    }

    var count = 1;

    // show images divisions
    $.each(response.puce_data_on_key.data_on_key, function (index, element) {
        steps_array = createStep(steps_array, 'image_division', 'show_image_division', false, false, element.id_balise);
    });

    steps_array = createStep(steps_array, 'image_division', 'hide_image_divisions', false, true, response.image.image_number);

    if (response.image.complete) {
        steps_array = createStep(steps_array, 'image_full', 'show_full_image', false, true, response.image.image_number);
    }
    if (response.levelup.is_level_up) {
        steps_array = createStep(steps_array, 'levelup', 'show_level_up', true, true, false);
    }

    if (response['team_game_ended_first']) {
        steps_array = createStep(steps_array, 'team_game_ended_first', 'show_team_game_ended_first', true, true, false);
    }

    steps_array = createStep(steps_array, 'wait', false, false, false);
    steps_array = createStep(steps_array, 'wait', false, false, false);

    return steps_array;
}

/*
 * Set the dimensions for images divisions and full + wrapper
 */
function setImagesDimensions() {

    // dimensions ratios
    //for
    // var left_column_width_default                 = 318,                                                                                 // with margin 10
    var left_column_width_default = 250,                                                                                // with margin 10
        left_column_element_default = 308,
        malus_default_heigth = 199,
        malus_rectangle_default_heigth = 100,
        late_malus_default_heigth = 199,
        combos_default_heigth = 222,
        timer_default_heigth = 115,
        window_width_default = 1680,
        total_left_column_elements_default_height = timer_default_heigth + late_malus_default_heigth + malus_default_heigth + 3 * 15,   //15 being margin top
        team_advancement_title_default_height = 130,
        team_advancement_square_default_height = 60,
        combo_column_default_heigth = 110,
        combo_column_default_margin = 10,
        combo_column_default_padding = 30,
        left_column_default_font_size = 15,
        right_column_default_font_size = 18,
        team_score_default_font_size = 33,
        pts_element_default_font_size = 10,
        timer_default_font_size = 40,
        timer_default_line_height = 40,
        timer_late_text_default_font_size = 16,
        timer_late_default_font_size = 32,
        timer_late_default_line_height = 30,
        window_width = $(window).width(),
        window_height = $('.team_results').first().height(),
        left_column_width = window_width * left_column_width_default / window_width_default,
        ratio = left_column_width / left_column_width_default,
        timer_heigth = timer_default_heigth * ratio,
        malus_heigth = ratio * malus_default_heigth,
        malus_rectangle_heigth = ratio * malus_rectangle_default_heigth,
        late_malus_heigth = ratio * late_malus_default_heigth,
        combos_heigth = ratio * combos_default_heigth,
        combo_column_heigth = ratio * combo_column_default_heigth,
        combo_column_margin = ratio * combo_column_default_margin,
        team_advancement_title_height = ratio * team_advancement_title_default_height,
        team_advancement_images_liste_height = window_height - team_advancement_title_height - 30 - 30 - 5 - 15,
        team_advancement_image_container_height = team_advancement_images_liste_height / 6 - 5,
        team_advancement_square_height = ratio * team_advancement_square_default_height,
        combo_column_padding = ratio * combo_column_default_padding +5,
        left_column_font_size = ratio * left_column_default_font_size,
        right_column_font_size = ratio * right_column_default_font_size,
        pts_element_font_size = ratio * pts_element_default_font_size,
        team_score_font_size = ratio * team_score_default_font_size,
        timer_font_size = timer_default_font_size * ratio,
        timer_line_height = timer_default_line_height * ratio,
        timer_late_text_font_size = timer_late_text_default_font_size * ratio,
        timer_late_font_size = timer_late_default_font_size * ratio,
        timer_late_line_height = timer_late_default_line_height * ratio;


    $.each($('.tagquest_left_column'), function (index, element) {
        $(element).css('font-size', pts_element_font_size);
    });
    $.each($('.malus_square'), function (index, element) {
        $(element).css('font-size', left_column_font_size);
    });
    $.each($('.tagquest_combo_times'), function (index, element) {
        $(element).css('font-size', left_column_font_size);
    });
    $.each($('.tagquest_combo_points'), function (index, element) {
        $(element).css('font-size', left_column_font_size);
    });
    $.each($('.team_image_square '), function (index, element) {
        $(element).css('font-size', right_column_font_size);
    });
    $.each($('.score_team '), function (index, element) {
        $(element).css('font-size', team_score_font_size);
    });
    $.each($('.tagquest_left_column'), function (index, element) {
        $(element).width(left_column_width);
    });
    $.each($('.tagquest_right_column'), function (index, element) {
        $(element).width(left_column_width);
    });
    $.each($('.tagquest_fake_timer_wrapper'), function (index, element) {
        $(element).height(timer_heigth);
        $(element).width(left_column_width);
    });

    $.each($('.tagquest_malus_wrapper'), function (index, element) {
        $(element).css('min-height', malus_heigth + 'px');
        $(element).height(malus_heigth);
        $(element).width(left_column_width);
    });

    $.each($('.tagquest_late_malus_container'), function (index, element) {
        $(element).css('min-height', late_malus_heigth + 'px');
        $(element).height(late_malus_heigth);
        $(element).width(left_column_width);
    });

    $.each($('.element_content'), function (index, element) {
        $(element).css('min-height', malus_rectangle_heigth + 'px');
        $(element).css('height', malus_rectangle_heigth);
    });

    $.each($('.tagquest_combos_container'), function (index, element) {
        $(element).height(combos_heigth);
        $(element).width(left_column_width);
    });

    $.each($('.combos_padding'), function (index, element) {
        $(element).height(combos_heigth);
        $(element).width(left_column_width);
        $(element).css('padding-bottom', combo_column_padding);

    });
    $.each($('#main_tagquest_timer  .timer_tagquest li span'), function (index, element) {
        $(element).css('font-size', timer_font_size);
        $(element).css('line-height', timer_line_height + 'px');

    });
    $.each($('#main_tagquest_timer  .timer_tagquest li.seperator'), function (index, element) {
        $(element).css('font-size', timer_font_size);
        $(element).css('line-height', timer_line_height + 'px');

    });
    $.each($('#taquest_timer_late_wrapper  .timer_tagquest li span'), function (index, element) {
        $(element).css('font-size', timer_late_font_size);
        $(element).css('line-height', timer_late_line_height + 'px');
    });

    $('#taquest_timer_late_wrapper').css('font-size', timer_late_text_font_size);
    $('#tagquest_timer').innerHeight(timer_heigth);
    $('#main_tagquest_timer').innerHeight(timer_heigth);
    $('#taquest_timer_late_wrapper').innerHeight(timer_heigth);
    $('#tagquest_timer').width(left_column_width);
    $.each($('.tagquest_combo_container '), function (index, element) {
        $(element).height(combo_column_heigth);
        $(element).css('margin-bottom', combo_column_margin);

    });

    $.each($('.team_advancement_title'), function (index, element) {
        $(element).height(team_advancement_title_height);
        $(element).width(left_column_width);
    });

    var smallest_main_image_name_height = false;
    $.each($('.main_image_name_div'), function (index, element) {
        if(index == 1){
            smallest_main_image_name_height = parseFloat($(element).css('font-size'));
        }
    });


    $.each($('.main_image_name_div'), function (index, element) {
   
        if(  $(element).height() > smallest_main_image_name_height*2){
            var next = false;
            for(var i = 1; i< 100 ; i++){
                if(!next){
                    var font_size = parseFloat($(element).css('font-size'));
                    new_font_size = font_size - 1;
                    $(element).css('font-size', new_font_size );
                    if($(element).height() < smallest_main_image_name_height *2){
                        next = true;  
                    }
                }
       
            }
        }
    });
    $.each($('.malus_square'), function (index, element) {
        $(element).css('font-size', left_column_font_size);
    });
    $.each($('.tagquest_combo_times'), function (index, element) {
        $(element).css('font-size', left_column_font_size);
    });
    $.each($('.tagquest_combo_points'), function (index, element) {
        $(element).css('font-size', left_column_font_size);
    });
    $.each($('.team_image_square '), function (index, element) {
        $(element).css('font-size', right_column_font_size);
    });
    $.each($('.score_team '), function (index, element) {
        $(element).css('font-size', team_score_font_size);
    });
    $.each($('.tagquest_left_column'), function (index, element) {
        $(element).width(left_column_width);
    });
    $.each($('.tagquest_right_column'), function (index, element) {
        $(element).width(left_column_width);
    });
    $.each($('.tagquest_fake_timer_wrapper'), function (index, element) {
        $(element).height(timer_heigth);
        $(element).width(left_column_width);
    });
    $.each($('.tagquest_malus_wrapper'), function (index, element) {
        $(element).height(malus_heigth);
        $(element).width(left_column_width);
    });
    $.each($('.tagquest_late_malus_container'), function (index, element) {
        $(element).height(late_malus_heigth);
        $(element).width(left_column_width);
    });
    $.each($('.tagquest_combos_container'), function (index, element) {
        $(element).height(combos_heigth);
        $(element).width(left_column_width);
    });
    $.each($('.combos_padding'), function (index, element) {
        $(element).height(combos_heigth);
        $(element).width(left_column_width);
        $(element).css('padding-bottom', combo_column_padding);


    $.each($('.team_advancement_images_liste'), function (index, element) {
        $(element).height(team_advancement_images_liste_height);
        $(element).width(left_column_width);
    });
    $.each($('.team_advancement_image_container'), function (index, element) {
        $(element).height(team_advancement_image_container_height);
        $(element).width(left_column_width);
    });
    $.each($('.team_image_square '), function (index, element) {
        $(element).height(team_advancement_square_height);
        $(element).width(team_advancement_square_height);
    });
    $.each($('.team_image_square img'), function (index, element) {

        $(element).width(team_advancement_square_height - 8);
        $(element).height(team_advancement_square_height - 8);
    });

    var main_image_height = $('.taghunter_full_image img')[0].height,
        // rigth_column_width        = $('.tagquest_right_column').first().outerWidth(),
        // left_column_width         = $('.tagquest_left_column').first().outerWidth(),
        center_column_padding_top = $('.tagquest_center_column').first().innerHeight() - $('.tagquest_center_column').first().height(),
        team_name_height = $('.tagquest_team_name_container').first().height(),
        full_image_name_height = $('.full_image_name').first().outerHeight(),
        images_container_height = window_height - center_column_padding_top - team_name_height - 15,
        center_colum_width = window_width - left_column_width - left_column_width - 15;



    // $.each($('.element_div'), function (index, element) {
    //     console.log('element');
    //     console.log($(element));
    //     var element_image = $(element).find('img.element_background_image').first();
    //     console.log(element_image);



    //     //           $(element_image).load(function() {
    //     //                          var element_height = $(this).find('img.element_background_image').first().outerHeight(true);
    //     //     console.log(element_height);
    //     //              $(element).height(element_height);
    //     // $(this).find('.element_content').height(element_height);
    //     // $(this).find('.element_content').css('min-height',element_height);
    //     // $(this).css('min-height',element_height);


    //     //            })
    //     // $(element_image).load       
    //     //     var element_height = $(element).find('img.element_background_image').first().outerHeight(true);
    //     //     console.log(element_height);
    //     //              $(element).height(element_height);
    //     // $(element).find('.element_content').height(element_height);
    //     // $(element).find('.element_content').css('min-height',element_height);

    // });



    $.each($('.taghunter_image_container'), function (index, element) {
        $(element).width(center_colum_width);
    });
    $.each($('.taghunter_images_container'), function (index, element) {
        $(element).width(images_container_height);
    });
    $.each($('.taghunter_images'), function (index, element) {
        $(element).width(images_container_height);
    });
    $.each($('.taghunter_image_division'), function (index, element) {
        $(element).height(images_container_height / 2);
        $(element).width(images_container_height / 2);

    });
    $.each($('.taghunter_full_image img'), function (index, element) {
        $(element).height(images_container_height - full_image_name_height);
        $(element).width(images_container_height - full_image_name_height);

    });
    $.each($('.taghunter_images_element_container'), function (index, element) {
        $(element).height(images_container_height);
        $(element).width(center_colum_width);
    });




    var team_name_height = $('.team_name_container').first().height();
    var main_image_height = $(window).height() - team_name_height - $('.full_image_name').first().height();
}
// console.log( $(window).height() );

// console.log(rigth_column_width);
// console.log(rigth_column_width);

// "6;2024-06-05 14:45:22;1889070;;1;We; 14:47:00;;;;1;We; 14:47:00;;;;;;;;;;;;;;1889070;Chem. Traverse;;;;;î;;;;;;;;;;;;4;36;We; 14:46:28;45;We; 14:46:21;47;We; 14:46:01;39;We; 14:46:29"


// dfsfdssdf
// $('.team_name_container').outerWidth($(window).width() - rigth_column_width - left_column_width);
// $('.team_name_container').css('left', left_column_width);
// $('.full_image_name').width(main_image_height);
// $('.taghunter_image_container').height($(window).height() - team_name_height);
//     $('.taghunter_image_container').css('margin-top', team_name_height + 2);
// $('.taghunter_full_image img').width(main_image_height);
// $('.taghunter_full_image img').height(main_image_height);
// $('.taghunter_image_division_empty').width(main_image_height/2);
// $('.taghunter_image_division_empty').height(main_image_height/2);
// $('.taghunter_image_division img').width(main_image_height/2);
// $('.taghunter_image_division img').height(main_image_height/2);
// $('.taghunter_images').width(main_image_height);










// $('.taghunter_images_container').css('margin-top', team_name_height+'px');
// $('.taghunter_full_image').css('margin-top', team_name_height+'px');
//     $(element).width(main_image_height);
// })
// $('.full_image_name').each(function(element){
//     $(element).width(main_image_height);
// })


// Old functions
// function getGameScores(mixer) {

//     var data = {
//         'launched_game_id': $('#launched_game_id').val(),
//         'game_id': $('#game_id').val(),
//     };

//     $.ajaxSetup({
//         headers: {
//             'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//         }
//     });
//     $.ajax({
//         type: 'GET',
//         url: $('#getGameScoresUrl').val(),
//         data: data,
//         success: function (response) {
//             console.log('in get scores');
//             console.log(response);
//             updateTeamsCoresTable(mixer, response);
//         },
//         error: function (data) {
//             console.log(data);
//         }
//     });

// }

// function updateTeamsCoresTable(mixer, teams) {

//     var new_items = [];
//     $(teams).each(function (index, team) {

//         var score = team.total_points;

//         if ($('#game_victory_type').val() == 'speed') {
//             var score = team.images_retreived;
//         }

//         var team_number = team.team_numbe,
//             team_ended  = false;
//         if (team.game_ended > 0) {
//             team_ended = 'Terminé';
//         }

//         var item = {
//             ranking   : index + 1,
//             score     : score.toString(),
//             number    : team_number.toString(),
//             name      : team.team_name,
//             team_ended: team_ended
//         };

//         new_items.push(item);

//         $('#team_scores_order_' + team_number + ' .team_scores_score').html(score);
//         $('#team_scores_order_' + team_number + ' .team_scores_ranking').html(index + 1);
//         $('#team_scores_order_' + team_number + ' .team_ended').html(team_ended);
//         $('.score_' + team_number).html(score);
//         $('.rang_' + team_number).html(index + 1);
//     });

//     showTableRows();
//     mixer.dataset(new_items).then(function (state) {
//         hideTableRows();
//     });
// }
// function setMixer(items) {

//     const container = document.querySelector('[data-ref="teams_ranking_container"]');

//     const mixer = mixitup(container, {
//         data: {
//             uidKey: 'number'
//         },
//         render: {
//             target: render
//         },
//         selectors: {
//             target: '[data-ref="item"]'
//         },
//         animation: {
//             duration: 250,
//             nudge: true,
//             reverseOut: false,
//             effects: "fade translateZ(-100px)"
//         },
//         debug: {
//             showWarnings: true
//         }
//     });
//     mixer.dataset(items)
//         .then(function (state) {
//             hideTableRows();
//         });

//     return mixer;
// }

/*
 * Show/Hide ranking container
 */
// function toggleRankings() {
//     $('.teams_ranking_container').click(function (e) {
//         var target = e.target;
//         var target_id = $(target).attr('id');
//         var running = $('#ajax_running').val();
//         if (running == 0) {
//             if (target_id.indexOf("team_scores_order_") >= 0) {
//                 var team_number = target_id.replace('team_scores_order_', '');
//                 //check if other is showing and hide them;
//                 $('.showing_on_click').each(function (index, element) {
//                     $(element).removeClass('showing_on_click');
//                     $(element).css('opacity', 0);
//                 });

//                 $('#team_' + team_number + '_container .close_team_results_container').show();
//                 $('#team_' + team_number + '_container').addClass('showing_on_click');
//                 $('#team_' + team_number + '_container').animate({
//                     opacity: 1
//                 }, 1000);
//             }
//         }
//     });

//     $('.close_team_results').click(function (e) {
//         var team_number = $(e.target).attr('data-team-number');
//         $('#team_' + team_number + '_container').removeClass('showing_on_click');
//         $('#team_' + team_number + '_container').animate({
//             opacity: 0
//         }, 1000);
//         $('#team_' + team_number + '_container .close_team_results_container').hide();

//     });
// }

// function showTableRows() {
//     $('#line').remove();
//     $('.teams_ranking_container .item.hide').each(function (index, item) {
//         $(item).removeClass('hide');
//     })
// }


// function hideTableRows() {
//     var count_items = $('.teams_ranking_container .item').length;
//     $('.teams_ranking_container .item').each(function (index, item) {

//         if (index == 8) {
//             var clone = $(item).clone()
//             $(clone).attr('id', 'line').html('...');
//             $(clone).insertAfter(item);
//         }
//         if (index > 7 && index < (count_items - 9)) {
//             $(item).addClass('hide');
//         }
//     })
// }