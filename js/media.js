jQuery(document).ready(function ($) {
    'use strict';

    deleteMedia();

});

function deleteMedia() {
    $('.delete-media').click(function () {
        var _this = $(this),
            media_id = $(this).attr('data-media-id'),
            media_meta = $(this).attr('data-media-meta'),
            input_div = $('#media_' + media_id);
        // For some browsers, `attr` is undefined; for others,
        // `attr` is false.  Check for both.

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
                        };
                        $.ajaxSetup({
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            }
                        });
                        $.ajax({
                            type: 'POST',
                            url: $('#deleteMedia').val(),
                            data: data,
                            success: function (response) {
                                console.log(response);
                                if (response == 1) {
                                    $('#media_' + media_id).remove();
                                    $('#'+media_meta+'_input_container').removeClass('hide');
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
