jQuery(document).ready(function ($) {
    'use strict';

    // toggleColumns($('.enigma_cell'));
    // toggleColumnsOnClick('#toggle_enigmas', $('.enigma_cell'));

    confirmModalActionSurvival();
    confirmActionSurvival();
});

/*
 * On show modal confirm action -> specific survival
 **
 */
function confirmModalActionSurvival() {
    $('#confirm_action_modal_survival').on('show.bs.modal', function (event) {
        var target_i = $(event.relatedTarget), // Button that triggered the modal
            launched_game_id = $('#launched_game_id').val();

        console.log(target_i);

        if ($(target_i).hasClass('respawn_team')) {
            var html_content = 'Êtes-vous sûr(e) de vouloir remettre en jeu cette équipe?';
            var data = {
                'launched_game_id': launched_game_id,
                'team_id': $(target_i).data('team'),
                'target': 'respawn_team',
            };

        } 
         else if ($(target_i).hasClass('remove_team')) {
            var html_content = 'Êtes-vous sûr(e) de vouloir supprimer cette équipe?';
            var data = {
                'launched_game_id': launched_game_id,
                'team_id': $(target_i).data('team'),
                'target': 'remove_team',
            };
        } else if ($(target_i).hasClass('cancel_team_start')) {
            var html_content = 'Êtes-vous sûr(e) de vouloir annuler le départ cette équipe? Cette action annulera aussi la fin de l\'équipe';
            var data = {
                'launched_game_id': launched_game_id,
                'team_id': $(target_i).data('team'),
                'target': 'cancel_team_start',
            };
        } else if ($(target_i).hasClass('cancel_team_end')) {
            var html_content = 'Êtes-vous sûr(e) de vouloir annuler la fin de cette équipe?';
            var data = {
                'launched_game_id': launched_game_id,
                'team_id': $(target_i).data('team'),
                'target': 'cancel_team_end',
            };
        } else if ($(target_i).hasClass('toggle_enigma')) {

            var team_id = $(target_i).data('team'),
                action = $(target_i).data('action'),
                enigma_id = $(target_i).data('enigma');
            console.log(action);
            console.log(enigma_id);
            var additional_text = 'ajouter une bonne réponse'
            if (action == "add_enigma_good") {
                additional_text = 'ajouter une bonne réponse';
            } else if (action == "remove_enigma_good") {
                additional_text = 'retirer une bonne réponse';
            } else if (action == "add_enigma_wrong") {
                additional_text = 'ajouter une mauvaise réponse';
            } else if (action == "remove_enigma_wrong") {
                additional_text = 'retirer une mauvaise réponse';
            }

            var html_content = 'Êtes-vous sûr(e) de vouloir ' + additional_text + ' à l\'équipe ' + team_id + '?';

            var data = {
                'launched_game_id': launched_game_id,
                'team_id': team_id,
                'target': 'update_team_enigma',
                'action': action,
                'enigma_id': enigma_id
            };
        }

        $('#confirm_data_survival').val(JSON.stringify(data));
        $('#confirm_action_modal_survival .modal-body').html(html_content);
    })
}

/*
 * Confirm action on click ok
 **
 */
function confirmActionSurvival() {
    $('#confirm_action_survival').click(function () {
        var confirm_data = $('#confirm_data_survival').val();
        var confirm_data = jQuery.parseJSON(confirm_data);

        console.log('confirm_data.target '+ confirm_data.target);
        if (confirm_data.target == 'update_team_enigma') {
            addRemovePointsSurvival(confirm_data)
        }
        else if (confirm_data.target == 'remove_team') {
            removeTeamSurvival(confirm_data)
        }
        else if (confirm_data.target == 'cancel_team_start') {
            cancelTeamStart(confirm_data)
        }
        else if (confirm_data.target == 'cancel_team_end') {
            cancelTeamEnd(confirm_data)
        }
   
        $('#confirm_action_modal_survival').modal('hide')
    })
}


/*
 * Ajax call to cancel the end a team
 **
 */
function cancelTeamEnd(data) {

    cancelTeamEndUrl = $('#cancelTeamEndUrl').val();
    console.log("ien end");
    console.log(cancelTeamEndUrl);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: cancelTeamEndUrl,
        data: data,
        success: function (response) {
            console.log(response);
            console.log('in resp');
            $('#modal_team_details_' + response.team_number + ' .modal_team_timing_end span').html('');
            $('#modal_team_details_' + response.team_number + ' .modal_team_status').html('Jeu en cours');
            $('#modal_team_details_' + response.team_number + ' .modal_team_time span').html('');
            $('#modal_team_details_' + response.team_number + ' .modal_team_time_malus').html('');
            $('#modal_team_details_' + response.team_number + ' .modal_team_timing_malus').hide();
            $('#table_team_status_'+data.team_id).html('Jeu en cours');
            $('#table_team_time_'+data.team_id).html('');
            // showFlashMessage('alert-success', 'Equipe '+data.team_id+ ' effacée');
        },
        error: function (data) {
            console.log(data);
        }
    });
}
/*
 * Ajax call to cancel the start of a team
 **
 */
function cancelTeamStart(data) {

    cancelTeamStartUrl = $('#cancelTeamStartUrl').val();
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: cancelTeamStartUrl,
        data: data,
        success: function (response) {
            console.log(response);
            console.log(data);
            $('#modal_team_details_' + response.team_number + ' .modal_team_timing_start span').html('');
            $('#modal_team_details_' + response.team_number + ' .modal_team_status').html('En attente du départ');
            $('#modal_team_details_' + response.team_number + ' .modal_team_timing_end span').html('');
            $('#modal_team_details_' + response.team_number + ' .modal_team_time span').html('');
            $('#modal_team_details_' + response.team_number + ' .modal_team_time_malus').html('');
            $('#modal_team_details_' + response.team_number + ' .modal_team_timing_malus').hide();
            $('#table_team_status_'+data.team_id).html('En attente du départ');
            $('#table_team_time_'+data.team_id).html('');
            $('#score_team_'+data.team_id).html(response.total_points);
            $('#table_team_score_'+data.team_id).html(response.total_points);
            // showFlashMessage('alert-success', 'Equipe '+data.team_id+ ' effacée');
        },
        error: function (data) {
            console.log(data);
        }
    });
}
/*
 * Ajax call to remove a team
 **
 */
function removeTeamSurvival(data) {

    removeTeamUrl = $('#removeTeamUrl').val();
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: removeTeamUrl,
        data: data,
        success: function (response) {
            console.log(response);
            console.log(data);
            var row_to_delete = $('#table_team_name_' + data.team_id).closest('tr').remove();
            showFlashMessage('alert-success', 'Equipe ' + data.team_id + ' effacée');
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/*
 * Ajax call to add or remove an enigma answer
 **
 */
function addRemovePointsSurvival(data) {

    updateTeamEnigmaUrl = $('#updateTeamEnigmaUrl').val();
    console.log(data);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: updateTeamEnigmaUrl,
        data: data,
        success: function (response) {
            console.log(response);

            $.each(response, function (index, value) {
                $('#' + index + '_team_' + data.team_id).html(value);
            });
            $('#table_team_score_' + data.team_id).html(response.score);
            if (data.action == 'add_enigma_good') {
                updatePointsHtml('right', 'add', data);
            } else if (data.action == 'remove_enigma_good') {
                updatePointsHtml('right', 'remove', data);
            } else if (data.action == 'add_enigma_wrong') {
                updatePointsHtml('wrong', 'add', data);
            } else if (data.action == 'remove_enigma_wrong') {
                updatePointsHtml('wrong', 'remove', data);
            }



        },
        error: function (data) {
            console.log(data);
        }
    });
}

function updatePointsHtml(type_points, action, data) {


    var previous_times = parseInt($('#modal_team_details_' + data.team_id + ' #enigma_container_' + data.enigma_id + ' .modal_team_enigma_' + type_points + '_answer_points .modal_times').html());
    var points = parseInt($('#modal_team_details_' + data.team_id + ' #enigma_container_' + data.enigma_id + ' .modal_team_enigma_' + type_points + '_answer_points .modal_points').html());
    var full_total = parseInt($('#modal_team_details_' + data.team_id + ' #enigma_container_' + data.enigma_id + ' .modal_team_enigma_total_points span').html());

    if (action == 'add') {
        var new_times = previous_times + 1;
    } else {
        var new_times = previous_times - 1;
    }

    var new_total = points * new_times;

    if (action == 'add') {
        var new_full_total = full_total + points;
    } else {
        var new_full_total = full_total - points;
    }


    console.log('previous_times' + previous_times);
    console.log('new_times' + new_times);

    console.log('full_total' + full_total);
    console.log('new_full_total' + new_full_total);
    $('#modal_team_details_' + data.team_id + ' #enigma_container_' + data.enigma_id + ' .modal_team_enigma_' + type_points + '_answer_points .modal_times').html(new_times);
    $('#modal_team_details_' + data.team_id + ' #enigma_container_' + data.enigma_id + ' .modal_team_enigma_' + type_points + '_answer_points .modal_total').html(new_total);
    $('#modal_team_details_' + data.team_id + ' #enigma_container_' + data.enigma_id + ' .modal_team_enigma_total_points span').html(new_full_total);
    // $('#table_team_score_'+data.team_id).html(new_full_total);
    //Total points
}