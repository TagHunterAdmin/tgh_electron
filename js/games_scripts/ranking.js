var getCountAnimationEndedUrl;
jQuery(document).ready(function ($) {
    'use strict';

    $(window).resize(function () { setDimensions(); })

    getCountAnimationEndedUrl = $('#getCountAnimationEndedUrl').val();
    var intervalId = setInterval(function () {
        var animations_json = $('#animations_array').val();
        if (typeof animations_json  !== "undefined" && animations_json != '') {
            var animations = JSON.parse(animations_json);
            if (animations.length !== 0) {

                var animation = animations[0];
                var new_animations_array = animations;
                new_animations_array.shift();
                $('#animations_array').val(JSON.stringify(new_animations_array));
                podiumAnimation(animation);
            } else {
                getGameScores(mixer);
            }
            console.log(animations);
        } else {
            getGameScores(mixer);
        }
    }, 8000);
});

function setDimensions() {
    var body_height = $('body').height(),
        window_height = $(window).height(),
        title_height = $('.final_page_titles_container').outerHeight(),
        teams_ranking_container = $('.teams_ranking_container').outerHeight(),
        page_wrapper_height = body_height - title_height;
    $('.teams_ranking_page_wrapper').css('margin-top', title_height);
    $('#podium_animation_container').css('margin-top', -title_height);
    $('.teams_ranking_page_wrapper').css('height', page_wrapper_height);
    console.log(teams_ranking_container);
    console.log(window_height);
    if(teams_ranking_container > window_height){
        $('.teams_ranking_page_wrapper').css('overflow-y', 'scroll');
    }else{
        $('.teams_ranking_page_wrapper').css('overflow-y', 'visible');
    }

}

function setMixer(items) {

    const container = document.querySelector('[data-ref="teams_ranking_container"]');

    const mixer = mixitup(container, {
        data: {
            uidKey: 'number'
        },
        render: {
            target: render
        },
        selectors: {
            target: '[data-ref="item"]'
        },
        animation: {
            duration: 1000,
            nudge: true,
            reverseOut: false,
            effects: "fade translateZ(-100px)"
        },
        debug: {
            showWarnings: true
        },
        callbacks: {
            onMixEnd: function (state) {
                console.log('Operation complete');
                setDimensions();
            }
        }

    });
    mixer.dataset(items)
        .then(function (state) {
            // hideTableRows();


        });

    return mixer;
}

function render(item) {
    var game_victory_type = $('#game_victory_type').val();
    if (game_victory_type == 'speed') {
        return `<div id="team_scores_order_${item.number}" class="item" data-ref="item"><div class="first_column"><span class="team_scores_ranking">${item.ranking}</span></div><div class="second_column"> ${item.name} </div><div class="third_column"> <span class="team_scores_score">${item.score}</span></div><div class="fourth_column"> <span class="team_time">${item.time}</span></div><div class="fifth_column"> <span class="team_icon">${item.icon}</span></div></div>`;
    } else {
        return `<div id="team_scores_order_${item.number}" class="item" data-ref="item"><div class="first_column"><span class="team_scores_ranking">${item.ranking}</span></div><div class="second_column"> ${item.name}</div><div class="third_column"> <span class="team_scores_score">${item.score}</span>pts</div><div class="fourth_column"> <span class="team_ended">${item.team_ended}</span></div></div>`;
    }
}
/* 
 * Scroll to element.
 */
function scrollToElementRanking(element, offset = 200) {
    $('.teams_ranking_page_wrapper').stop().animate({
        scrollTop: $(element).offset().top - offset
    }, 1000);
}
function podiumAnimation(animation) {

    if (animation.animation_type != 'not_top') {
        if ($('#' + animation.animation_type).length) {
            $('#' + animation.animation_type)[0].play();
        }

        $('#podium_animation_' + animation.animation_type + ' .animation_team_name').html(animation.team_name);
        $('#podium_animation_' + animation.animation_type + ' .animation_team_score').html(animation.score);
        if ($('#game_type').val() == 'survival') {
            $('#podium_animation_' + animation.animation_type + ' .animation_team_time').html(animation.time);
        }
        $('#podium_animation_' + animation.animation_type).show();

        $('#podium_animation_container').show();
        setTimeout(
            function () {
                $('#podium_animation_' + animation.animation_type).hide();
                $('#podium_animation_container').hide();
            }, 8000);
    } else {

    }

    return true;
}
function scrollToIndex() {
    var $table = $('#table_teams');
    return true;
}

function getGameScores(mixer) {

    var game_type = $('#game_type').val();
    if (game_type == 'tagquest') {
        url = $('#getGameScoresUrl').val();
    } else if (game_type == 'survival') {
        url = $('#getCountAnimationEndedUrl').val();
    } else {
        url = $('#getGameScoresUrl').val();
    }
    var data = {
        'launched_game_id': $('#launched_game_id').val(),
        'game_id': $('#game_id').val(),
        'count_animation_ended': $('#count_animation_ended').val()
    };

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: url,
        data: data,
        success: function (response) {
            console.log(response);
            var game_type = $('#game_type').val();
            if (response) {
                if (game_type == 'tagquest') {
                    updateTeamsCoresTable(mixer, response);
                } else if (game_type == 'survival') {

                    if ("teams" in response) {
                        var old_count_animation_ended = $('#count_animation_ended').val();
                        var new_count_animation_ended = false;
                        if (old_count_animation_ended < response['count_animation_ended']) {
                            new_count_animation_ended = true;
                        }
                        $('#count_animation_ended').val(response['count_animation_ended']);
                        updateTeamsCoresTable(mixer, response['teams'], response['count_animation_ended'], new_count_animation_ended);
                    } else {
                        updateTeamsCoresTable(mixer, response);
                    }
                }
                // setDimensions();
            }
        },
        error: function (data) {
            console.log('error');
            console.log(data);
        }
    });

}
function launchAnimations(animation) {
    animation_duration = 8000;
    var number_of_steps = animation.length;
    step = 0;
    //each step must last the same for example 1 second
    podiumAnimation(animation[0]);
    var intervalAnimations = setInterval(function () {
        if (step == number_of_steps - 1) {
            clearInterval(intervalAnimations);
        } else {
            podiumAnimation(animations[step]);
        }

        step++

    }, animation_duration);
}
function updateTeamsCoresTable(mixer, response, count_animation_ended = false, new_count_animation_ended = false) {

    var game_type = $('#game_type').val(),
        game_victory_type = $('#game_victory_type').val();

    if (game_type == 'survival') {
        if (new_count_animation_ended) {
            createAnimationsArray(response);
        } else {
            $(response).each(function (index, team) {
                var team_number = team.team_number;
                team_icon = '<i class="fa-solid fa-person"></i>';
                if (team.game_ended > 0) {
                    team_icon = '<i class="fa-solid fa-person-shelter"></i>';
                }
                else if (team.game_started_at > 0) {
                    team_icon = '<i class="fa-solid fa-person-running"></i>';
                }
                $('#team_scores_order_' + team_number + ' .team_ended').html(team_icon);

            })
        }
    } else if (game_type == 'tagquest') {
        if (game_victory_type == 'speed') {

            $(response).each(function (index, team) {
                var team_number = team.team_number;
                if (team.game_ended > 0) {
                    team_icon = '<i class="fa-solid fa-person-shelter"></i>';
                }
                else {
                    team_icon = '<i class="fa-solid fa-person-running"></i>';
                }
                $('#team_scores_order_' + team_number + ' .team_icon').html(team_icon);
                $('#team_scores_order_' + team_number + ' .team_time').html(team.time);
            })
        }

        createAnimationsArray(response);
    }

}

function createAnimationsArray(response) {

    var new_items = [],
        animations = [],
        game_victory_type = $('#game_victory_type').val(),
        animation_top_1 = $('#animation_top_1').val(),
        animation_top_3 = $('#animation_top_3').val(),
        animation_top_10 = $('#animation_top_10').val(),
        animation_top_value = parseInt($('#animation_top_value').val()),
        all_total_score = 0,
        count_teams_with_score = 0,
        teams_with_score_array = [],
        animations_json = $('#animations_array').val();

    if (animations_json != '') {
        var animations = JSON.parse(animations_json);
    }

    $(response).each(function (index, team) {

        var time_in_seconds = team.game_ended_at - team.game_started_at,
            time = new Date(time_in_seconds * 1000).toISOString().slice(11, 19);

        if (game_victory_type == 'speed') {
            var score = team.images_retreived;
        } else {
            var score = team.total_points;
        }

        var team_number = team.team_number;
        team_icon = '<i class="fa-solid fa-person"></i>';
        if (team.game_ended > 0) {
            team_icon = '<i class="fa-solid fa-person-shelter"></i>';
        }
        else if (team.game_started_at) {
            team_icon = '<i class="fa-solid fa-person-running"></i>';
        }

        if (score > 0) {
            all_total_score += score;
            count_teams_with_score++;
            teams_with_score_array.push(score);
        }

        animation = false;

        var old_ranking = $('#team_scores_order_' + team.team_number + ' .team_scores_ranking').html(),
            new_ranking = index + 1;

        var item = {
            ranking: new_ranking,
            score: score.toString(),
            number: team_number.toString(),
            name: team.team_name,
            team_ended: team_icon
        };

        new_items.push(item);
        if (new_ranking == old_ranking) {
            animation = false;
        } else if (animation_top_1 && new_ranking == 1 && old_ranking > 1) {
            animation = {
                'team_number': team.team_number,
                'team_name': team.team_name,
                'score': score,
                'animation_type': 'top_1',
                'time': time
            };
        } else if (animation_top_3 && new_ranking <= 3 && old_ranking > 3) {
            animation = {
                'team_number': team.team_number,
                'team_name': team.team_name,
                'score': score,
                'animation_type': 'top_3',
                'time': time
            };
        } else if (animation_top_10 && new_ranking <= animation_top_value && old_ranking > animation_top_value) {
            animation = {
                'team_number': team.team_number,
                'team_name': team.team_name,
                'score': score,
                'animation_type': 'top_10',
                'time': time
            };
        } else if (new_ranking < old_ranking) {
            animation = {
                'team_number': team.team_number,
                'team_name': team.team_name,
                'score': score,
                'animation_type': 'not_top',
                'time': time
            };

        } else {
            animation = false;
        }

        $('#team_scores_order_' + team.team_number + ' .team_scores_score').html(score);
        $('#team_scores_order_' + team.team_number + ' .team_scores_ranking').html(index + 1);
        $('#team_scores_order_' + team.team_number + ' .team_ended').html(team_icon);
        $('.score_' + team.team_number).html(score);
        $('.rang_' + team.team_number).html(index + 1);

        if (animation) {
            $('.team_updated').each(function (index, item) {
                $(item).removeClass('team_updated');
            })
            $('#team_scores_order_' + team_number).addClass('team_updated');
            if ($('#game_type').val() == 'survival') {
                if (team.animation_ended == 1) {
                    animations.push(animation);
                }
            } else {
                animations.push(animation);
            }

        }
    });

    if (game_victory_type == 'score') {
        count_teams_with_score = teams_with_score_array.length;
        var means = all_total_score / count_teams_with_score;
        if (count_teams_with_score % 2 === 0) { /* we are even */
            mean_first_half = count_teams_with_score / 2;
            mean_second_half = count_teams_with_score / 2 + 1;
            median = (teams_with_score_array[mean_first_half] + teams_with_score_array[mean_second_half]) / 2;
        }
        else { /* we are odd */
            median_index = (count_teams_with_score + 1) / 2;
            median = teams_with_score_array[median_index];
        }
        $('#ranking_means_container span').html(Math.round(means));
        $('#ranking_mediane_container span').html(median);
    }

    mixer.dataset(new_items).then(function () {
        if (animations.length) {
            launchAnimations(animations);
        }
    });
}