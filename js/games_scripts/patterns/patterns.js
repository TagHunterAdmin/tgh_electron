
$(document).ready(function() {
$('.delete-pattern').click(function() {
    var _this = $(this),
        pattern_id = $(this).attr('data-pattern-id');

    bootbox.confirm({
        message: 'Etes-vous sûr(e) de vouloir supprimer ce modèle?',
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
        callback: function(result) {

            if (result) {
                console.log(pattern_id);
                var data = {
                    'pattern_id': pattern_id
                };

                console.log($('#deletePatternUrl').val());
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });
                $.ajax({
                    type: 'POST',
                    url: $('#deletePatternUrl').val(),
                    data: data,
                    success: function(response) {
                        console.log('pattern id : ' + pattern_id);

                        if (response == 1) {
                            $('#pattern_' + pattern_id).remove();
                        }
                        console.log(response);
                    },
                    error: function(response) {
                        console.log(response);
                    }
                });
            }
        }
    });
})
$('.export-pattern').click(function() {
    var _this = $(this),
        pattern_id = $(this).attr('data-pattern-id');

    bootbox.confirm({
        message: 'Etes-vous sûr(e) de vouloir exporter ce modèle?',
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
        callback: function(result) {

            if (result) {
                console.log(pattern_id);
                var data = {
                    'pattern_id': pattern_id
                };
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });
                $.ajax({
                    type: 'POST',
                    url: $('#exportPatternUrl').val(),
                    data: data,
                    success: function(response) {
console.log(response);
                        bootbox.confirm({
                            message: 'Voulez-vous être redirigé vers la page exports?',
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
                            callback: function(result) {

                                if (result) {
                                    window.location.replace($('#exportsPageUrl').val());
                                }
                            }
                        })
                    },
                    error: function(response) {
                        console.log(response);
                    }
                });
            }
        }
    });
})

});