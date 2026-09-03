"use strict";

import * as LoFu from './functions.js';

const depth_limit = 3; // define a reasonable max size
const depth_form = document.getElementById("depth_form");
let depth_select = document.querySelector('[name="field_depth"]');
let error_div = document.getElementById("error");

LoFu.generate_depth_form(depth_limit, depth_select);
LoFu.generate_mode_form(depth_limit);

depth_form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(depth_form);
    const max_depth = formData.get("field_depth");
    const mode = formData.get("mode");

    let error_message = LoFu.check_errors(max_depth, depth_limit, mode);
    if (error_message != "") {
        LoFu.error(error_div, error_message)
    }

    else {
        try {
            error_div.removeChild(error_div.firstChild);
        }
        catch {

        }
        finally {
            let board = document.getElementById("board");

            LoFu.delete_previous(board);
            LoFu.generate_board(board, 1, max_depth);
            LoFu.update_player_turn(true);

            let fieldbuttons = document.querySelectorAll(".fieldbutton");
            LoFu.generate_game_logic(fieldbuttons, mode, max_depth);
        }
    }
});

