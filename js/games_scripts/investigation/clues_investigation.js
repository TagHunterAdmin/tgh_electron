var game_url;

jQuery(document).ready(function ($) {
    game_url = $('#game_url').val();
    setCluesDimensions();

    var intervalUpdateClues = setInterval(function () {
        getClues();
    }, 5000);


});

function getClues() {

    var data = {
        'launched_game_id': $('#launched_game_id').val(),
    };
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    $.ajax({
        type: 'GET',
        url: game_url + '/getGamePuzzleArray',
        data: data,
        success: function (response) {
            console.log('Réponse getClues');
            console.log($.parseJSON(response));

            var puzzles = $.parseJSON(response);
            $.each(puzzles, function (index, puzzle) {
            console.log(puzzle);
            if(puzzle.status && $('#puzzle_'+puzzle.id).css('opacity', 0)){
                $('#puzzle_'+puzzle.id).css('opacity', 1);
            }
            $.each(puzzle.array_enigmas, function (index, enigma) {
                    if(enigma.status){
                            $('#enigma_'+enigma.enigma_id).css('opacity', 1);
                    }
                });
            });


        },
        error: function (data) {
            console.log('A lire par Coralie 2: ligne en dessous');
            console.log(data);
        }
    });

}

function setCluesDimensions() {
    var puzzles = $('.puzzle_container');

    $max_puzzle_height = 0;
    $.each(puzzles, function (index, puzzle) {
        if ($(puzzle).height() > $max_puzzle_height) {
            $max_puzzle_height = $(puzzle).height();
        }
    });

    $.each(puzzles, function (index, puzzle) {
        $(puzzle).height($max_puzzle_height);
    });
}