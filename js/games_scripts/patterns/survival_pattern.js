$(document).ready(function () {
    var on_submit_function = function (evt) {
        evt.preventDefault(); //The form wouln't be submitted Yet.

        if ($(evt.originalEvent.submitter).attr('id') == 'add_pattern') {
            $(this).off('submit', on_submit_function); //It will remove this handle and will submit the form again if it's all ok.
            $(this).submit();
        } else {

            var patterns_object = jQuery.parseJSON($('#patterns').val());
            var balises_object = jQuery.parseJSON($('#balises').val());
            console.log(balises_object);
            var patterns = $.map(patterns_object, function (value, index) {
                return [value];
            });
            var array_patterns = {};
            var array_error = [];

            $(patterns).each(function (index, pattern) {
                array_patterns[pattern.name] = {};

                console.log(pattern.name);
                // var enigmas = $('.pattern_table_');
                // 'pattern_' . $pattern->id . '_enigma_good_answer_' . $enigma->id;
                $(pattern.enigmas).each(function (index, enigma) {
                    var select_name_good = 'pattern_' + pattern.id + '_enigma_good_answer_' + enigma.enigma_id + '[]';
                    var select_name_wrong = 'pattern_' + pattern.id + '_enigma_wrong_answer_' + enigma.enigma_id + '[]';
                    var balise_selected_good = $('select[name="' + select_name_good + '"]').val();
                    var balise_selected_wrong = $('select[name="' + select_name_wrong + '"]').val();
                    console.log(balise_selected_good);
                    if (balise_selected_good && balise_selected_good.length) {
                        $(balise_selected_good).each(function (index, balise) {

                            var key_balise = 'good_' + enigma.enigma_id;
                            if (array_patterns[pattern.name][balise] && array_patterns[pattern.name][balise].length) {
                                array_patterns[pattern.name][balise].push(key_balise);
                            } else {
                                array_patterns[pattern.name][balise] = [key_balise];
                            }
                        })

                    }
                    if (balise_selected_wrong && balise_selected_wrong.length) {
                        $(balise_selected_wrong).each(function (index, balise) {
                            var key_balise = 'wrong_' + enigma.enigma_id;
                            if (array_patterns[pattern.name][balise] && array_patterns[pattern.name][balise].length) {
                                array_patterns[pattern.name][balise].push(key_balise);
                            } else {
                                array_patterns[pattern.name][balise] = [key_balise];
                            }
                        })

                    }

                });
            });

            console.log(array_patterns);

            $.each(array_patterns, function (pattern_name, pattern) {

                $.each(pattern, function (balise_id, balises) {

                    if (balises.length > 1) {
                        console.log(balises);
                        var balise_name = '';
                        $(balises_object).each(function (index, balise_object) {
                     
                            if (balise_object.id == +balise_id) {
                                balise_name = balise_object.key_name;
                                return false;
                            }
                        })
                        var html_error = '<p>Erreur: ' + pattern_name + ': balise ' + balise_name +' ';

                        var count_each = 0;
                        $(balises).each(function (index, input) {
                            var input_array = input.split("_");
                            var good_wrong_text = 'mauvaise';

                            //get balise name
                       
                            console.log(balise_name)
                            if (input_array[0] == "good") {
                                good_wrong_text = 'bonne';
                            }
                            html_error +='enigme ' + input_array[1] + ' ' + good_wrong_text + ' réponse';
                            count_each++;
                            if (count_each < balises.length) {
                                html_error += ' est identique à ';
                            }
                        })
                        // + ': la balise à la position image ' + index_1_image + ' position ' + index_1_image_division + ' est identique à image  ' + index_2_image + ' position ' + index_2_image_division + ' </p>'
                        array_error.push(html_error);
                        $('#pattern_error_container').append(html_error);
                    }

                    // if (balise != '') {
                    //     $.each(balises, function (full_indexes_2, balise_2) {

                    //         if (full_indexes_2 != full_indexes && balise_2 == balise) {
                    //             var index_1_array = full_indexes.split("_");
                    //             var index_1_image = index_1_array[0];
                    //             var index_1_image_division = index_1_array[1];
                    //             var index_1_pattern = index_1_array[2];
                    //             var index_2_array = full_indexes_2.split("_");
                    //             var index_2_image = index_2_array[0];
                    //             var index_2_image_division = index_2_array[1];
                    //             var index_2_pattern = index_2_array[2];
                    //             var html_error = '<p>Erreur: ' + pattern + ': la balise à la position image ' + index_1_image + ' position ' + index_1_image_division + ' est identique à image  ' + index_2_image + ' position ' + index_2_image_division + ' </p>'
                    //             array_error.push(html_error);
                    //             $('.error_container').append(html_error);
                    //         }
                    //     });
                    // }
                });
            });

            if (array_error.length == 0) {
                $(this).off('submit', on_submit_function); //It will remove this handle and will submit the form again if it's all ok.
                $(this).submit();
            }

        }
    }
    $('form').on('submit', on_submit_function); //Registering on submit.


    $('.remove_enigma').click(function (e) {

        console.log('in');
        var enigma_id = $(e.target).attr('data-enigma');
        var pattern_id = $(e.target).attr('data-pattern');
        console.log(enigma_id);
        bootbox.confirm({
            message: 'Etes-vous sûr(e) de vouloir supprimer cette énigme?',
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
                        'pattern_id': pattern_id,
                        'enigma_id': enigma_id
                    };
                    $.ajaxSetup({
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        }
                    });
                    $.ajax({
                        type: 'POST',
                        url: $('#deleteEnigmaUrl').val(),
                        data: data,
                        success: function (response) {
                            console.log(response);
                            if (response == 1) {
                                $('#pattern_' + pattern_id + '_enigma_' + enigma_id).remove();
                            }
                        },
                        error: function (response) {
                            console.log(response);
                        }
                    });
                }
            }
        });

    });
});