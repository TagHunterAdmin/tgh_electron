jQuery(document).ready(function ($) {
    'use strict';

    // toggleColumns($('.enigma_cell'));
    // toggleColumnsOnClick('#toggle_enigmas', $('.enigma_cell'));

    confirmModalActionInvestigation();
    confirmActionInvestigation();

    $('.show_enigma_modal').click(function (e) {
        console.log($(this).attr('data-enigma'));
        var enigma_number = $(this).attr('data-enigma');


        //get enigma data
        showEnigmaDetailsInModal(enigma_number);

    })
});


function showEnigmaDetailsInModal() {
    $('#modal_enigma  .modal-body').html('');
    $('#modal_enigma .modal_enigma_number').html(enigma_number);

    showLoadingModalSpinner("modal_enigma");


    var data = {
        'launched_game_id': $('#launched_game_id').val(),
        'enigma_number': enigma_number
    };

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: $('#getEnigmaDetailsUrl').val(),
        data: data,
        success: function (response) {
            console.log(response);
            if (response) {
                hideLoadingModalSpinner(modal_target);
                $(modal_target + ' .modal-body .modal-body-content').html(response.html);
            } else {
            }

        },
        error: function (data) {

            console.log(data);
        }
    });
}

/*
 * On show modal confirm action -> specific survival
 **
 */
function confirmModalActionInvestigation() {
    $('#confirm_action_modal_investigation').on('show.bs.modal', function (event) {
        var target_i = $(event.relatedTarget), // Button that triggered the modal
            launched_game_id = $('#launched_game_id').val();

        console.log(target_i);
        if ($(target_i).hasClass('toggle_enigma')) {

            var team_id = $(target_i).data('team'),
                action = $(target_i).data('action'),
                enigma_id = $(target_i).data('enigma');
            console.log(action);
            console.log(enigma_id);
            var additional_text = 'définir comme bonne réponse'
            if (action == "resolved") {
                additional_text = 'définir comme bonne réponse';
            } else if (action == "failed") {
                additional_text = 'définir comme mauvaise réponse';
            } else if (action == "skipped") {
                additional_text = 'définir comme réponse passée';
            }
            else if (action == "not_yet") {
                additional_text = 'définir comme enigme non proposée';
            }

            var html_content = 'Etes-vous sûr(e) de vouloir ' + additional_text +'?';

            var data = {
                'launched_game_id': launched_game_id,
                'action': action,
                'enigma_id': enigma_id
            };
        }

        $('#confirm_data_investigation').val(JSON.stringify(data));
        $('#confirm_action_modal_investigation .modal-body').html(html_content);
    })
}

/*
 * Confirm action on click ok
 **
 */
function confirmActionInvestigation() {
    $('#confirm_action_investigation').click(function () {
        var confirm_data = $('#confirm_data_investigation').val();
        var confirm_data = jQuery.parseJSON(confirm_data);

        console.log(confirm_data);
        console.log($(updateEnigmaStatusUrl).val());
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'POST',
            url: $(updateEnigmaStatusUrl).val(),
            data: confirm_data,
            success: function (response) {
                console.log(response);
                console.log('in resp');
                $('#enigma_'+confirm_data.enigma_id+'_status_container').empty();
                $('#enigma_none_status_'+confirm_data.action+'_container span').clone().appendTo( '#enigma_'+confirm_data.enigma_id+'_status_container');

                $('#answers_container #resolved span').html(response['count_found_enigmas']);
                $('#answers_container #failed span').html(response['count_failed_enigmas']);
                $('#answers_container #skipped span').html(response['count_skipped_enigmas']);
                $('#answers_container #total span').html(response['total_enigmas']);
                $('#answers_container #main_score span').html(response['score']);

            },
            error: function (data) {
                console.log(data);

            }
        });

        $('#confirm_action_modal_investigation').modal('hide')
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
            $('#table_team_status_' + data.team_id).html('Jeu en cours');
            $('#table_team_time_' + data.team_id).html('');
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
            $('#table_team_status_' + data.team_id).html('En attente du départ');
            $('#table_team_time_' + data.team_id).html('');
            $('#score_team_' + data.team_id).html(response.total_points);
            $('#table_team_score_' + data.team_id).html(response.total_points);
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