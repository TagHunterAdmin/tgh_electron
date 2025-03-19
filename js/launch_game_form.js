$(function () {
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    let game_type = $('input[name="game_type"]').val();
    $('#select_user_puces').on('change', function () {
        console.log(this.value);

        if (game_type == 'tagquest') {
            var collaboration = $('input[name="game_collaboration"]:checked').val();

            if (collaboration == "team") {
                var number_of_teams = $('#team_number').val();
                var players_per_team = $('input[name="game_players_per_team"]:checked').val();
                var number_of_players = players_per_team * number_of_teams;

            } else {
                var number_of_players = $('#team_number').val();
            }
        } else if (game_type == 'survival') {
            var number_of_players = $('#team_number').val();
        } else if (game_type == 'investigation') {
            var collaboration = $('input[name="game_collaboration"]:checked').val();

            if (collaboration == "team") {
                var number_of_teams = $('#team_number').val();
                var players_per_team = $('input[name="game_players_per_team"]:checked').val();
                var number_of_players = players_per_team * number_of_teams;

            } else {
                var number_of_players = $('#team_number').val();
            }
        }


        var max_puces = $('#count_puces_' + this.value).val();
        console.log(max_puces);
        console.log(number_of_players);
        var max_puce_number = max_puces - number_of_players;
        $('#max_puce_number').html(max_puce_number);
        $('#range_key_min').attr('max', max_puce_number);
        $('#range_key_min_message').html(max_puce_number);


    });


    $('.form-validate').on('input', function () {
        if (parseInt(this.value) > parseInt(this.max)) {
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
        } else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
        }
    });
    // $('#range_key_min').on('input', function () {
    //     if (parseInt(this.value) > parseInt(this.max)) {
    //         $('#range_key_min').addClass('is-invalid');
    //         $('#range_key_min').removeClass('is-valid');
    //     } else {
    //         $('#range_key_min').addClass('is-valid');
    //         $('#range_key_min').removeClass('is-invalid');
    //     }
    // });


    let step = document.getElementsByClassName('step');
    let prevBtn = document.getElementById('prev-btn');
    let nextBtn = document.getElementById('next-btn');
    let submitBtn = document.getElementById('submit-btn');
    let form = document.getElementsByTagName('form')[0];
    let preloader = document.getElementById('preloader-wrapper');
    let bodyElement = document.querySelector('body');
    let succcessDiv = document.getElementById('success');

    $('.form-validate').on('input', function () {
        if (parseInt(this.value) > parseInt(this.max)) {
            $(this).addClass('is-invalid');
            $(this).removeClass('is-valid');
        } else {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
        }
    });

    // form.onsubmit = () => {
    //     return false
    // }


    $('#select_user_puces').on('change', function () {
        console.log(this.value);
        setPucesMax(this.value);
    });

    if (game_type == 'investigation') {
        $('input[name="version"]').on('change', function () {
            if (this.value == "without_balises") {
                $('#version_without_balise_container').removeClass('hide');
            } else {
                $('#version_without_balise_container').addClass('hide');

            }
        });
    }


    let current_step = 0;
    let stepCount = 1;
    stepCount = $('.step').length - 1;

console.log('stepCount '+stepCount);
    step[current_step].classList.add('d-block');
    if (current_step == 0) {
        prevBtn.classList.add('d-none');
        submitBtn.classList.add('d-none');
        nextBtn.classList.add('d-inline-block');
    }
    const progress = (value) => {
        document.getElementsByClassName('progress-bar')[0].style.width = `${value}%`;
    }
    nextBtn.addEventListener('click', () => {
        //check if required
        console.log(current_step);
        var go_to_next = true;
        if ($('#step_' + current_step).attr('data-required') == 'true') {
            var target_step = $('#step_' + current_step).attr('data-target-required');

            if ($('#step_' + current_step).attr('data-target-required-type') == 'radio') {
                var target_val = $('input[name="' + target_step + '"]:checked').val();
            } else {
                var target_val = $('input[name="' + target_step + '"]').val();
            }
            console.log('target_step '+target_step);
            console.log('target_val '+target_val);
            if (target_val) {
            } else {
                go_to_next = false;
            }
        } 
        // var victor = $('input[name="game_victory_type"]:checked').val();
        // console.log(victor);

        collaboration = false;
        console.log(game_type);
        console.log(current_step);
        if (game_type == 'tagquest') {
            if (current_step == 4) {
                setPucesMax();
            }
            else if (current_step == 5) {
                var collaboration = $('input[name="game_collaboration"]:checked').val();
            }
        } else if (game_type == 'survival') {
            if (current_step == 3) {
                setPucesMax();
            }  
        }

        one_pattern = false;
        // if (current_step == 6) {
        //     var one_pattern = $('input[name="one_pattern"]:checked').val();
        // }
console.log('go_to_next '+go_to_next);
        if (go_to_next) {
            current_step++;
            let previous_step = current_step - 1;
            if (game_type == 'tagquest') {
                if (current_step == 5) {
                    if ($('input[name="game_collaboration"]:checked').val() == 'solo') {
                        current_step++;
                        previous_step = current_step - 2;
                    } else {
                    }

                }
            }
            if (game_type == 'investigation') {
                console.log('current_step ' + current_step);
                if (current_step == 9) {
                    if ($('input[name="version"]:checked').val() == "without_balises") {
                        current_step = current_step + 2;
                    } else {

                    }
                }
                console.log('current_step 2' + current_step);

            }

            // console.log('one: '+ one_pattern);
            // if (($('input[name="one_pattern"]:checked').val() == 'undefined' || !$('input[name="one_pattern"]:checked').val()) && current_step == 8) {
            //     console.log('in bip');
            //     console.log(one_pattern);
            //     console.log(current_step);
            //     current_step++;
            //     previous_step = current_step - 2;
            // }
            if ((current_step > 0) && (current_step <= stepCount)) {
                prevBtn.classList.remove('d-none');
                prevBtn.classList.add('d-inline-block');
                step[current_step].classList.remove('d-none');
                step[current_step].classList.add('d-block');
                step[previous_step].classList.remove('d-block');
                step[previous_step].classList.add('d-none');
                if (current_step == stepCount) {
                    submitBtn.classList.remove('d-none');
                    submitBtn.classList.add('d-inline-block');
                    nextBtn.classList.remove('d-inline-block');
                    nextBtn.classList.add('d-none');
                }
            } else {
                if (current_step > stepCount) {
                    form.onsubmit = () => {
                        return true
                    }
                }
            }
            collaboration = false;
            progress((100 / stepCount) * current_step);
        }

    });


    prevBtn.addEventListener('click', () => {
        if (current_step > 0) {
            current_step--;
            let previous_step = current_step + 1;

            if (game_type == 'tagquest') {
                if (current_step == 5) {
                    if ($('input[name="game_collaboration"]:checked').val() == 'solo') {
                        current_step = 4;
                        previous_step = 6;
                    } else {
                    }

                }
            }

            prevBtn.classList.add('d-none');
            prevBtn.classList.add('d-inline-block');
            step[current_step].classList.remove('d-none');
            step[current_step].classList.add('d-block')
            step[previous_step].classList.remove('d-block');
            step[previous_step].classList.add('d-none');
            if (current_step < stepCount) {
                submitBtn.classList.remove('d-inline-block');
                submitBtn.classList.add('d-none');
                nextBtn.classList.remove('d-none');
                nextBtn.classList.add('d-inline-block');
                prevBtn.classList.remove('d-none');
                prevBtn.classList.add('d-inline-block');
            }
        }

        if (current_step == 0) {
            prevBtn.classList.remove('d-inline-block');
            prevBtn.classList.add('d-none');
        }
        progress((100 / stepCount) * current_step);
    });


    // submitBtn.addEventListener('click', () => {
    //     preloader.classList.add('d-block');

    //     const timer = ms => new Promise(res => setTimeout(res, ms));

    //     timer(3000)
    //         .then(() => {
    //             bodyElement.classList.add('loaded');
    //         }).then(() => {
    //             step[stepCount].classList.remove('d-block');
    //             step[stepCount].classList.add('d-none');
    //             prevBtn.classList.remove('d-inline-block');
    //             prevBtn.classList.add('d-none');
    //             submitBtn.classList.remove('d-inline-block');
    //             submitBtn.classList.add('d-none');
    //             succcessDiv.classList.remove('d-none');
    //             succcessDiv.classList.add('d-block');
    //         })

    // });
});

function setEnigmasBonus(number_of_enigmas) {

    var number_of_enigmas_bonus = Math.ceil(number_of_enigmas * 1.18) - number_of_enigmas;
    if (number_of_enigmas >= 85) {
        number_of_enigmas_bonus = 100 - number_of_enigmas;
    }
    $('#bonus_enigmas_span').html(number_of_enigmas_bonus);

}

function setEnigmas() {
    console.log('setEnigmas');
    var number_of_players = $('#team_number').val(),
        duration = $('#duration').val(),
        puzzle_duration = $('#puzzle_duration').val(),
        number_of_enigmas = Math.ceil((duration / puzzle_duration) * (number_of_players / 2)),
        number_of_enigmas_with_bonus = Math.ceil(number_of_enigmas * 1.18);
    if (number_of_enigmas_with_bonus >= 100) {
        number_of_enigmas_with_bonus = 100;
        number_of_enigmas = 85;
    }

    var number_of_enigmas_bonus = number_of_enigmas_with_bonus - number_of_enigmas;
    console.log(number_of_enigmas);
    console.log(number_of_enigmas_bonus);
    $('#bonus_enigmas_span').html(number_of_enigmas_bonus);
    $('#enigmas_number').val(number_of_enigmas);


}
function setPucesMax(user_id = false) {
    console.log('setPucesMax');
    let game_type = $('input[name="game_type"]').val();
    if (game_type == 'tagquest') {
        var collaboration = $('input[name="game_collaboration"]:checked').val();

        if (collaboration == "team") {
            var number_of_teams = $('#team_number').val();
            var players_per_team = $('input[name="game_players_per_team"]:checked').val();
            var number_of_players = players_per_team * number_of_teams;

        } else {
            var number_of_players = $('#team_number').val();
        }
    } else if (game_type == 'survival') {
        var number_of_players = $('#team_number').val();
    } else if (game_type == 'investigation') {
        var collaboration = $('input[name="game_collaboration"]:checked').val();

        if (collaboration == "team") {
            var number_of_teams = $('#team_number').val();
            var players_per_team = $('input[name="game_players_per_team"]:checked').val();
            var number_of_players = players_per_team * number_of_teams;

        } else {
            var number_of_players = $('#team_number').val();
        }
    }


    if (user_id) {
        var max_puces = $('#count_puces_' + user_id).val();
    } else {
        var max_puces = $('#count_puces').val();

    }

    console.log(max_puces);
    console.log(number_of_players);
    var max_puce_number = max_puces - number_of_players +1;
    $('#max_puce_number').html(max_puce_number);
    $('#number_of_puces').html(max_puces);
    $('#number_of_puces_to_be_used').html(number_of_players);
    $('#range_key_min').attr('max', max_puce_number);
    $('#range_key_min_message').html(max_puce_number);
}