$(function () {

    $('#connect_to_the_web').click(function() {
        console.log($('#testConnection').val());
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            url: $('#testConnection').val(),
            type: 'GET',
            data: {
                user_id: $('#user_id').val(),
            },
            success: function(data) {
                console.log(data);
                if (data) {
                    console.log('connected');
                    showFlashMessage('alert-success', 'Vous êtes connecté à internet.');
                } else {
                    showFlashMessage('alert-danger', 'Il semblerait que vous n\'êtes pas connecté à internet');
                }
            }
        });
    });
    
    $('#resetApp').click(function (element) {
    });

    $('#clean_up').click(function (element) {

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'GET',
            url: 'config/clean_up',
            data: '',
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.log('error');
                console.log(data);
            }
        });
    });

    $('#update_games').click(function (element) {
        updateAjaxCall('config/updateGames', false)
    });
    $('#update_app').click(function (element) {
        udpateMain('update_app');
    });

    $('#updateDatabase').click(function (element) {
        udpateDatabase()
    });
});

function udpateMain(update_next_step) {

    $('#update_running').show();
    updateAjaxCall('config/updateApp', 'updateApp');

    var intervalUpdateDatabase = setInterval(function () {
        var responseUpdateApp = $('#updateApp').val();
        if (responseUpdateApp == 1) {
            clearInterval(intervalUpdateDatabase);
            setTimeout(function () {
                updateAjaxCall('config/updateDatabase', 'udpateDatabase');
            }, 2000)
        }
    }, 1000)

    var intervalUpdateGames = setInterval(function () {
        var responseUpdateDatabase = $('#udpateDatabase').val();
        if (responseUpdateDatabase == 1) {
            clearInterval(intervalUpdateGames);
            setTimeout(function () {
                updateAjaxCall('config/updateGames', 'updateGames');
            }, 2000)
        }

    }, 1000)

    var intervalUpdateAppClean = setInterval(function () {
        var responseupdateGames = $('#updateGames').val();
        console.log('responseupdateGames');
        console.log(responseupdateGames);
        if (responseupdateGames == 1) {
            console.log('indssdf');
            clearInterval(intervalUpdateAppClean);
            setTimeout(function () {
                updateAjaxCall('config/updateAppClean', 'updateAppClean');
            }, 2000)
        }
    }, 1000)

    var intervalend = setInterval(function () {
        var responseupdateAppClean = $('#updateAppClean').val();
        if (responseupdateAppClean == 1) {
            clearInterval(intervalend);
            setTimeout(function () {
                location.reload();
            }, 4000)
        }

    }, 1000)
}

function updateAjaxCall(url, hidden_input) {
    console.log('in updateAjaxCall');
    if (hidden_input) {
        $('#update_page_step_' + hidden_input + ' .fa-spinner').show();
    }

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: url,
        data: '',
        success: function (response) {
            console.log(response);
            if (hidden_input) {
                $('#' + hidden_input).val('1');
                $('#update_page_step_' + hidden_input + ' .fa-spinner').hide();
                $('#update_page_step_' + hidden_input + ' .fa-check').show();
            }
        },
        error: function (response) {
            if (hidden_input) {
                $('#' + hidden_input).val('1');
                $('#update_page_step_' + hidden_input + ' .fa-spinner').hide();
                $('#update_page_step_' + hidden_input + ' .fa-xmark').show();
            }
        }
    });
}

function animateProgressBar(step_index) {
    var count_steps = $('.step').length;
    var left = $('#step_container_' + step_index).position().left + $('#step_container_' + step_index).width();

    if (step_index + 1 == count_steps) {
        left = $('#step_container_' + step_index).position().left - 30;
    }

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
            $("#step_container_" + step_id).find('.level_line').css('opacity', '1');
            $(step).addClass('done');
        }
    })



}

function udpateApp() {

    $('#update_running h1').html('Mise à jour en cours');
    $('#update_running').css('display', 'flex');

    var update_steps_texts = JSON.parse($('#update_steps_texts').val());
    var key = Math.floor(Math.random() * (update_steps_texts.length - 1));
    var item = update_steps_texts[key];
    update_steps_texts.splice(key, 1);
    $('#update_steps_text').removeClass('hide');
    $('#update_steps_text span').html(item);
    var intervalSteps = setInterval(function () {
        if (update_steps_texts.length == 1) {
            update_steps_texts = JSON.parse($('#update_steps_texts').val());
        }
        key = Math.floor(Math.random() * (update_steps_texts.length - 1));
        item = update_steps_texts[key];
        update_steps_texts.splice(key, 1);

        $('#update_steps_text span').html(item);

    }, 5000);

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: 'config/updateApp',
        data: '',
        success: function (response) {
            console.log(response);
            $('#update_running').html('<h2>TagHunter a été mis à jour.</h2>');
            $('#update_steps_text').addClass('hide');
            clearInterval(intervalSteps);
            setTimeout(
                function () {
                    // location.reload();
                    // $('#update_running').css('display', 'none');

                }, 2000);
        },
        error: function (response) {
            console.log('error');
            console.log(response);
            $('#update_running').html(
                '<h2>Une erreur est survenue.</h2><h4>Veuillez réessayer plus tard. Si ce problème persiste, contactez notre service technique.</h4>'
            );
            setTimeout(
                function () {
                    // location.reload();
                    $('#update_running').css('display', 'none');

                }, 2000);
        }
    });

    setTimeout(function () {
        return 'app done';
    }, 2000)


}
function udpateDatabase() {
    /* test_update*/
    $('#update_running h1').html('Mise à jour de la base de données en coursssss');
    $('#update_running').css('display', 'flex');
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: 'config/updateDatabase',
        data: '',
        success: function (response) {
            console.log(response);
            $('#update_running').html(
                '<h2>La base de données TagHunter a été mis à jour.</h2>');
            setTimeout(
                function () {
                    // location.reload();
                    $('#update_running').css('display', 'none');

                }, 2000);
        },
        error: function (response) {
            console.log('error');
            console.log(response);
            $('#update_running').html(
                '<h2>Une erreur est survenue.</h2><h4>Veuillez réessayer plus tard. Si ce problème persiste, contactez notre service technique.</h4>'
            );
            setTimeout(
                function () {
                    // location.reload();
                    $('#update_running').css('display', 'none');

                }, 2000);
        }
    });

    return 'db done';
}
