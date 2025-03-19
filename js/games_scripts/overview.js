var game_url;
jQuery(document).ready(function ($) {
    'use strict';
    game_url = $('#game_url').val();

    // removeDevice();
    // print($);
    createTable();
    showUpdateTeamName();
    setAutoTeamNameOnAddTeam();
    // $('#get_scores').click(function () {
    //     location.reload();
    // })

    toggleColumns($('.team_details'));
    toggleColumnsOnClick('#toggle_scores', $('.team_scores'));
    toggleColumnsOnClick('#toggle_team_details', $('.team_details'));

    confirmActionModal();
    confirmAction();

    confirmActionUpdateTeamName();
    confirmActionUpdateTeamStart();
    confirmActionUpdateTeamEnd();
    loadTeamDetailsInModal();
    // loadTeamHistoryInModal();
    refreshTable();

    scrollToIndex();
});


function initTable(data_table_head, ranking = false, enigmas = false) {
    if(enigmas){
        $('#table_enigmas').bootstrapTable({
            columns: [
                data_table_head
            ],
            onAll: function (name, args) {
                if (name == 'load-success.bs.table' || name == 'post-body.bs.table') {
              
                }
            },
            onLoadSuccess: function (data) {
                $('[data-bs-toggle="tooltip"]').tooltip();
            }
        })
    }else{
        $('#table_teams').bootstrapTable({
            columns: [
                data_table_head
            ],
            onAll: function (name, args) {
                if (name == 'load-success.bs.table' || name == 'post-body.bs.table') {
                    if (!ranking) {
                        loadTeamDetailsInModal();
                        loadTeamHistoryInModal();
                    }
    
                }
            },
            onLoadSuccess: function (data) {
                $('[data-bs-toggle="tooltip"]').tooltip();

            }
        })
    }


}

function print() {
    console.log('in pruint');

    $('.print_team').on('click', function () {
        printJS({
            printable: $(this).attr('data-print-url'),
            maxWidth: 375,
            type: 'json',
            showModal: true
        })
        // console.log('in click');
        // let CSRF_TOKEN = $('meta[name="csrf-token"').attr('content');

        // $.ajaxSetup({
        //     url: $(this).attr('data-print-url'),
        //     type: 'GET',
        //     data: {
        //         _token: CSRF_TOKEN,
        //     },
        //     beforeSend: function() {
        //         console.log('printing ...');
        //     },
        //     complete: function(response) {
        //         console.log(response); 
        //     }
        // });

        // $.ajax({
        //     success: function(viewContent) {
        //         printJS({
        //             printable: $(this).attr('data-print-url'),
        //             maxWidth: 375,
        //             type: 'html',
        //             showModal:true
        //           })
        //         // $.print(viewContent, {
        //         //     globalStyles: false,
        //         //     mediaPrint: true
        //         // });
        //     }
        // });
    });
}

function scrollToIndex() {
    var $table = $('#table_teams');
    $('#button_to_index').click(function () {
        console.log('in click button');
        var index = $('#scroll_to_index_input').val();
        console.log(index);
        $table.bootstrapTable('scrollTo', { unit: 'rows', value: index });
    });
    return true;
    // $table.bootstrapTable('scrollTo', {unit: 'rows', value: index})
}
/*
 * Refresh Table on click
 **
 */
function refreshTable() {
    $('#get_scores').click(function () {
        var $table = $('#table_teams');
        $table.bootstrapTable('refresh');
    })

}

/*
 * On click show  team details load team details with ajax => insert view in modal_body
 **
 */
function loadTeamDetailsInModal() {
    console.log('in 2sqdqsd');

    // $('.action-icon.action-icon-small').on('click', function (e) {
     $('.open_team_modal').on('click', function (e) {
        console.log(e.target);
        var modal_target = $(e.target).attr('data-bs-target');


        console.log('in displayTeamDetailsInModal');
        console.log(modal_target);
            var team_number = modal_target.replace("#modal_team_details_", ""),
                teamModal = $(modal_target);

     
            teamModal[0].addEventListener('shown.bs.modal', function () {
                console.log('uisdf');
                displayTeamDetailsInModal(modal_target, team_number);
            })
    })

}
function displayTeamDetailsInModal(modal_target, team_number) {
    $(modal_target+' .modal-body-content').empty();
    showLoadingModalSpinner(modal_target);
    var data = {
        'launched_game_id': $('#launched_game_id').val(),
        'gameType': $('#gameType').val(),
        'viewType': $('#viewType').val(),
        'team_number': team_number
    };

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: $('#getTeamDetailsUrl').val(),
        data: data,
        success: function (response) {
            console.log('in ajax');
            console.log(response);
            if (response) {
                console.log('uinsqdqsd');
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
 * On click show  team details load team details with ajax => insert view in modal_body
 **
 */
function loadTeamHistoryInModal() {

    $('.view_team_history_team').click(function (e) {

        $('#modal_team_history .modal_team_title span').html('');

        var modal_target = $(e.target).attr('data-bs-target'),
            team_name = $('#table_team_name_14').text(),
            teamModal = $(modal_target);
        $(modal_target + ' .modal-body .modal-body-content').html('');
        $('#modal_team_history .modal_team_title span').html(team_name);
  
        showLoadingModalSpinner(modal_target);


        var data = {
            'launched_game_id': $('#launched_game_id').val(),
            'gameType': $('#gameType').val(),
            'viewType': $('#viewType').val(),
            'team_number': $(e.target).attr('data-team'),
            'game_collaboration': $('#gameCollaboration').val()
        };

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'GET',
            url: $('#getTeamHistoryUrl').val(),
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

    })

}




/*
 * On show modal  update team name change hidden inupt team number
 *
 */
function confirmActionUpdateTeamName() {
    $('#udpate_team_name').on('show.bs.modal', function (event) {
        var target_i = $(event.relatedTarget), // Button that triggered the modal
            launched_game_id = $('#launched_game_id').val();
        $('#update_team_name_team').val($(target_i).data('team'))
    })
}
function confirmActionUpdateTeamStart() {
    $('#udpate_team_start').on('show.bs.modal', function (event) {
        var target_i = $(event.relatedTarget), // Button that triggered the modal
            launched_game_id = $('#launched_game_id').val();
        $('#update_team_start_team').val($(target_i).data('team'))
    })
}
function confirmActionUpdateTeamEnd() {
    $('#udpate_team_end').on('show.bs.modal', function (event) {
        var target_i = $(event.relatedTarget), // Button that triggered the modal
            launched_game_id = $('#launched_game_id').val();
        $('#update_team_end_team').val($(target_i).data('team'))
    })
}
/*
 * On show modal confirm action
 **
 */
function confirmActionModal() {

    $('#confirm_action_modal').on('show.bs.modal', function (event) {
        var target_i = $(event.relatedTarget), // Button that triggered the modal
            launched_game_id = $('#launched_game_id').val();

            
        if ($(target_i).hasClass('end_team')) {
            var html_content = 'Etes-vous sûr(e) de vouloir mettre fin au jeu de cette équipe?';
            var data = {
                'launched_game_id': launched_game_id,
                'team_id': $(target_i).data('team'),
                'target': 'end_team',
            };

        } else if ($(target_i).attr('id') == 'end_game') {

            var html_content = 'Etes-vous sûr(e) de vouloir terminer le jeu pour toutes les équipes?';
            var data = {
                'launched_game_id': launched_game_id,
                'target': 'end_game'
            }

        }
        else if ($(target_i).hasClass('reset_team')) {
            if($(target_i).attr('data-reset') == 'full'){
                var html_content = 'Êtes-vous sûr(e) de vouloir réinitialiser les points et les heures de départ et d\'arrivée de cette équipe?';
            }else{
                var html_content = 'Êtes-vous sûr(e) de vouloir réinitialiser les points et l\'heure d\'arrivée de cette équipe?';
            }
 
            var data = {
                'launched_game_id': launched_game_id,
                'team_id': $(target_i).data('team'),
                'target': 'reset_team',
                'reset' : $(target_i).attr('data-reset'),
                'gameType': $('#gameType').val(),
                'viewType': $('#viewType').val(),
            };
        } 
        else {

            var action = $(target_i).attr('data-action'),
                parent = $(target_i).closest('.action'),
                image_id = $(target_i).attr('data-image'),
                team_id = $(target_i).attr('data-team'),
                target = $(target_i).attr('data-target');

            var data = {
                'launched_game_id': launched_game_id,
                'action': action,
                'target': target,
                'team_id': team_id,
                'image_id': image_id,
            };

            console.log(target);
            var html_content = 'Etes-vous sûr(e) de vouloir ';
            if (action == 'add') {
                html_content += 'ajouter '
            } else if (action == 'remove') {
                html_content += 'retirer '
            }
            if (target == 'image_complete') {
                html_content += 'l\'image ' + image_id + ' à cette équipe?'
            }
            if (target == 'malus') {
                html_content += 'un malus à cette équipe?'
            }
        }
        $('#confirm_data').val(JSON.stringify(data));
        $('#confirm_action_modal .modal-body').html(html_content);
    })
}

function confirmAction() {
    $('#confirm_action').click(function () {

        var confirm_data = $('#confirm_data').val();
        confirm_data = jQuery.parseJSON(confirm_data);
        console.log('confirm_data');
        console.log(confirm_data);
        if (confirm_data.target == 'end_team' || confirm_data.target == 'respawn_team') {
            end_team(confirm_data);
        } else if (confirm_data.target == 'end_game') {
            endGame(confirm_data);
        } 
        else if (confirm_data.target == 'reset_team') {
            resetTeam(confirm_data)
        }
        $('#confirm_action_modal').modal('hide')
    });

    $('#confirm_update_team_name').click(function () {
        updateTeamName();
    });
    $('#confirm_update_team_start').click(function () {
        updateTeamStart();
    });
    $('#confirm_update_team_end').click(function () {
        updateTeamEnd();
    });


}

/*
 * Ajax call to reset a team
 **
 */
 function resetTeam(data) {

    resetTeamUrl = $('#resetTeamUrl').val();

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: resetTeamUrl,
        data: data,
        success: function (response) {
            console.log(response);
            console.log('in resp');

            modal_target = '#modal_team_details_'+data.team_id;
            displayTeamDetailsInModal(modal_target, data.team_id);

            $('#table_team_status_'+data.team_id).html('Jeu en cours');
            $('#table_team_time_'+data.team_id).html('');
            $('#table_team_score_'+data.team_id).html('0');
            $('#table_team_status_'+data.team_id).html(response.team_status);
            $('.score_'+data.team_id).html('0');
            $(modal_target+ ' .modal_team_status').html(response.team_status);
            
            showFlashMessage('alert-success', 'Equipe '+data.team_id+ ' réinitialisée');
        },
        error: function (data) {
            console.log(data);
        }
    });
}
/*
 * Ajax Call to end the team game
 **
 */
function endGame(data) {
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
        url: $('#endGameUrl').val(),
        data: data,
        success: function (response) {
            console.log(response);
            showFlashMessage('alert-success', 'Jeu terminé');
            $('.game_ended').show();
            $('.game_timer').hide();
        },
        error: function (data) {
            console.log(data);
            showFlashMessage('alert-error', 'Une erreur est survenue');
        }
    });
}

/*
 * Ajax Call to end the team game
 **
 */
function end_team(data) {

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: $('#endTeamUrl').val(),
        data: data,
        success: function (response) {
            if (data.target == 'end_team') {
                $('#status_team_' + data.team_id + ' i').addClass('ended');
                $('#status_team_' + data.team_id + ' i').addClass('respawn_team');
                $('#status_team_' + data.team_id + ' i').removeClass('end_team');

            } else if (data.target == 'respawn_team') {
                $('#status_team_' + data.team_id + ' i').removeClass('ended');
                $('#status_team_' + data.team_id + ' i').removeClass('respawn_team');
                $('#status_team_' + data.team_id + ' i').addClass('end_team');
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function setAutoTeamNameOnAddTeam() {
    $('#team_key').on('change', function () {
        var text = $(this).find(":selected").text();
        var exploded = text.split(' - ');
        $('#team_name').val(exploded[1]);
    });
}



/*
 * Ajax Call to update the team start time
 **
 */
function updateTeamStart() {

    var data = {
        'launched_game_id': $('#launched_game_id').val(),
        'team_id': $('#update_team_start_team').val(),
        'new_team_start': $('#new_team_start').val(),
    };
    console.log(data);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: $('#update_team_start_url').val(),
        data: data,
        success: function (response) {
            console.log(response);
            // game_started_at_string
            // var team_number = response.team_number;
            $('#modal_team_details_' + response.team_number + ' .modal_team_timing_start span').html(response.game_started_at_string);
            $('#modal_team_details_' + response.team_number + ' .modal_team_time span').html(response.time.time.time);
            $('#score_team_' + data.team_id).html(response.total_points);
            $('#table_team_score_' + data.team_id).html(response.total_points);
            if (response.game_ended) {
                $('#modal_team_details_' + response.team_number + ' .modal_team_status').html('Jeu terminé');
                $('#table_team_status_' + data.team_id).html('Jeu terminé');
                $('#table_team_time_' + data.team_id).html(response.time.time.time);

            } else {
                $('#modal_team_details_' + response.team_number + ' .modal_team_status').html('Jeu en cours');
                $('#table_team_status_' + data.team_id).html('Jeu en cours');
            }

            if (response.time.time.over) {
                $('#modal_team_details_' + response.team_number + ' .modal_team_time_malus').html('-' + response.time.time.malus);
                $('#modal_team_details_' + response.team_number + ' .modal_team_timing_malus').show();
            } else {
                $('#modal_team_details_' + response.team_number + ' .modal_team_timing_malus').hide();
            }

            // $('#modal_team_details_' + response.team_number + ' .modal_team_title span').html(response.team_name);
            // $('#table_team_name_' + response.team_number).html(response.team_name);
            // // $('#team_name_div_' + tea_number).html(response.team_name);
            // // $('#update_team_name_' + team_number).show();
            // // $('#update_team_name_submit_' + team_number).hide();
            // // $('#team_name_input_container_' + team_number).hide();
            // // $('#cancel_update_team_name_' + team_number).hide();
            // // $('#team_name_input_' + team_number).val('');
            // // $('#confirm_update_team_name').modal('hide');
            $('#udpate_team_start').modal('hide');
        },
        error: function (data) {
            console.log(data);
        }
    });
}
/*
 * Ajax Call to update the team end_time
 **
 */
function updateTeamEnd() {
    console.log('in defdf');
    var data = {
        'launched_game_id': $('#launched_game_id').val(),
        'team_id': $('#update_team_end_team').val(),
        'new_team_end': $('#new_team_end').val(),
    };
    console.log(data);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: $('#update_team_end_url').val(),
        data: data,
        success: function (response) {
            console.log(response);

            $('#modal_team_details_' + response.team_number + ' .modal_team_timing_end span').html(response.game_ended_at_string);
            $('#modal_team_details_' + response.team_number + ' .modal_team_time span').html(response.time.time.time);
            $('#modal_team_details_' + response.team_number + ' .modal_team_status').html('Jeu terminé');
            $('#table_team_status_' + data.team_id).html('Jeu terminé');
            $('#table_team_time_' + data.team_id).html(response.time.time.time);
            $('#score_team_' + data.team_id).html(response.total_points);
            $('#table_team_score_' + data.team_id).html(response.total_points);
            if (response.time.time.over) {
                $('#modal_team_details_' + response.team_number + ' .modal_team_time_malus').html('-' + response.time.time.malus);
                $('#modal_team_details_' + response.team_number + ' .modal_team_timing_malus').show();
            } else {
                $('#modal_team_details_' + response.team_number + ' .modal_team_timing_malus').hide();
            }




            // var team_number = response.team_number;

            // $('#modal_team_details_' + response.team_number + ' .modal_team_title span').html(response.team_name);
            // $('#table_team_name_' + response.team_number).html(response.team_name);
            // // $('#team_name_div_' + tea_number).html(response.team_name);
            // // $('#update_team_name_' + team_number).show();
            // // $('#update_team_name_submit_' + team_number).hide();
            // // $('#team_name_input_container_' + team_number).hide();
            // // $('#cancel_update_team_name_' + team_number).hide();
            // // $('#team_name_input_' + team_number).val('');
            // // $('#confirm_update_team_name').modal('hide');
            $('#udpate_team_end').modal('hide');
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/*
 * Ajax Call to update the team name
 **
 */
function updateTeamName(data) {

    var data = {
        'launched_game_id': $('#launched_game_id').val(),
        'team_id': $('#update_team_name_team').val(),
        'new_name': $('#new_team_name').val(),
    };
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: $('#update_team_name_url').val(),
        data: data,
        success: function (response) {
            console.log(response);

            var team_number = response.team_number;

            $('#modal_team_details_' + response.team_number + ' .modal_team_title span').html(response.team_name);
            $('#table_team_name_' + response.team_number).html(response.team_name);
            // $('#team_name_div_' + tea_number).html(response.team_name);
            // $('#update_team_name_' + team_number).show();
            // $('#update_team_name_submit_' + team_number).hide();
            // $('#team_name_input_container_' + team_number).hide();
            // $('#cancel_update_team_name_' + team_number).hide();
            // $('#team_name_input_' + team_number).val('');
            // $('#confirm_update_team_name').modal('hide');
            $('#udpate_team_name').modal('hide');
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/*
 * Show/hide udpdate team name input
 **
 */
function showUpdateTeamName() {


    $('.update_team_name').click(function (e) {
        console.log($(this));
        var target = e.target,
            team_number = $(target).attr('data-team');
        $('#update_team_name_' + team_number).hide();
        $('#update_team_name_submit_' + team_number).show();
        $('#team_name_input_container_' + team_number).show();
        $('#cancel_update_team_name_' + team_number).show();
    });

    $('.cancel_update_team_name').click(function (e) {
        var target = e.target,
            team_number = $(target).attr('data-team');
        $('#update_team_name_' + team_number).show();
        $('#update_team_name_submit_' + team_number).hide();
        $('#team_name_input_container_' + team_number).hide();
        $('#cancel_update_team_name_' + team_number).hide();
        $('#team_name_input_' + team_number).val('');
    });
}

/*
 * Show/hide columns on click button
 **
 ** @param objects elements
 ** @param string target
 **
 */
function toggleColumnsOnClick(target, elements) {
    $(target).click(function (e) {
        toggleColumns(elements)
    });
}

/*
 * Show/hide columns
 **
 ** @param objects elements
 **
 */
function toggleColumns(elements) {
    $(elements).each(function (index, element) {
        $(element).parent('td').toggle();
        $(element).parents('th').toggle();
    })
}

/*
 * Create table from team data.
 **
 ** @param string game_collaboration => solo or team
 ** @param array array_scores
 ** @param object enigmas
 ** @param object teams
 */
function createTable() {

    columns = false;
    if ($('#table_head').val()) {
        columns = $.parseJSON($('#table_head').val());
    }
    data = false;
    if ($('#table_body').val()) {
        data = $.parseJSON($('#table_body').val());

        var table = $('.table_sortable').tableSortable({
            data: data,
            columns: columns,
            // sorting: ['score', 'ranking'],
            searchField: $('.table_search'),
            rowsPerPage: 10,
            pagination: true,
            tableDidUpdate: function () {
                action();
            },
            formatCell: function (row, key) {
                return row[key];
            }

        });
    }
}

