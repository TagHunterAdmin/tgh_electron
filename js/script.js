
if (typeof Dropzone !== 'undefined') {
    Dropzone.autoDiscover = false;
}

$(function () {

    $('#confirm_update_server_date_time').click(function () {
        updateServerDateTime();
    });
    loadLaunchedGameDevicesInModal();
    viewDeviceRawData();
    copyToClipboard();

    if ($('.dropzone').length) {

        addDropzones();
    }

    removeDevice();
    $('[data-bs-toggle="tooltip"]').tooltip();

    function formatState(state) {
        if (!state.id) {
            return state.text;
        }

        return $(
            '<option style="' + $(state.element).data('style') + '"> ' + state.text + '</div>'
        );
    };



    $('select').select2({
        templateResult: formatState
    }, function (e) {
    });

    // $('#clients').select2({
    //     dropdownParent: $('#add_licence_modal')
    // });
    var select_modals = $('.select_modal');

    $(select_modals).each(function (index, select_modal) {

        var id_modal = $(select_modal).closest(".modal").attr('id');
        $(select_modal).select2({
            dropdownParent: $('#' + id_modal)
        });
    })



    //   $('#select_font').on('select2:select', function (e) {
    //     $("#select_font").next().find('.select2-selection__rendered').css('font-family', e.params.data.id);
    //   });
    $('#bulkImportRedirectModal').on('hidden.bs.modal', function (e) {
        location.reload();
    })
});
(function ($bs) {
    const CLASS_NAME = 'has-child-dropdown-show';
    $bs.Dropdown.prototype.toggle = function (_orginal) {
        return function () {
            if ($(this._element).hasClass('btn')) {

            } else {
                document.querySelectorAll('.navbar .' + CLASS_NAME).forEach(function (e) {
                    e.classList.remove(CLASS_NAME);
                });
                console.log(this._element);
                let dd = this._element.closest('.dropdown').parentNode.closest('.dropdown');
                for (; dd && dd !== document; dd = dd.parentNode.closest('.dropdown')) {
                    dd.classList.add(CLASS_NAME);
                }
            }

            return _orginal.call(this);
        }
    }($bs.Dropdown.prototype.toggle);

    document.querySelectorAll('.navbar .dropdown').forEach(function (dd) {
        dd.addEventListener('hide.bs.dropdown', function (e) {
            if (this.classList.contains(CLASS_NAME)) {
                this.classList.remove(CLASS_NAME);
                e.preventDefault();
            }
            e.stopPropagation(); // do not need pop in multi level mode
        });
    });

    // for hover
    document.querySelectorAll('.navbar .dropdown-hover, .navbar .dropdown-hover-all .dropdown').forEach(function (dd) {
        dd.addEventListener('mouseenter', function (e) {
            let toggle = e.target.querySelector(':scope>[data-bs-toggle="dropdown"]');
            if (!toggle.classList.contains('show')) {
                $bs.Dropdown.getOrCreateInstance(toggle).toggle();
                dd.classList.add(CLASS_NAME);
                $bs.Dropdown.clearMenus();
            }
        });
        dd.addEventListener('mouseleave', function (e) {
            let toggle = e.target.querySelector(':scope>[data-bs-toggle="dropdown"]');
            if (toggle.classList.contains('show')) {
                $bs.Dropdown.getOrCreateInstance(toggle).toggle();
            }
        });
    });
})(bootstrap);

function viewDeviceRawData() {
    $('.view_device_raw_data').click(function (e) {

        $('#device_raw_data').modal('show');

        var device_id = $(e.target).attr('data-device-id'),
            launched_game_id = $(e.target).attr('data-launched-game-id'),
            device_name = $(e.target).attr('data-device-name');

        $('#device_raw_data .modal-header h2').html(device_name);

        var data = {
            'device_id': device_id,
            'launched_game_id': launched_game_id
        };
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'GET',
            url: $('#getDeviceRawDataUrl').val(),
            data: data,
            success: function (response) {
                console.log(response);
                if (response) {
                    hideLoadingModalSpinner('#device_raw_data');
                    $('#device_raw_data .modal-body .modal-body-content').html(response);
                } else {
                }

            },
            error: function (data) {

                console.log(data);
            }
        });

    });
}

/*
 * Launnch devices used for launched game.
 */
function loadLaunchedGameDevicesInModal() {
    $('.view_launched_game_devices').click(function (e) {

        console.log(('slfsdf'));
        console.log(e.target);

        $('#modal_team_history .modal_team_title span').html('');

        var launched_game_id = $(e.target).attr('data-launched-game-id'),
            modal_id = '#show_devices';

        $(modal_id + ' .modal-body .modal-body-content').html('');
        showLoadingModalSpinner(modal_id);


        var data = {
            'launched_game_id': launched_game_id,
        };

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        $.ajax({
            type: 'GET',
            url: $('#getLaunchedGameDevicesUrl').val(),
            data: data,
            success: function (response) {
                console.log(response);
                if (response) {
                    hideLoadingModalSpinner(modal_id);
                    $(modal_id + ' .modal-body .modal-body-content').html(response);
                } else {
                }
                viewDeviceRawData();
                removeDevice();
            },
            error: function (data) {

                console.log(data);
            }
        });

    })
}

/*
 * Show loading modal spinner
 *
 */
function showLoadingModalSpinner(modal_target) {
    $(modal_target + ' .modal-spinner').css('display', 'flex');
}
/*
 * Hide loading modal spinner
 *
 */
function hideLoadingModalSpinner(modal_target) {
    $(modal_target + ' .modal-spinner').hide();
}

function addDropzones() {

    const dropzones = [];
    $('.dropzone').each(function (i, el) {
        const form_url = $(el).closest('form').attr('action');
        const name = $(el).data('field');
        const uploadMultipleField = $(el).data('multiple');
        const uploadMultiple = uploadMultipleField == 1 ? 10 : 1;


        if (name != 'question_image_final' && name != 'answer_image_final') {
            let myDropzone = new Dropzone(el, {
                url: form_url,
                autoProcessQueue: false,
                uploadMultiple: true,
                maxFilesize: 512, // MB
                parallelUploads: 100,
                maxFiles: uploadMultiple,
                paramName: name,
                addRemoveLinks: true,
                previewTemplate: $('#preview-template_' + name).html(),
                dictRemoveFile: 'Annuler',
                dictDefaultMessage: "Glissez vos fichiers ici ou <strong>cliquez pour parcourir les fichiers</strong>"
            })

            dropzones.push(myDropzone);
        }

    })
    dropzones.forEach(dropzone => {
        if ($('#preview-template_' + dropzone.options.paramName + ' .media_input_text').length) {
            dropzone.on(
                'addedfile',
                function (file, response) {
                    console.log();
                    var paramName = this.options.paramName;
                    var last_index = $('#preview-template_' + paramName + '_hidden').val();
                    $('#' + paramName + '_input_container .media_input_text').each(function (index, element) {

                        if ($(element).attr('data-index') == 'nope') {
                            $(element).attr('data-index', last_index);
                            $(element).attr('name', paramName + '_text_' + last_index);
                            $('#preview-template_' + paramName + '_hidden').val(parseInt(last_index) + 1);
                            return false;
                        }
                    })

                }
            )
        }

    });

    document.querySelector("button[type=submit]").addEventListener("click", function (e) {
        console.log('ine e eee');
        // Make sure that the form isn't actually being sent.
        $('#update_running').css('display', 'flex');
        e.preventDefault();
        e.stopPropagation();
        the_form = $(e.target).closest("form");
        let form = new FormData($(the_form)[0]);
        dropzones.forEach(dropzone => {
            let {
                paramName
            } = dropzone.options
            dropzone.files.forEach((file, i) => {
                form.append(paramName + '[' + i + ']', file)
            })
        })
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        console.log(form);
        $.ajax({
            method: 'POST',
            data: form,
            processData: false,
            contentType: false,
            url: the_form.attr('action'),
            success: function (response) {
                console.log(response);
                if (response['import']) {
                    console.log('in import');
                    displayRunningData(response);
                    var reordered_data_array = [];
                    $.each(response['data'], function (type_name, type) {
                        $(type).each(function (index, data) {

                            //refacto data array
                            // reordered_data_array[data['type']+'_'+data['original_id']] = data;
                            reordered_data_array.push(data);
                            // if (!data['imported']) {
                            //     importFromPath(response);
                            //     return false;
                            // }
                        })
                    }); 
                    response['to_import'] = reordered_data_array;
                    importFromPath(response);


                } else if(response['import_teams_name']){
                    if(typeof(response['error']) != "undefined" && response['error'] !== null ){
                        $('#import_names_messages .alert-danger').addClass('show');
                    }
                    else{
              
                        var names_array = response['names_array'];
                        console.log(names_array);
                        $.each(names_array, function(index, name){
                            var team_number = index+1;
                            $('#team_name_'+team_number).val(name);
                        })
                        
                        $('#button_collpase_import_names').click();
    
                        $('#import_names_messages .alert-success').addClass('show');
                    }
         

                } else {
                   location.reload();
                }
            },
            error: function (response) {
                console.log(response);
            }
        });
    });
}

function displayRunningData(response) {
    var count_loop = 0;
    $.each(response['data'], function (type_name, type) {
        if (type_name == 'game') {
            var type_text = 'Jeux';
        } else if (type_name == 'pattern') {
            var type_text = 'Modèles';
        }
        $('#update_running_data_container').append('<h2 id="category_' + type_name + '_container">' + type_text + '</h2>');

        $(type).each(function (index, data) {
            var icon = '<i class="fa-solid fa-spinner fa-spin"></i>';
            if (count_loop > 0) {
                icon = '<i class="fa-solid fa-pause"></i>';
            }
            $('#update_running_data_container').append('<div id="' + data['type'] + '_' + data['original_id'] + '">' + data["name"] + ' (' + data['category_name'] + ')' + icon + '</div>');
            count_loop++;
        })
    });
    if (response['ignored']) {
        $('#update_running_data_container').append('<h2 id="category_ignored_container">Imports interdits</h2>');
        $.each(response['ignored'], function (index, game) {
            $('#update_running_data_container').append('<div>' + game["name"] + ' (' + game['category_name'] + ') <i class="fa-solid fa-ban"></i></div>');
        });
    }

}

function updateRunningData(response) {
    $('#update_running_data_container #' + response['imported']['type'] + '_' + response['imported']['original_id'] + ' i').removeClass('fa-spinner');
    $('#update_running_data_container #' + response['imported']['type'] + '_' + response['imported']['original_id'] + ' i').removeClass('fa-spin');
    $('#update_running_data_container #' + response['imported']['type'] + '_' + response['imported']['original_id'] + ' i').addClass('fa-check');
    if (response['to_import'].length) {
        $('#update_running_data_container #' + response['to_import'][0]['type'] + '_' + response['to_import'][0]['original_id'] + ' i').addClass('fa-spin');
        $('#update_running_data_container #' + response['to_import'][0]['type'] + '_' + response['to_import'][0]['original_id'] + ' i').addClass('fa-spinner');
        $('#update_running_data_container #' + response['to_import'][0]['type'] + '_' + response['to_import'][0]['original_id'] + ' i').removeClass('fa-pause');
        importFromPath(response);
    } else {
        return 'reload'
    }

    // $.each(response['data'], function (type_name, type) {
    //     $(type).each(function (index, data) {

    //         if (!data['imported']) {
    //             $('#update_running_data_container #' + data['type'] + '_' + data['original_id'] + ' i').addClass('fa-spin');
    //             $('#update_running_data_container #' + data['type'] + '_' + data['original_id'] + ' i').addClass('fa-spinner');
    //             $('#update_running_data_container #' + data['type'] + '_' + data['original_id'] + ' i').removeClass('fa-pause');
    //             importFromPath(response);
    //             return false;
    //         }
    //         return false;
    //     })
    // });

    //  $('#update_running_data_container').append('<div id="line_' + response['imported']['original_id'] + '">' + data["name"] + ' (' + data['category_name'] + ')' + icon + '</div>');
    // count_loop++;


}
function importFromPath(response) {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        method: 'POST',
        data: response,
        url: $('#importFromPathUrl').val(),
        success: function (response) {
            console.log('inimportFromPathUrl');
            console.log(response);
            response_update = true;
            if (response['imported']) {
                response_update = updateRunningData(response);
            }
            if (response_update == "reload") {

                if ("game" in response['data']) {
                    $('#to_games_btn').css('display', 'inline-block');
                }
                if ("pattern" in response['data']) {
                    $('#to_pattern_survival_btn').css('display', 'inline-block');
                    $('#to_pattern_tagquest_btn').css('display', 'inline-block');
                }

                setTimeout(function () {
                    $('#update_running').css('display', 'none');
                    $('#bulkImportRedirectModal').modal('show');
                }, 4000);
                // 
                // 
                // console.log('in relaod');
                //  location.reload();

            }
        },
        error: function (response) {
            console.log(response);
            console.log('dddf');
        }
    });
}

function showLaunchRankingModal(launched_game_id) {
    $('#launch_ranking_modal').modal('show');
    $('#ranking_modal_launched_game_id').val(launched_game_id);
}
function redirectToRankingPage() {

    console.log(launched_game_id);
    var launched_game_id = $('#ranking_modal_launched_game_id').val(),
        animation_top_1 = $('#animation_top_1').is(':checked'),
        animation_top_3 = $('#animation_top_3').is(':checked'),
        animation_top_10 = $('#animation_top_10').is(':checked'),
        animation_top_value = $('#animation_top_value').val(),
        ranking_page_url = $('#ranking_page_url').val(),
        redirect_url = ranking_page_url + '?launched_game_id=' + launched_game_id + '&animation_top_1=' + animation_top_1 + '&animation_top_3=' + animation_top_3 + '&animation_top_10=' + animation_top_10 + '&animation_top_value=' + animation_top_value;
    window.location.replace(redirect_url);
}

function showFlashMessage(type, message) {

    $('.flash-message-ajax.' + type + ' strong').html(message);
    $('.flash-message-ajax.' + type).show();
}

function showSpinnerOnAction(element) {
    var origin_classes = $(element.target).attr('class');
    $(element.target).removeClass(origin_classes);
    $(element.target).addClass('fa-solid fa-spinner fa-spin');
    return origin_classes;
}
function hideSpinnerOnAction(element, origin_classes) {
    var spinner_classes = $(element.target).attr('class');
    $(element.target).removeClass(spinner_classes);
    $(element.target).addClass(origin_classes);
}
/*
 * Remove device from launched game
 **
 ** @param string game_collaboration => solo or team
 ** 
 */
function removeDevice() {

    $('.remove-device').click(function () {
        console.log($(this));
        var _this = $(this),
            device_id = _this.attr('data-device-id'),
            launched_game_id = _this.attr('data-launched-game-id'),
            update_device_url = $('#updateDeviceUrl').val();

        bootbox.confirm({
            message: 'Etes-vous sûr(e) de vouloir retirer ce poste?',
            buttons: {
                confirm: {
                    label: 'Oui',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'Non',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {

                console.log(launched_game_id);
                if (result) {
                    var data = {
                        'device_id': device_id,
                        'launched_game_id': launched_game_id,
                        'replace': device_id
                    };
                    $.ajaxSetup({
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        }
                    });
                    $.ajax({
                        type: 'POST',
                        url: update_device_url,
                        data: data,
                        success: function (response) {
                            type = 'alert-danger';
                            message = "Une erreur est survenue lors de la suppresion du poste " + device_id + " du jeu " + launched_game_id + ".";
                            if (response == 1) {
                                $('#device_'+ device_id+'_row').remove();
                                type = 'alert-success';
                                message = "Poste " + device_id + " supprimé du jeu " + launched_game_id + ".";
                            }
                            showFlashMessage(type, message)

                            console.log(response);
                        },
                        error: function (response) {
                            console.log(response);
                        }
                    });
                }
            }
        });
    })
}

function myFunction() {
    // Get the text field
    var copyText = document.getElementById("myInput");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);

    // Alert the copied text
    alert("Copied the text: " + copyText.value);
}
function copyToClipboard() {
    $('.can_be_copied').click(function (element) {
        var text = $(element.target).val();
        navigator.clipboard.writeText(text);
        showFlashMessage('alert-success', 'Text copié');
    })
}
function password_show_hide(id) {
    var x = document.getElementById(id);
    var show_eye = document.getElementById("show_eye");
    var hide_eye = document.getElementById("hide_eye");
    hide_eye.classList.remove("d-none");
    if (x.type === "password") {
        x.type = "text";
        show_eye.style.display = "none";
        hide_eye.style.display = "block";
    } else {
        x.type = "password";
        show_eye.style.display = "block";
        hide_eye.style.display = "none";
    }
}
function scaleUp($elt, sh, h) {
    $elt.animate({ height: sh }, function () {
        scaleDown($elt, sh, h);
    });
}

function scaleDown($elt, sh, h) {
    $elt.animate({ height: h }, function () {
        scaleUp($elt, sh, h);
    });
}

/*
 * Ajax Call to update the team start time
 **
 */
 function updateServerDateTime() {

    
    var new_date_time = $('#new_server_date_time').val();
    new_date_time = new_date_time.replace('T', ' ');

    var data = {
        'date_time': new_date_time,
    };
    console.log(data);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: $('#udpate_server_date_time_url').val(),
        data: data,
        success: function (response) {
            console.log(response);
   
            // $('#modal_team_details_' + response.team_number + ' .modal_team_title span').html(response.team_name);
            // $('#table_team_name_' + response.team_number).html(response.team_name);
            // // $('#team_name_div_' + tea_number).html(response.team_name);
            // // $('#update_team_name_' + team_number).show();
            // // $('#update_team_name_submit_' + team_number).hide();
            // // $('#team_name_input_container_' + team_number).hide();
            // // $('#cancel_update_team_name_' + team_number).hide();
            // // $('#team_name_input_' + team_number).val('');
            // // $('#confirm_update_team_name').modal('hide');
            $('#udpate_server_date_time_modal').modal('hide');
        },
        error: function (data) {
            console.log(data);
        }
    });
}