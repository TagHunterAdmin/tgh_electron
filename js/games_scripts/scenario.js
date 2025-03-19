jQuery(document).ready(function ($) {
    $('#print_url').on('click', function () {

        let CSRF_TOKEN = $('meta[name="csrf-token"').attr('content');
        $('#print_url i').removeClass('fa-print');
        $('#print_url i').addClass('fa-spinner fa-spin');
        $.ajaxSetup({
            url: $('#print_url').attr('data-print-url'),
            type: 'GET',
            data: {
                _token: CSRF_TOKEN,
            },
            beforeSend: function () {
                console.log('printing ...');
            },
            complete: function (response) {
                console.log(response);
            }
        });

        $.ajax({
            success: function (viewContent) {
                console.log(viewContent);
                $('#print_url i').addClass('fa-print');
                $('#print_url i').removeClass('fa-spinner fa-spin');
                $.print(viewContent, {
                    globalStyles: true,
                });
            }
        });
    });

    var pattern_id = $('#patterns_select').val();
    if (pattern_id) {
        if (pattern_id !== null && pattern_id !== 'null') {
            getPatternBalises('indfs');
            console.log($('#patterns_select').val());
        }
        console.log($('#patterns_select').val());

        // console.log('balise');
        // console.log(pattern_balises);
        // displayBalisesFromPattern(pattern_id, pattern_balises)
    }

    $('#patterns_select').on('select2:select', function (e) {
        var data = e.params.data;
        var pattern_id = data.id;
        getPatternBalises(pattern_id)
    });
});

function displayBalisesFromPattern(pattern_id, data) {
    if (pattern_id !== "null") {

        $('#print_url').removeClass('disabled');
        $('#print_url').attr('data-print-url', $('#pattern_' + pattern_id + '_print_url').val());

        if (data.pattern.game_type == 'tagquest') {
            console.log('in tagquest');
            $(data.images).each(function (index, image) {
                $('#image_' + image['image'] + '_division_' + image['position'] + ' .key_name').html(image['balise']['key_name'] );
                $('#image_' + image['image'] + '_division_' + image['position']).removeClass('hide');
            })
        } else if (data.pattern.game_type == 'survival') {
            console.log('in');
            $(data.enigmas).each(function (index, enigma) {
                var good_answer_text = ', balises: ';
                var wrong_answer_text = ', balises: ';
                $(enigma.good_answers_balises).each(function (index, balise) {
                    good_answer_text =  good_answer_text + ' ' + balise.key_name;
                });
                $(enigma.wrong_answers_balises).each(function (index, balise) {
                    wrong_answer_text =  wrong_answer_text + ' ' + balise.key_name;
                });
                console.log(wrong_answer_text);
                console.log('after');
                $('#enigma_' + enigma['enigma_id'] + ' .points_balises_container .good_answer .key_name').html(good_answer_text);
                $('#enigma_' + enigma['enigma_id'] + ' .points_balises_container .wrong_answer .key_name').html(wrong_answer_text);
            })
        }

    } else {
        $('#print_url').addClass('hide');
        $('.division_overlay').each(function (index, element) {
            $(element).addClass('hide');
        })
    }
}
function getPatternBalises(pattern_id) {
    var data = {
        'pattern_id': pattern_id,
    };
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: $('#getPatternBalisesUrl').val(),
        data: data,
        success: function (response) {
            console.log(response);
            displayBalisesFromPattern(pattern_id, response)
        },
        error: function (response) {
            console.log(response);
        }
    });
}