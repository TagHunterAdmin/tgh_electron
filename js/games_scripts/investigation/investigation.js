// const { set } = require("lodash");

// const { set } = require("lodash");

var game_url;
var launched_game;
let launched_game_id;
let current_puzzle;
let current_enigma;
let puzzle_duration;
var device_id;
var animation_message_duration;
var launched_game_meta;
var countdown_function;
var intervalCheckNewBip;
var intervalNewPuzzle;
var intervalNewBip;
var intervalUpdateEnigmas;
var intervalScores;
var keys;

jQuery(document).ready(function ($) {
  game_url = $('#game_url').val(),
    launched_game = $.parseJSON($('#launched_game').val()),
    launched_game_meta = $.parseJSON($('#launched_game_meta').val()),
    launched_game_id = launched_game.id,
    puzzle_duration = launched_game_meta.puzzle_duration,
    device_id = $('#device_id').val(),
    animation_message_duration = 3000,
    current_puzzle = $('#current_puzzle').val(),
    intervalCheckNewBip = 3000;

  keysStrokes();
  setDimensions();
  createNewTimer();

  startStopInterval('getGamePuzzleArray', 'start');
  startStopInterval('checkNewBip', 'start');

  if (current_puzzle.puzzle_type == 'final') {
    var current_enigma_id = $('#current_enigma_id').val();
    if (current_enigma_id) {
      console.log('in final');
      getNewEnigma();

      startStopInterval('checkNewBip', 'start');
    }
  }

  $(window).resize(function () { setDimensions(); })

  if (launched_game_meta.version != "without_balises") {
    var intervalNewBip = setInterval(function () {
      if ($('#ajax_running').val() == 0) {
        // checkNewBip();
      }

    }, 3000);
  } else {
    if (launched_game_meta.version_without_balises == "mouse") {
      $('.answers_body_row').click(function (e) {
        var answer_without_balise = $(e.target).attr('data-answer');
        showConfirmAnswer(answer_without_balise);
      })
    } else if (launched_game_meta.version_without_balises == "pad") {
      $(document).on('keypress', function (e) {
        if (e.which == 13) {
          var answer_without_balise = $('#pad_input').val();
          showConfirmAnswer(answer_without_balise);
        }
      });
    }

  }
});



function resetEnigma() {
  $("#team_name_container").text(' ');
  hideAnimateElement('enigma_container');
  startStopInterval('intervalUpdateEnigmas', 'start');
  $('#wait_for_team').val(1);
  $('#current_enigma_id').val(0);
  $('#ajax_running').val(0);
}

function keysStrokes() {
  keys = [];

  $(document).keydown(function (e) {
    keys.push(e.which);
    //  keys[e.which] = true;
  });


  $(document).keyup(function (e) {
    if (keys.length == 1 && keys[0] == 13) {
      resetEnigma();
    } else {
      var config_keys_combinations = $.parseJSON($('#load_new_puzzle_keys').val()),
        config_keys = config_keys_combinations.keys,
        all_keys_in_array = true;
      if (config_keys.length == keys.length) {
        for (var i in config_keys) {
          if ($.inArray(config_keys[i], keys) == -1) {
            all_keys_in_array = false;
          }
        }
      } else {
        all_keys_in_array = false;
      }
      if (all_keys_in_array) {
        startNextPuzzle();
      }
    }

    keys = [];
  });

}

function startNextPuzzle() {
  var data = {
    'action': 'start_next_puzzle',
    'launched_game_id': launched_game_id,
  };

  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });
  $.ajax({
    type: 'POST',
    url: game_url + '/doOverviewAction',
    data: data,
    success: function (response) {
      console.log(response);
      displayNewPuzzle(response.new_current_puzzle)
    },
    error: function (response) {
      console.log(response);
    }
  });
}

function startStopInterval(the_interval, action) {

  if (action == 'start') {
    if (the_interval == 'getGamePuzzleArray') {
      intervalUpdateEnigmas = setInterval(function () {
        getGamePuzzleArray();
        checkIfFinalPuzzle();
      }, 3000);
    }
    else if (the_interval == 'checkNewBip') {
      intervalNewBip = setInterval(function () {
        if ($('#ajax_running').val() == 0) {
          checkNewBip();
        }
      }, intervalCheckNewBip);
    }
    else if (the_interval == 'checkNewPuzzle') {
      intervalNewPuzzle = setInterval(function () {
        checkNewPuzzle();
      }, 3000);
    }
  }
  else {
    if (the_interval == 'getGamePuzzleArray') {
      clearInterval(intervalUpdateEnigmas);
    } else if (the_interval == 'checkNewBip') {
      clearInterval(intervalNewBip);
    } else if (the_interval == 'checkNewPuzzle') {
      clearInterval(intervalNewPuzzle);
    }
  }
}

function checkIfFinalPuzzle() {
  current_puzzle = $.parseJSON($('#current_puzzle').val());
  if (current_puzzle.puzzle_type == 'final' && isEmpty($('#enigma_container'))) {
    $('#badges_and_puzzle_container').empty();
    $('#team_name_container').remove();
    $.each(current_puzzle.array_enigmas, function (index, element) {
      if (element.start_time && !element.end_time) {
        $('#current_enigma_id').val(current_puzzle.array_enigmas[index].enigma_id);
        setDimensions();
        getNewEnigma(element);
        return false;
      }
    });
  }
}

function setVotes(enigma) {
  votes = enigma.votes;
  $.each(votes, function (balise_id, vote) {
    $.each(vote, function (index, team) {
      if ($('#vote_balise_container_' + balise_id).length == 0) {
        $('#badges_and_puzzle_container').append('<div id="vote_balise_container_' + balise_id + '" class="vote_balise_container"><div class="vote_balise_image"></div><div class="vote_balise_votes"><div class="team_vote_' + team.team_number + '">' + team.team_name + '</div></div></div>');
        $('#enigma_image_container_' + balise_id + ' img').clone().appendTo('#vote_balise_container_' + balise_id + ' .vote_balise_image');
      } else {
        $('#vote_balise_container_' + balise_id + ' .vote_balise_votes').append('<div class="team_vote_' + team.team_number + '">' + team.team_name + '</div>');
      }
    });
  });
}

function checkNewPuzzle() {
  current_puzzle = $.parseJSON($('#current_puzzle').val());
  current_puzzle_id = current_puzzle.id;

  data = {
    'launched_game_id': launched_game_id,
    'current_puzzle_id': current_puzzle_id,
  };
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.ajax({
    type: 'GET',
    url: game_url + '/checkNewPuzzle',
    data: data,
    success: function (response) {

      if (response) {
        if (response.type_of_request == 'new_puzzle') {
          displayNewPuzzle(response.new_current_puzzle);
        }
      }

    },
    error: function (data) {
      console.log('Error');
      console.log(data);
    }
  });
}

function displayNewPuzzle(new_current_puzzle) {
  startStopInterval('checkNewPuzzle', 'stop');
  $('#current_puzzle').val(new_current_puzzle);
  toggleRapport('hide');
  createNewTimer();
  $.each($('.badge_container'), function (index, element) {
    $(element).removeClass('badge_showing');
    $(element).css('opacity', 0);
  });

  new_current_puzzle = $.parseJSON(new_current_puzzle);
  $('#puzzle_title').text(new_current_puzzle.puzzle_name);

  startStopInterval('intervalNewBip', 'start');

  if (new_current_puzzle.puzzle_type == 'final') {
    var current_enigma = Object.values(new_current_puzzle.array_enigmas)[0];
    $('#current_enigma_id').val(current_enigma.enigma_id);
    $('#badges_and_puzzle_container').empty();
    $('#team_name_container').remove();
    setDimensions();
    getNewEnigma();
  }

}

function getGamePuzzleArray() {

  data = {
    'launched_game_id': launched_game_id,
  };
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.ajax({
    type: 'GET',
    url: game_url + '/getGamePuzzleArray',
    data: data,
    success: function (response) {
      calculateBadges($.parseJSON(response));
    },
    error: function (data) {
      console.log('Error');
      console.log(data);
    }
  });
}

function calculateBadges(game_puzzle_array) {
  var badges_json = $("#badges").val(),
    badges = false;

  if (badges_json) {
    badges = $.parseJSON(badges_json);

    $.each(game_puzzle_array, function (index, element) {
      if (element.current) {

        var count_resolved = 0,
          count_subsidiaries = 0,
          count_enigmas = 0;

        $.each(element.array_enigmas, function (index, enigma) {
          count_enigmas++;
          if (enigma.importance == 'optional') {
            count_subsidiaries++;
          }

          if (enigma.status == 'resolved') {
            count_resolved++;
          }

        });
      }

      if (count_resolved) {

        var percentage_resolved = count_resolved * 100 / count_enigmas,
          the_badge = false;
        $.each(badges, function (index, badge) {
          if (percentage_resolved >= parseInt(badge.badge_condition)) {
            the_badge = badge;
          }
        });
        if (the_badge) {
          var the_badge_element = $('#badge_' + the_badge.id);
          if (!$(the_badge_element).hasClass('badge_showing')) {
            $(the_badge_element).addClass('badge_showing');
            $(the_badge_element).animate({
              opacity: 1,
            }, 1000);
          }
        }

      }

    });
  }
}

function toggleEnigmaIcons(enigma_id, icon) {

  var enigma_icons = $('#enigma_' + enigma_id + ' .status_enigma');

  $.each(enigma_icons, function (index, element) {
    $(element).hide();
  });
  $('#enigma_' + enigma_id + ' .' + icon).show()
}

/*
* Check if a new bip has been detected
*/
function checkNewBip() {
  var game = $.parseJSON($('#game').val()),
    enigma_id = $('#current_enigma_id').val(),
    current_puzzle = $.parseJSON($('#current_puzzle').val()),
    wait_for_team = $('#wait_for_team').val(),
    getVotes = current_puzzle.puzzle_type == 'final' ? 1 : 0;

  if (launched_game_meta.version == "without_balises") {
    var data = {
      'launched_game_id': launched_game_id,
      'device_id': device_id,
      'game_id': game.id,
      'enigma_number': enigma.id,
      'without_balise': true,
      'answer': answer_without_balise,
      'getVotes': getVotes
    };
  } else {
    var data = {
      'launched_game_id': launched_game_id,
      'device_id': device_id,
      'game_id': game.id,
      'enigma_id': enigma_id,
      'without_balise': false,
      'wait_for_team': wait_for_team,
      'current_puzzle_id': current_puzzle.id,
      'getVotes': getVotes
    };
  }
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
      console.log(response);
      if (response) {
        if (response.error || response.is_cheating) {

          setTimeout(function () {
            showMessage(animation_message_duration, response.message.type, response.message.text);
          }, 1000);

          setTimeout(function () {
            hideMessage(animation_message_duration);
          }, 1000 + animation_message_duration * 2);


        }
        else if (response.type_of_request == 'get_enigma_views') {
          $('#team_name_container').text(response.team.team_name);
          displayEnigma(response.enigma_id, response.view_enigma_container, response.view_good_answer_container);
        } else if (response.type_of_request == 'update_launched_game') {
          startStopInterval('checkNewBip', 'stop');
          startAnimation(response);
        } else if (response.type_of_request == 'get_votes') {
          //get the new vote
          if (response.all_votes_casted) {
            if (response.highest_draw) {
              //display 
     
              showMessage(animation_message_duration, 'danger', $('#votes_draw').val());
            }else{
              startStopInterval('checkNewBip', 'stop');
              finalAnimation(response);
            }
          } else if (response.new_vote) {
            hideMessage(animation_message_duration);
            $('#good_answer_images_container').hide();
            $('#vote_image_container').empty();

            //check if votes array match displayed
            $.each(response.votes, function(balise_id, vote){
              if($('#vote_balise_container_' + balise_id).length){
                var votes_displayed = $('#vote_balise_container_' + balise_id + ' .vote_balise_votes div');
                $.each(votes_displayed, function(index, element){
                  var team_number = $(element).attr('class').split('_')[2];
                  console.log(team_number);
                  var vote_displayed_in_array = false;
                  $.each(vote, function(index, team){
                    if(team.team_number == team_number){
                      vote_displayed_in_array =true;
                    }
                  });
                  if(!vote_displayed_in_array){
                    $(element).remove();
                  }
                });
              }
            })

            var text_team_vote = $('#team_vote').val();
            text_team_vote = text_team_vote.replace('%team%', response.new_vote.team.team_name);
            $('#good_answer_container #good_answer_text').text(text_team_vote);
            $('#good_answer_container #good_answer_text').css('opacity', 1);
        
            $('#enigma_image_container_' + response.new_vote.balise_id + ' img').clone().appendTo("#vote_image_container");
            $('#vote_image_container').css('opacity', 1);

            if ($('#vote_balise_container_' + response.new_vote.balise_id).length == 0) {
              $('#badges_and_puzzle_container').append('<div id="vote_balise_container_' + response.new_vote.balise_id + '" class="vote_balise_container"><div class="vote_balise_image"></div><div class="vote_balise_votes"><div class="team_vote_' + response.new_vote.team.team_number + '">' + response.new_vote.team.team_name + '</div></div></div>');
              $('#enigma_image_container_' + response.new_vote.balise_id + ' img').clone().appendTo('#vote_balise_container_' + response.new_vote.balise_id + ' .vote_balise_image');
            } else {
              $('#vote_balise_container_' + response.new_vote.balise_id + ' .vote_balise_votes').append('<div class="team_vote_' + response.new_vote.team.team_number + '">' + response.new_vote.team.team_name + '</div>');
            }
            setEnigmaDimensions();
            $('#good_answer_container').animate({
              opacity: 1,
            }, 2000);

            setTimeout(function () {
              $('#good_answer_container').animate({
                opacity: 0,
              }, 1000);
              $('#vote_image_container').css('opacity', 0);
              $("#team_name_container").text(' ');
              $('#vote_image_container').empty();
            }, 3000);
          }
        }
        else if (response.type_of_request == 'show_rapport') {
          toggleRapport('show');
          startStopInterval('checkNewPuzzle', 'start');
          $('#main_investigation_timer_ended').show();
          $('#investigation_timer_container').hide();
        }
        else if (response.type_of_request == 'new_puzzle') {
          displayNewPuzzle(response.new_current_puzzle);
          new_current_puzzle = $.parseJSON(response.new_current_puzzle);
          if (new_current_puzzle.puzzle_type == 'final') {
            $.each(new_current_puzzle.array_enigmas, function (index, element) {
              $('#current_enigma_id').val(new_current_puzzle.array_enigmas[index].enigma_id);
              return false;
            })
            startStopInterval('intervalNewBip', 'start');
            getNewEnigma();
          }
        }

        if (response == 'ended') {
          $('#ajax_running').val(1);
          startStopInterval('intervalNewBip', 'stop');
          window.location.href = game_url + '/launched/final/' + launched_game.game_type + '/' + launched_game.id;
        } else {

        }
      }

    },
    error: function (data) {
      console.log('A lire par Coralie 2: ligne en dessous');
      console.log(data);
    }
  });

  return ended;

}

function getNewEnigma(is_final = false) {

  var game = $.parseJSON($('#game').val()),
    enigma_id = $('#current_enigma_id').val(),
    current_puzzle = $.parseJSON($('#current_puzzle').val());

  var data = {
    'launched_game_id': launched_game_id,
    'game_id': game.id,
    'enigma_id': enigma_id,
    'current_puzzle_id': current_puzzle.id,
  };


  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });
  $.ajax({
    type: 'GET',
    url: game_url + '/getViewEnigma',
    data: data,
    success: function (response) {
      if (response) {
        if (response.type_of_request == 'get_enigma_views') {
          displayEnigma(response.enigma.id, response.view_enigma_container, response.view_good_answer_container, is_final);
        }
      }

    },
    error: function (data) {
      console.log('A lire par Coralie 2: ligne en dessous');
      console.log(data);
    }
  });

}

function displayEnigma(enigma_id, view_enigma_container, view_good_answer_container, is_final) {
  showAnimateElement('loading_enigma_wrapper');
  $('#wait_for_team').val(0);
  setTimeout(function () {

    $('#enigma_container').empty();
    $('#current_enigma_id').val(enigma_id);
    $('#enigma_container').html(view_enigma_container);
    $('#good_answer_container').html(view_good_answer_container);

    hideAnimateElement('loading_enigma_wrapper');
    showAnimateElement('enigma_container');
    setEnigmaDimensions();
    if(is_final){
      setVotes(is_final);
    }
  }, 1000);
}

function toggleRapport(action) {

  if (action == 'hide') {
    $('#rapport_wrapper').animate({
      opacity: 0,
    }, 1000);

    setTimeout(function () {
      $('#rapport_wrapper').hide();
    }, 1000);
  } else {
    $('#rapport_wrapper').show();

    $('#rapport_wrapper').animate({
      opacity: 1,
    }, 1000);
  }
}

function startAnimation(response) {

  $('#ajax_running').val(1);

  if (response.error || response.is_cheating || response.team_game_ended) {

    setTimeout(function () {
      showMessage(animation_message_duration, response.message.type, response.message.text);
    }, 1000);

    setTimeout(function () {
      hideMessage(animation_message_duration);
      resetEnigma();
    }, 1000 + animation_message_duration * 2);

    $('#ajax_running').val(0);


  } else {
    // $('#enigma_container_' + response['right_answer'] + ' .searching').css('display', 'none');

    if ($.isArray(response['right_answer'])) {
      mainAnimation(response, 'right');
    } else if (response['wrong_answer']) {
      //empty good answer container
      $('#good_answer_images_container').empty();
      //get wrong images from response
      $.each(response['puce_data_on_key']['data_on_key'], function (index, element) {
        if ($('#enigma_image_container_' + element.id_balise).length) {
          $('#enigma_image_container_' + element.id_balise + ' img').clone().appendTo("#good_answer_images_container");
        }

      });
      $.each($("#good_answer_images_container img"), function (index, element) {
        $(element).removeAttr("style")
      });

      mainAnimation(response, 'wrong');
      // $('#good_answer_container').animate({
      //   opacity: 1,
      // }, 1000);

      // setTimeout(function () {
      //   $('#good_answer_container').animate({
      //     opacity: 0,
      //   }, 1000);
      //   $("#team_name_container").text(' ');
      // }, 3000);

      // $.each(response['puce_data_on_key']['data_on_key'], function (index, element) {
      //   if ($('#wrong_answer_container_' + element.id_balise).length) {
      //     $('#wrong_answer_container_' + element.id_balise).animate({
      //       opacity: 1,
      //     }, 1000);
      //   } else {
      //     showMessage(3000, 'error', 'Vous avez bipez une balise qui n\est même pas dans la liste')
      //   }

      // });
    }

    //hide answers container


    setTimeout(function () {




      setTimeout(function () {

        // hideAnimateElement('loading_enigma_wrapper');


        // showAnimateElement('enigmas_list_container');
        // resetEnigma();


        // $('#enigma_container').empty();
        // $('#good_answer_container').empty();
        // $('#enigma_container').html(response.view_enigma_container);
        // $('#good_answer_container').html(response.view_good_answer_container);
        // setDimensions();
        // createNewTimer();

        // var new_enigma = $('#enigmas_list_wrapper .enigma_wrapper').attr('data-enigma-index');
        // new_enigma_id = response.enigma.id;
        // $('#current_enigma_id').val(response.enigma.id);
        // $('#current_enigma').val(JSON.stringify(response.enigma));
        // $('#puzzle_name').text(response.current_puzzle.puzzle_name);
        // $('#the_current_enigma').text(response.enigma.name);

        // $('#enigmas_list_wrapper').animate({
        //   opacity: 1,
        // }, 1000);

      }, 1000);
    }, 6000);

  }

}

function finalAnimation(response){
    //vote terminé
    $('#enigma_image_container_' + response.highest_draw_balise + ' img').clone().appendTo("#final_answer_image_container");
    //vote final
    //right or wrong
    var final_text = $('#final_response_wrong').val();
    $.each(response.game_puzzles_array, function(index, puzzle){
      if(puzzle.puzzle_type == 'final'){
        if(puzzle.status == 'resolved'){
          final_text = $('#final_response_correct').val()
        }else{
          final_text = $('#final_response_wrong').val()
        }
      }
    });

    $('#final_answer_text').text(final_text);

    showAnimateElement('final_answer_container');
    setTimeout(function(){
      // location.reload();
    }, 5000);

}

function mainAnimation(response, answer) {
  stamp = answer == 'right' ? 'stamp_success' : 'stamp_failed';
  sound = answer == 'right' ? 'success_sound_effect' : 'error_sound_effect';

  $('#good_answer_container').animate({ opacity: 1 },
    {
      duration: 1000,
      complete: function () {
        setTimeout(function () {
          $('#good_answer_images_container').animate({ opacity: 1 },
            {
              duration: 1000,
              complete: function () {
                setTimeout(function () {
                  playSound(sound, 'play');
                  $('#' + stamp).animate({ opacity: 1 },
                    {
                      duration: 1000,
                      complete: function () {
                        console.log('in 3');
                        setTimeout(function () {
                          $('#good_answer_text').animate({ opacity: 1 },
                            {
                              duration: 1000,
                              complete: function () {
                                setTimeout(function () {
                                  endAnimation(response);
                                }, 3000);
                              }
                            });
                        }, 500);
                      }
                    });
                }, 500);
              }
            });
        }, 500);
      }
    });
}

function endAnimation(response) {
  if (response == 'ended') {
    location.reload();
  }

  playSound('10_seconds_left', 'stop');
  startStopInterval('intervalNewBip', 'stop');
  $('#good_answer_container').animate({ opacity: 0 }, 1000);
  $('#good_answer_images_container').animate({ opacity: 0 }, 1000);
  $('#stamp_success').animate({ opacity: 0 }, 1000);
  $('#good_answer_text').animate({ opacity: 0 }, 1000);

  setTimeout(function () {
    changeBackground();
    resetEnigma();
    $('#ajax_running').val(0);
    if (response.current_puzzle) {
      if (response.current_puzzle.puzzle_type == 'final') {
        var all_ended = true;
        $.each(response.current_puzzle.array_enigmas, function (index, element) {

          if (!element.status) {
            $('#current_enigma_id').val(response.current_puzzle.array_enigmas[index].enigma_id);
            all_ended = false
            return false;
          }
        });
        if (all_ended) {
          window.location(href = game_url + '/launched/final/' + launched_game.game_type + '/' + launched_game.id);
        }
      }
    }
  }, 1000);
}


function createNewTimer() {
  $('#main_investigation_timer_ended').hide();
  $('#investigation_timer_container').show();

  var date = moment();
  current_puzzle = $.parseJSON($('#current_puzzle').val());
  current_puzzle_id = current_puzzle.id;
  start_time = false;
  start_time = current_puzzle.start_time;

  if (start_time) {
    time_left = puzzle_duration * 60 - (moment().unix() - start_time);
    minutes_left = Math.floor(time_left / 60);
    secondes_left = time_left % 60;
    date.add(minutes_left, 'm').toDate();
    date.add(secondes_left, 's').toDate();
  } else {
    date.add(puzzle_duration, 'm').toDate();
  }

  endDateTime = date.format('MM/DD/YYYY HH:mm:ss');
  clearInterval(intervalCountdown);

  countdown_function = $('#investigation_timer_container').countdown({
    date: endDateTime,   //Date format: 07/27/2017 17:00:00
    offset: +1,            // TODO daylight savings
    hideOnComplete: true
  }, function (container) {
    $('#main_investigation_timer_ended').show();
    startStopInterval('checkNewBip', 'stop');
    endPuzzle();
    startStopInterval('checkNewPuzzle', 'start');
  });

}

function endPuzzle() {
  current_puzzle = $.parseJSON($('#current_puzzle').val());
  current_puzzle_id = current_puzzle.id;
  data = {
    'launched_game_id': launched_game_id,
    'current_puzzle_id': current_puzzle_id,
  };
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.ajax({
    type: 'POST',
    url: game_url + '/endPuzzle',
    data: data,
    success: function (response) {
      if (response.type_of_request == 'current_puzzle_over') {
        toggleRapport('show');
      }
    },
    error: function (data) {
      console.log('Error');
      console.log(data);
    }
  });
}

function playSound(sound_name, action) {

  var sound = $('#' + sound_name);
  if ($(sound).length) {
    if (action == 'play') {
      if ($(sound)[0].paused) {
        console.log('in sounhd');
        $(sound)[0].play();
      };
    } else if (action == 'stop') {
      $(sound)[0].pause();
    }
  }
}

function changeBackground() {
  var count_backgrounds = $('.background_list').length;
  background_random = randomIntFromInterval(1, count_backgrounds);

  for (var i = 1; i <= count_backgrounds; i++) {
    if (!$('#background_' + background_random).hasClass('backgound_showing')) {
      // display bckg
      $('#background_' + background_random).addClass('backgound_showing');
      var bckg_url = $('#background_' + background_random).val();
      $('.game_page_wrapper').css('background-image', 'url("' + bckg_url + '")')
      return true;
    }
  }

  $.each($('.background_list'), function (index, element) {
    $(element).removeClass('backgound_showing');
  });
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function showAnimateElement(id) {

  $('#' + id).show();
  $('#' + id).animate({
    opacity: 1,
  }, 1000);
}

function hideAnimateElement(id) {

  $('#' + id).animate({
    opacity: 0,
  }, 1000);

  setTimeout(function () {
    $('#' + id).hide();
  }, 1000);
}

function setEnigmaDimensions() {
  var main_column_height = $('#investigation_main_column').height(),
    enigma_title_padding = parseInt($('#enigma_title').css("padding")),
    enigma_container_margin = parseInt($('#enigma_container').css("margin")),
    enigma_title_height = $('#enigma_title_container').height(),
    enigma_wrapper_height = main_column_height - enigma_title_height - enigma_title_padding * 2 - enigma_container_margin * 2,
    image_container_height = (enigma_wrapper_height) / 4,
    image_width = image_container_height - 20;

  $('.enigma_image_container').width(image_container_height);
  $('.enigma_image_container').height(image_container_height);
  $('.enigma_image_container img').width(image_width);
  $('.enigma_image_container img').height(image_width);
  $('.answer_container').width(image_container_height);
  $('.answer_container').height(image_container_height);

}

function setDimensions() {

  var main_column_width = $('#investigation_main_column').width(),
    main_column_height = $('#investigation_main_column').height(),
    puzzle_title_height = $('#puzzle_title').innerHeight();
  if ($('#team_name_container').length != 0) {
    var badge_name_height = $('.badge_name').height(),
      badge_containers_height = $(window).height() - 3 * puzzle_title_height - 3 * 15 - 10,
      badge_height = (badge_containers_height - 2 * 15 - 4 * badge_name_height - 4 * 5) / 4;
    $('.badge_image').height(badge_height);
    $('.badge_image').width(badge_height);
    $('#team_name_container').height(puzzle_title_height + 15);
  } else {
    badge_containers_height = $(window).height() - puzzle_title_height - 15 - 10
  }

  $('#wait_for_puzzle_to_finish_container').height(main_column_height);
  $('#badges_and_puzzle_container').height(badge_containers_height);

  $('#loading_enigma_container').width(main_column_width - 30);
  $('#loading_enigma_container').height(main_column_height - 30);
  $('#enigma_container').width(main_column_width);


}

function isEmpty(el) {
  return !$.trim(el.html())
}
//////// OLD FUNCTIONS

// function showConfirmAnswer(answer_without_balise) {
//   $('#confirm_answer_wrapper span').text(answer_without_balise);
//   $('#confirm_answer_wrapper').show();
//   $('#confirm_answer_wrapper').animate({
//     opacity: 1
//   }, 1000);

//   $(document).on('keyup', function (e) {
//     if (e.which == 109) {
//       $('#confirm_answer_wrapper').animate({
//         opacity: 0
//       }, 1000);
//       $('#confirm_answer_wrapper').hide();
//       $('#pad_input').val('');
//     } else if (e.which == 107) {
//       $('#confirm_answer_wrapper').animate({
//         opacity: 0
//       }, 1000);
//       $('#confirm_answer_wrapper').hide();
//       $('#pad_input').val('');
//       getBaliseFromBip(answer_without_balise);
//     }
//   });

//   $('.confirm_answer_button').click(function (e) {

//     if ($(e.target).attr('id') == 'confirm_answer_cancel') {

//       $('#confirm_answer_wrapper').animate({
//         opacity: 0
//       }, 1000);
//       $('#confirm_answer_wrapper').hide();
//     } else if ($(e.target).attr('id') == 'confirm_answer_validate') {
//       $('#confirm_answer_wrapper').animate({
//         opacity: 0
//       }, 1000);
//       $('#confirm_answer_wrapper').hide();
//       getBaliseFromBip(answer_without_balise);
//     }
//   })

// }

// function showEnigma() {


//   $('.show_enigma').click(function (e) {

//     hideAnimateElement('enigmas_list_container');
//     showAnimateElement('loading_enigma_wrapper');

//     var enigma_id = $(e.target).attr('data-enigma-id'),
//       game = $.parseJSON($('#game').val()),
//       data = {
//         'launched_game_id': launched_game_id,
//         'game_id': game.id,
//         'device_id': device_id,
//         'current_puzzle': current_puzzle,
//         'enigma_id': enigma_id
//       };

//     $.ajaxSetup({
//       headers: {
//         'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//       }
//     });

//     $.ajax({
//       type: 'GET',
//       url: game_url + '/getViewEnigma',
//       data: data,
//       success: function (response) {
//         console.log('getViewEnigma');
//         console.log(response);

//         setTimeout(function () {
//           if (response) {

//             startStopInterval('intervalUpdateEnigmas', 'stop');
//             hideAnimateElement('loading_enigma_wrapper');
//             $('#enigma_container').empty();
//             $('#enigma_container').html(response.view_enigma_container);
//             showAnimateElement('enigma_container');

//             $('#current_enigma').val(JSON.stringify(response.current_enigma));
//             setDimensions();
//             backToEnigmaList();

//             var intervalNewBip = setInterval(function () {
//               if ($('#ajax_running').val() == 0) {

//                 checkNewBip();
//               }
//             }, 1000);
//           }

//         }, 1000);



//       },
//       error: function (data) {
//         console.log('Error');
//         console.log(data);
//       }
//     });


//   });
// }


// function backToEnigmaList() {
//   $('.enigma_back').click(function (e) {

//     var enigma_id = $(e.target).attr('data-enigma-index'),
//       data = {
//         'launched_game_id': launched_game_id,
//         'enigma_id': enigma_id,
//         'action': 'back'
//       };

//     hideAnimateElement('enigma_container');
//     showAnimateElement('enigmas_list_container');

//     $('#enigma_container').empty();

//     $.ajaxSetup({
//       headers: {
//         'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//       }
//     });

//     $.ajax({
//       type: 'GET',
//       url: game_url + '/setEnigmaStatus',
//       data: data,
//       success: function (response) {
//         intervalUpdateEnigmas = setInterval(function () {
//           getGamePuzzleArray();
//         }, 3000);

//       },
//       error: function (data) {
//         console.log('Error');
//         console.log(data);
//       }
//     });
//   })
// }



// function displayEnigmaList(puzzle_id) {

//   var data = {
//     'launched_game_id': launched_game_id,
//     'puzzle_id': puzzle_id,
//   };

//   $.ajaxSetup({
//     headers: {
//       'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//     }
//   });

//   $.ajax({
//     type: 'GET',
//     url: game_url + '/getViewPuzzleEnigmaList',
//     data: data,
//     success: function (response) {
//       console.log('displayEnigmaList');
//       console.log(response);

//       $('#enigmas_list_container').empty();
//       $('#enigmas_list_container').html(response.view_enigma_list);

//       showEnigma();
//     },
//     error: function (data) {
//       console.log('Error');
//       console.log(data);
//     }
//   });
// }
