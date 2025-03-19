$(document).ready(function () {
    var on_submit_function = function (evt) {
        evt.preventDefault(); //The form wouln't be submitted Yet.

        //nombre de modèle
        var patterns_object = jQuery.parseJSON($('#patterns').val());
        var patterns = $.map(patterns_object, function (value, index) {
            return [value];
        });
        var count_patterns = $('#count_patterns').val();
        var images = $('#number_of_images').val();
        var images_divisions = $('#number_of_divisions_of_images').val();
        var array_balises = {};
        var array_error = [];
        console.log('patterns');
        console.log(patterns);
        $(patterns).each(function (index, pattern) {
            console.log(pattern);
            array_balises[pattern.name] = {};
            console.log(array_balises);
            for (var i = 1; i <= images_divisions; i++) {
                for (var j = 1; j <= images; j++) {
                    var select_name = 'image_division_balise_image_' + j + '_position_' + i + '_pattern_' + pattern.id;
                    var balise_selected = $('select[name="' + select_name + '"]').val();
                    var key_array_balise = j + '_' + i + '_' + pattern.id;
                    array_balises[pattern.name][key_array_balise] = balise_selected;
                }
            }
        });

        console.log(array_balises);
        $.each(array_balises, function (pattern, balises) {

            $.each(balises, function (full_indexes, balise) {
                console.log(pattern);
                if (balise != '') {
                    $.each(balises, function (full_indexes_2, balise_2) {

                        if (full_indexes_2 != full_indexes && balise_2 == balise) {
                            var index_1_array = full_indexes.split("_");
                            var index_1_image = index_1_array[0];
                            var index_1_image_division = index_1_array[1];
                            var index_1_pattern = index_1_array[2];
                            var index_2_array = full_indexes_2.split("_");
                            var index_2_image = index_2_array[0];
                            var index_2_image_division = index_2_array[1];
                            var index_2_pattern = index_2_array[2];
                            var html_error = '<p>Erreur: ' + pattern + ': la balise à la position image ' + index_1_image + ' position ' + index_1_image_division + ' est identique à image  ' + index_2_image + ' position ' + index_2_image_division + ' </p>'
                            array_error.push(html_error);
                            $('.error_container').append(html_error);
                        }
                    });
                }
            });
        });

        if (array_error.length == 0) {
            $(this).off('submit', on_submit_function); //It will remove this handle and will submit the form again if it's all ok.
            $(this).submit();
        }
    }
    $('form').on('submit', on_submit_function); //Registering on submit.
});