var game_url;
jQuery(document).ready(function ($) {
    'use strict';
    game_url = $('#game_url').val();
    toggleColumns($('.image_cell'));
    toggleColumnsOnClick('#toggle_images', $('.image_cell'));
    toggleColumnsOnClick('#toggle_combos', $('.combo_cell'));
    toggleColumnsOnClick('#toggle_malus', $('.malus_cell'));


    confirmModalActionTagquest();
    confirmActionTagquest();

    startGame();


});

/*
 * On show modal confirm action -> specific tagquest
 ** 
 */
function confirmModalActionTagquest() {
    $('#confirm_action_modal_tagquest').on('show.bs.modal', function (event) {
        var target_i = $(event.relatedTarget), // Button that triggered the modal
            launched_game_id = $('#launched_game_id').val();

        console.log('in modal tagquest');
        console.log(target_i);
        if ($(target_i).hasClass('respawn_team')) {
            var html_content = 'Etes-vous sûr(e) de vouloir remettre en jeu cette équipe?';
            var data = {
                'launched_game_id': launched_game_id,
                'team_id': $(target_i).data('team'),
                'target': 'respawn_team',
            };

        } else if ($(target_i).hasClass('add_remove_points')) {
            var action = $(target_i).attr('data-action'),
                image_id = $(target_i).attr('data-image'),
                team_id = $(target_i).attr('data-team'),
                type = $(target_i).attr('data-type');

            var data = {
                'launched_game_id': $('#launched_game_id').val(),
                'action': action,
                'team_id': team_id,
                'image_id': image_id,
                'target': type
            };

            var html_content = 'Etes-vous sûr(e) de vouloir ';
            if (action == 'add') {
                html_content += 'ajouter '
            } else if (action == 'remove') {
                html_content += 'retirer '
            }
            if (type == 'image_complete') {
                html_content += 'l\'image ' + image_id + ' à cette équipe?'
            }
            else if (type == 'malus') {
                html_content += 'un malus à cette équipe?'
            }
            else if (type == 'late_malus') {
                html_content += 'un malus de retard à cette équipe?'
            }

        }

        $('#confirm_data_tagquest').val(JSON.stringify(data));
        $('#confirm_action_modal_tagquest .modal-body').html(html_content);
    })
}

/*
 * Confirm action on click ok -> specific tagquest
 **
 */
function confirmActionTagquest() {
    $('#confirm_action_tagquest').click(function () {
        var confirm_data = $('#confirm_data_tagquest').val();
        var confirm_data = jQuery.parseJSON(confirm_data);
        console.log(confirm_data);
        if (confirm_data.target == 'image_complete' || confirm_data.target == 'malus' || confirm_data.target == 'late_malus') {
            addRemovePointsTagquest(confirm_data);
        }
        $('#confirm_action_modal_tagquest').modal('hide')
    })
}

/*
 * Add/remove point to/from team
 **
 */
function addRemovePointsTagquest(data) {
    var game_victory_type = $('#game_victory_type').val();
    console.log('game_victory_type');
    console.log(game_victory_type);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: $('#add_remove_points').val(),
        data: data,
        success: function (response) {
            console.log('response');
            console.log(response);
            console.log('data');
            console.log(data);

            if (game_victory_type == 'score') {

                if (data.target == 'image_complete') {
                    var times_retreived = response.images[data.image_id].times,
                        image_score = response.images[data.image_id].score,
                        html = ' x ' + times_retreived + ' = ' + image_score;
                    $('#image_cell_' + data.team_id + '_' + data.image_id + ' .times_and_score').html(html);

                    var combos = response.combo;
                    $('.combo_team_' + data.team_id + '.combo_2').html('x ' + response.combo[2].times + ' = ' + response.combo[2].score);
                    $('.combo_team_' + data.team_id + '.combo_4').html('x ' + response.combo[4].times + ' = ' + response.combo[4].score);
                    $('.combo_team_' + data.team_id + '.combo_6').html('x ' + response.combo[6].times + ' = ' + response.combo[6].score);
                } else if (data.target == 'malus') {
                    html = ' x ' + response.malus.times_malus + ' = -' + response.malus.total_malus_points;
                    $('#malus_cell_' + data.team_id + ' .times_and_score').html(html);
                } else if (data.target == 'late_malus') {
                    html = ' x ' + response.malus.times_late_malus + ' = -' + response.malus.total_late_malus_points;
                    $('#late_malus_cell_' + data.team_id + ' .times_and_score').html(html);
                }
                $('.score_' + data.team_id).html(response.total_score);

                /**** Update values in table and modal ****/
                //Général
                $('#score_team_'+ data.team_id).html(response.total_score);
                //Malus
                $('#modal_team_details_' +data.team_id +' .malus_times').html(response.malus['times_malus']);
                $('#modal_team_details_' +data.team_id +' .malus_points').html(response.malus['malus_points']);
                //Late Malus
                $('#modal_team_details_' +data.team_id +' .late_malus_times').html(response.malus['times_late_malus']);
                $('#modal_team_details_' +data.team_id +' .late_malus_points').html(response.malus['total_late_malus_points']);
                //Combos
                var combos = [2, 4, 6];
                $(combos).each(function(index, combo){
                    $('#modal_team_details_' +data.team_id +' .combo_'+combo+'_times').html(response.combo[combo].times);
                    $('#modal_team_details_' +data.team_id +' .combo_'+combo+'_score').html(response.combo[combo].score);
                })
                

                //Images
                    $('#modal_team_details_' +data.team_id +' .image_container_'+ data.image_id+' .modal_times').html(response.images[data.image_id].times);
                    $('#modal_team_details_' +data.team_id + ' .image_container_'+ data.image_id+' .modal_total').html(response.images[data.image_id].score);

                console.log('skff');
                console.log($('#score_team_'+ data.team_id));
            }
            else if (game_victory_type == 'speed') {
                if (data.target == 'image_complete') {
                    $('#modal_team_details_' +data.team_id +' .image_container_'+ data.image_id+' .modal_times').html(response.images[data.image_id].times);
                    $('#modal_team_details_' +data.team_id + ' .image_container_'+ data.image_id+' .modal_total').html(response.images[data.image_id].score);

                   $('#total_good_answers_team_'+data.team_id).html(response.images_retreived)
                    
                    // var times_retreived = response.images[data.image_id].times,
                    //     html = ' x ' + times_retreived;
                    // $('.image_complete[data-team="' + data.team_id + '"][data-image="' + data.image_id + '"] .times_and_score').html(html);
                }
            }


        },
        error: function (data) {
            console.log(data);
        }
    });
}


/*
 * Well...starts the game...obviously
 **
 */
function startGame() {
    $('#start_game').click(function (e) {
        var data = {
            'launched_game_id': $('#launched_game_id').val(),
        };
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'POST',
            url: game_url+'/startGame',
            data: data,
            success: function (response) {
                console.log(response);
                location.reload();
            },
            error: function (data) {
                console.log(data);
            }
        });
    });
}

