export function generate_depth_form(depth_limit, depth_select) {
    for (let i = 1; i <= depth_limit; i++) { // generate select values
        let option = document.createElement("option");
        option.innerHTML = `${i}`;
        option.setAttribute("value", `${i}`); 

        depth_select.append(option);
    }
}

export function generate_mode_form(depth_limit) {
    for (let i = depth_limit - 1; i >= 1; i--) {
        let option = document.createElement("option");
        option.innerHTML = `${i}`;
        option.setAttribute("value", `${i}`);

        let none_mode = document.querySelector('[value="0"]'); 

        if (i == 1) {
            option.innerHTML += " (recommended from >1 layers on)";
        }

        none_mode.after(option);
    }
}

export function check_errors(max_depth, depth_limit, mode) { 
    if (max_depth == "" || max_depth < 1 || max_depth > depth_limit) { // error messages here
        let error_message = "Invalid layer input. Resubmit with a valid amount of layers";
        return error_message;
    }
    else if ((mode == "" || mode < 0 || mode > max_depth - 1) && (mode != "r" && mode != "u" && mode != "d")) {
        let error_message = "Invalid mode input. Mode value can at most be 1 value smaller than the amount of layers.";
        return error_message;
    }
    else {
        return "";
    }
}

export function error(error_div, error_message) {
        let p = document.createElement("p");
        p.innerHTML = error_message;
        
        if (error_div.childElementCount != 0) {
            error_div.removeChild(error_div.firstChild);
        }

        error_div.append(p);
        error_div.style.visibility = "visible";

        let error_object = new Error(`${p.innerHTML}`);
        console.error(error_object);
}

export function delete_previous(board) {
    while (board.firstChild != null) {
            board.removeChild(board.firstChild);
    }
}

export function generate_board(parent, depth, max_depth) { // recursive function to generate board
    for (let i = 0; i < 9; i++) {
        let cell = document.createElement("div"); // Essentially, I didn't know how to start at all, since I needed some knowledge on HTML/CSS generation via JS, so I asked Claude to help me get started without writing code and telling too much.
        cell.className = "cell";
        cell.setAttribute("depth", `${depth}`);

        let parentfield = parent.getAttribute("position");
        if (parentfield != null) {
            cell.setAttribute("field", `${parentfield}`);
        }
        
        cell.style.setProperty("--border", `${0.25 / depth}rem solid black`); // Asked ChatGPT (because Claude was not working) how I can FIRST generate the whole border and then cut the parts so that it generates a nice tic tac toe field. The problem was that there was some kind of priority that the CSS i wrote gets overriden by JS and I didn't want to use only JS generation. So GPT recommended me to use CSS variables
        cell.setAttribute("position", `${i}`);
        cell.setAttribute("state", "none");
        cell.setAttribute("active", "true");

        parent.append(cell);

        if (depth == max_depth) {
            let fieldbutton = document.createElement("button");
            fieldbutton.className = "fieldbutton";
            fieldbutton.disabled = false;
            cell.className = "lastcell";
            cell.style.backgroundColor = "green";

            cell.append(fieldbutton);
        }
        else {
            generate_board(cell, depth + 1, max_depth);
        }
    }
}

export function generate_game_logic(buttons, mode, max_depth) {
    let X_turn = true;
    let error_div = document.getElementById("error");
    let select_depth;
    let init = true;
    
    buttons.forEach(element => {
        element.addEventListener("click", function() {
            try {
                error_div.removeChild(error_div.firstChild); // clean up last error messages
            }
            catch {
                    
            }

            let cell = element.parentElement;

            if (cell.getAttribute("active") === "true") {
                if (X_turn) {
                    element.style.backgroundImage = "url('images/X.png')"; // designed by myself on Canvas (I'm not really happy with that app since it's too simple and there are not many edit options). Like said in the CSS file, this implementation is made with the help of Github Copilot to fix the cell-modifying bug, which not even he could figure out.
                    cell.setAttribute("state", "X");
                    
                    X_turn = false;
                }
                else if (!X_turn) {
                    element.style.backgroundImage = "url('images/O.png')"; // designed by myself too. Sadly, the background isn't transparent on neither picture....
                    cell.setAttribute("state", "O");

                    X_turn = true;
                }
                
                let win = wincheck(cell, !X_turn);

                if (win) {
                    gameover(!X_turn);
                }
                else {
                    update_player_turn(X_turn);

                    select_depth = choose_select_depth(mode, select_depth, init, max_depth);
                    init = false;
                    activate_cells(max_depth, select_depth, cell);

                    element.disabled = true;
                }
            }
            else {
                let error_message = "Field is not within the playable area of the next move.";
                error(error_div, error_message);
            }
        });
    });
}

export function update_player_turn(X_turn) {
    let player_turn = document.getElementById("player_turn");
    let turn;

    X_turn ? turn = "Player turn: X" : turn = "Player turn: O";

    player_turn.innerHTML = turn;
}

function choose_select_depth(mode, select_depth, init, max_depth) {
    if (mode === "u") {
        if (max_depth > 1) {
            if (init) {
                select_depth = 1
            }
            else {
                if (select_depth === max_depth - 1) {
                    select_depth = 0
                }
                else {
                    select_depth += 1;
                }
            }
        }
        else {
            select_depth = 0;
        }
    }
    else if (mode === "d") {
        if (init) {
            select_depth = max_depth - 1;
        }
        else {
            if (select_depth === 0) {
                select_depth = max_depth - 1;
            }
            else {
                select_depth -= 1;
            }
        }
    }
    else if (mode === "r") {
        let max = max_depth;

        select_depth = parseInt(Math.floor(Math.random() * (max)));
    }   
    else {
        select_depth = parseInt(mode);
    }
    return select_depth;
}

function activate_cells(max_depth, select_depth, cell) {
    let active_cell = cell;
    let all_cells = document.querySelectorAll(".lastcell");
    let active_cell_final;

    if (select_depth === 0) {
        active_cell_final = document.querySelector("#board");
    }
    else {
        for (let i = 0; i < select_depth; i++) {
            active_cell = active_cell.parentElement; 
        }
        if (select_depth < max_depth - 1) {
            active_cell_final = document.querySelector(`[depth="${active_cell.getAttribute("depth")}"][position="${cell.getAttribute("position")}"][field="${active_cell.getAttribute("field")}"]`);
        }
        else {
            active_cell_final = document.querySelector(`[depth="${active_cell.getAttribute("depth")}"][position="${cell.getAttribute("position")}"]`);
        }

        let valid_cell = false;
        let last_cells = active_cell_final.querySelectorAll(`.lastcell`);
        last_cells.forEach(cell => {
            if (cell.getAttribute("state") === "none" && cell.firstChild.disabled === false) {
                valid_cell = true;
            }
        });

        if (!valid_cell) {
            active_cell_final = document.querySelector("#board");
        }
    }
    
    all_cells.forEach(cell => {
        if (active_cell_final.contains(cell)) {
            cell.setAttribute("active", "true");
            cell.style.backgroundColor = "green";
        }
        else {
            cell.setAttribute("active", "false");
            cell.style.backgroundColor = "transparent";
        }
    });
}

function wincheck(cell, X_turn) { // recursive wincheck function that checks wins on each layer
    let outest_layer = false;
    let parent_cell = cell.parentElement;
    if (parent_cell.getAttribute("id") === "board") {
        outest_layer = true;
    }

    let field_cells;
    if (outest_layer) {
        field_cells = document.querySelectorAll(`[depth="1"]`);
    }  
    else {
        field_cells = parent_cell.querySelectorAll(`[field="${cell.getAttribute("field")}"][depth="${cell.getAttribute("depth")}"]`);
    } 
    const win_cases = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let xo_array = new Array(9).fill("");
    let comparator = X_turn ? "X" : "O";

    let i = 0;
    field_cells.forEach(field_cell => { 
        if (field_cell.getAttribute("state") == comparator) {
            xo_array[i] = 1;
        }
        i += 1;
    })

    let win = win_cases.some(win_case => win_case.every(index => xo_array[index] == 1));
    let game_over = false;
    
    if (win) {
        if (outest_layer) {
            game_over = true;
        }
        else {
            update_cells(parent_cell, X_turn);
            game_over = wincheck(parent_cell, X_turn);
        }
    }

    return game_over;
}

function update_cells(win_cell, X_turn) {
    X_turn ? win_cell.setAttribute("state", "X") : win_cell.setAttribute("state", "O");

    let overlay = document.createElement("img");
    overlay.className = "overlay";
    X_turn ? overlay.setAttribute("src", "images/X.png") : overlay.setAttribute("src", "images/O.png");
    win_cell.append(overlay);

    let field_buttons = win_cell.querySelectorAll('.fieldbutton');
    field_buttons.forEach(button => {
        button.parentElement.style.backgroundColor = "transparent";
        if (!button.disabled) {
            button.disabled = true;
        }
    })
}

function gameover(X_turn) {
    let player_turn = document.getElementById("player_turn");
    let end_message;
    X_turn ? end_message = "X wins! " : end_message = "O wins! ";
    end_message += "Game Over! Please resubmit the form in order to start a new game."
    player_turn.innerHTML = end_message;

    let all_cells = document.querySelectorAll(".lastcell");
    all_cells.forEach(cell => {
        cell.firstChild.disabled = true;
        cell.style.backgroundColor = "transparent";
    });
} // Note for the whole Project: Additionally to all my other comments about AI usage, I used AI for debugging and finding new ideas for implementations when I was stuck, such as code reviews. For example, my wincheck approach was inspired by first asking Claude how he would do it (I didn't give him my code but asked more generally). The activate_cells function was for example also debugged with the help of Github Copilot, by telling me what was wrong. Copilot also pointed me out that handling the states via attributes of DOM elements could be risky if I would eventually implement a backend, because the user can modify the state (which I think is still fine because I never intended to implement one). More than 99% of the code in my project is written by myself with little help from AI.