
jQuery(document).ready(function ($) {
    'use strict';

    $(".add_level").on('click', function (e) {
        e.preventDefault();
        addLevel(e.target)
        //ajax code here
    });
    $(".delete_level").on('click', function (e) {
        e.preventDefault();
        deleteLevel(e.target)
        //ajax code here
    });

    deleteMedia();
    deleteEnigmaImage();

});



function associateImageToEnigma() {
    var modal_associate_image_enigma_id = $('#modal_associate_image_enigma_id').val(),
        enigma_images_array = [];

    enigma_images = $("input[name='enigma_images[]']:checked").each(function () {
        enigma_images_array.push(this.value);
    });


    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'POST',
        url: 'associateImagesToEnigma',
        data: {
            'modal_associate_image_enigma_id': modal_associate_image_enigma_id,
            'enigma_images': enigma_images_array,
        },
        success: function (response) {
            console.log('response');
            console.log(response);
            $('#associate_image_modal').modal('hide');
            // $('#media_' + media_id).remove();
            // showBoxEnigmas($('#box_id').val());
            // showPuzzleEnigmas(puzzle_id);
            //TODO close modal image and reload modal enigma
        },
        error: function (response) {
            console.log(response);
        }
    });

}
function associateEnigmaId(enigma_id) {
    $('#modal_associate_image_enigma_id').val(enigma_id);
    var enigma_images = JSON.parse($('#enigma_' + enigma_id + '_images').val());

    $.each(enigma_images, function (index, value) {
        $('#media_' + value + ' .checkbox_image_enigma').prop('checked', true);
    });
    //TODO get associated images and check them in modal

}

function deleteEnigmaImage() {
    $('.delete_enigma_image').click(function (element) {

        var media_id = $(element.target).attr('data-media-id');

        bootbox.confirm({
            message: 'Etes-vous sûr(e) de vouloir supprimer ce media?',
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

                if (result) {

                    $.ajaxSetup({
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr(
                                'content')
                        }
                    });
                    $.ajax({
                        type: 'POST',
                        url: $('#deleteMediaUrl').val(),
                        data: {
                            'media_id': media_id,
                            'media_type': 'enigma_image_investigation',
                            'game_id': $('#game_id').val()
                        },
                        success: function (response) {
                            console.log('response');
                            console.log(response);
                            $('#media_' + media_id).remove();
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

function deleteLevel(e) {
    console.log(e);
    var level_number = $(e).attr('data-level'),
        game_id = $('#game_id').val();
    bootbox.confirm({
        message: 'Etes-vous sûr(e) de vouloir supprimer ce niveau?',
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

            if (result) {
                var data = {
                    'game_id': game_id,
                    'level_number': level_number,
                };
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });
                $.ajax({
                    type: 'POST',
                    url: $('#destroyLevelUrl').val(),
                    data: data,
                    success: function (response) {
                        if (response == 1) {
                            $('#level-container-' + level_number).remove();
                            // $(input_div).removeClass('hide');
                        }
                        console.log(response);
                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            }
        }
    });
}
function addLevel(e) {
    var number_of_levels = $('.level-container').length,
        last_level_container = $('#level-container-' + number_of_levels),
        new_level_number = number_of_levels + 1,
        $klon = last_level_container.clone().prop('id', 'level-container-' + new_level_number),
        game_type = $('#global_game_game_type').val();

    last_level_container.after($klon);

    $('#level-container-' + new_level_number + ' .level-number-number').html(new_level_number);

    $('#level-container-' + new_level_number + ' .input-points').attr("name", "level_" + new_level_number + "_points");
    $('#level-container-' + new_level_number + ' .delete_level').attr("data-level", new_level_number);
    $('#level-container-' + new_level_number + ' .delete_level i').attr("data-level", new_level_number);
    $('#level-container-' + new_level_number + ' .input-points').attr("aria-describedby", "inputGroup-level_" + new_level_number + "_points");
    $('#level-container-' + new_level_number + ' .label-points').attr("id", "inputGroup-level_" + new_level_number + "_points");
    $('#level-container-' + new_level_number + ' .input-points').val('');
    $('#level-container-' + new_level_number + ' .input-name').attr("name", "level_" + new_level_number + "_name");
    $('#level-container-' + new_level_number + ' .input-name').attr("aria-describedby", "inputGroup-level_" + new_level_number + "_name");
    $('#level-container-' + new_level_number + ' .label-name').attr("id", "inputGroup-level_" + new_level_number + "_name");
    $('#level-container-' + new_level_number + ' .input-name').val('');

    $('#level-container-' + new_level_number + ' .label-description').attr("id", "inputGroup-level_" + new_level_number + "_description");
    $('#level-container-' + new_level_number + ' .input-description').attr("name", "level_" + new_level_number + "_description");
    $('#level-container-' + new_level_number + ' .input-description').attr("aria-describedby", "inputGroup-level_" + new_level_number + "_description");
    $('#level-container-' + new_level_number + ' .input-description').val('');
    if (game_type == " investigation") {
        $('#investigation_level_image_' + number_of_levels + '_input_container').attr("data-field", 'investigation_level_image_' + new_level_number);
        $('#investigation_level_image_' + number_of_levels + '_input_container').attr("id", 'investigation_level_image_' + new_level_number + '_input_container');
        $('#preview-template_investigation_level_image_' + number_of_levels + '_hidden').attr("id", 'preview-template_investigation_level_image_' + new_level_number + '_hidden');
        $('#preview-template_investigation_level_image_' + number_of_levels).attr("id", 'preview-template_investigation_level_image_' + new_level_number);
    }

    $('html, body').stop().animate({
        scrollTop: $('#level-container-' + new_level_number).offset().top - 200
    }, 500);
}

function deleteMedia(is_enigma_modal = false) {
    $('.delete-media').click(function () {
        console.log('in delete');
        var _this = $(this),
            parent = $(this).closest('.media_update_container'),
            media_id = $(this).attr('data-media-id'),
            media_meta = $(this).attr('data-media-meta'),
            media_type = $(this).attr('data-media-type'),

            game_id = $('#global_game_game_id').val(),
            input_div = $('#media_' + media_id);
        // input_div = $('#media_' + media_id + '_input_container');

        console.log(input_div);
        bootbox.confirm({
            message: 'Etes-vous sûr(e) de vouloir supprimer ce media?',
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

                if (result) {
                    console.log(media_id);
                    var data = {
                        'media_id': media_id,
                        'game_id': game_id,
                        'media_type': media_type,
                        'media_meta': media_meta
                    };
                    $.ajaxSetup({
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        }
                    });
                    $.ajax({
                        type: 'POST',
                        url: $('#deleteMediaUrl').val(),
                        data: data,
                        success: function (response) {
                            console.log(response);
                            if (response == 1) {
                                $('#media_' + media_id).remove();
                                $(input_div).removeClass('hide');
                                $('#' + media_meta + '_input_container').removeClass('hide');


                                if (is_enigma_modal) {
                                    is_enigma_modal.hide();
                                    showBoxEnigmas($('#box_id').val());
                                }

                            }
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
