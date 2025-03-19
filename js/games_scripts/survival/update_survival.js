jQuery(document).ready(function ($) {
    'use strict';
    toggleEnigmaType();

    // checkBalisesError();
});

function checkBalisesError() { 
    
    var on_submit_function = function(evt) {
        evt.preventDefault(); //The form wouln't be submitted Yet.


        //nombre de modèle
        // var patterns = <?php echo $available_patterns ?>;
        // var images = <?php echo $number_of_images ?>;
        // var images_divisions = <?php echo $number_of_divisions_of_images ?>;
        var array_balises = {};
        var array_error = [];
        for (var k = 1; k <= patterns; k++) {
            array_balises[k] = {};
            for (var i = 1; i <= images; i++) {
                for (var j = 1; j <= images_divisions; j++) {
                    var select_name = 'image_division_balise_image_' + i + '_position_' + j + '_pattern_' + k;
                    var balise_selected = $('select[name="' + select_name + '"]').val();
                    var key_array_balise = i + '_' + j + '_' + k;
                    array_balises[k][key_array_balise] = balise_selected;
                }
            }
        }

        $.each(array_balises, function(pattern, balises) {
            console.log(balises);
            $.each(balises, function(full_indexes, balise) {
                console.log(balise);
                if (balise != '') {
                    $.each(balises, function(full_indexes_2, balise_2) {

                        if (full_indexes_2 != full_indexes && balise_2 == balise) {
                            console.log('in 1');
                            console.log('in ' + balise + ' index ' + full_indexes);
                            var index_1_array = full_indexes.split("_");
                            var index_1_image = index_1_array[0];
                            var index_1_image_division = index_1_array[1];
                            var index_1_pattern = index_1_array[2];
                            console.log('in 2');
                            console.log('in ' + balise_2 + ' index ' + full_indexes_2);
                            var index_2_array = full_indexes_2.split("_");
                            var index_2_image = index_2_array[0];
                            var index_2_image_division = index_2_array[1];
                            var index_2_pattern = index_2_array[2];
                            var html_error = '<p>Erreur: Modèle ' + index_1_pattern + ': la balise :' + balise + ' image ' + index_1_image + ' position ' + index_1_image_division + ' identique à image  ' + index_2_image + ' position ' + index_2_image_division + ' </p>'
                            array_error.push(html_error);
                            $('.error_container').append(html_error);
                        }
                    });
                }
            });
        });

        console.log(array_error);
        if (array_error.length == 0) {

            $(this).off('submit', on_submit_function); //It will remove this handle and will submit the form again if it's all ok.
            $(this).submit();
        }
        console.log(array_balises);


    }

    $('form').on('submit', on_submit_function); //Registering on submit.
}
function toggleEnigmaType() {
    $('.enigma_type').click(function() {
        var _this = $(this),
            type = $(this).attr('data-type'),
            enigma_id = $(this).attr('data-enigma');

        if (type == 'image') {

            $('.enigma_text_' + enigma_id).hide();
            $('.enigma_image_' + enigma_id).show();
        } else if (type == 'text') {
            $('.enigma_text_' + enigma_id).css('display', 'flex');
            $('.enigma_image_' + enigma_id).hide();
        }
    });
}