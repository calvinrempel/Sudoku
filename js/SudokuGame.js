/*
 * SudokuGame provides an interface for interacting with the SudokuSolver and SudokuGenerator.
 * It is heavily dependant on an accompanying HTML file.
 *
 * @param elements an associative mapping of the required elements in the HTML file. (All elements
 *        are REQUIRED) :
 *              -container
 *              -overlay
 *              -mainMenu
 *              -generateButton
 *              -solverButton
 *              -helpButton
 *              -pauseScreen
 *              -resumeButton
 *              -returnToMenu
 *              -printButton
 *              -confirmReturnButton
 *              -cancelReturnButton
 *              -puzzleParamsScreen
 *              -showIncorrectCheckbox
 *              -minPuzzleCheckbox
 *              -generatePuzzleButton
 *              -workingScreen
 *              -playScreen
 *              -timeDisplay
 *              -pauseButton
 *              -menuButton
 *              -playableSudoku
 *              -sudokuBoards
 *              -completionScreen
 *              -completionButton
 *              -completionTime
 *              -solverScreen
 *              -solveMessage
 *              -solveButton
 *              -solverMenuButton
 *              -solverSudoku
 *              -clearButton
 *              -clearScreen
 *              -clearAllButton
 *              -clearSolvedButton
 *              -helpScreen
 *              -helpMenuButton
 */
function SudokuGame(elements) {
    var board,
        boardSolution,
        showIncorrect,
        minimalPuzzle,
        generator,
        activePage,
        solver,
        solutions,
        timer,
        time;

    /** --- PRIVATE FUNCTIONS --- **/

    /*
     * Initialize the Game.
     */
    function init() {
        initScreens();
        generateSudokuHTML();
        initEventHandlers();
        solver = new SudokuSolver();
        solutions = solver.getSolutionContainer(2);
        boardSolution = new SudokuBoard();
    }

    /*
     * Make all screens except the Main Menu hidden.
     */
    function initScreens() {
        elements.overlay.style.display = 'none';
        elements.pauseScreen.style.display = 'none';
        elements.returnToMenu.style.display = 'none';
        elements.puzzleParamScreen.style.display = 'none';
        elements.workingScreen.style.display = 'none';
        elements.playScreen.style.display = 'none';
        elements.completionScreen.style.display = 'none';
        elements.solverScreen.style.display = 'none';
        elements.clearScreen.style.display = 'none';
        elements.helpScreen.style.display = 'none';

        activePage = elements.mainMenu;
    }

    /*
     * Add event handlers to all of the elements that require them.
     */
    function initEventHandlers() {
        initCheckboxEventHandler();
        initPlayableBoardCellEventHandler();
        initSolverBoardCellEventHandler();
        bindEvent(elements.generateButton, 'click', gotoPuzzleParams);
        bindEvent(elements.solverButton, 'click', gotoSolver);
        bindEvent(elements.helpButton, 'click', gotoHelp);
        bindEvent(elements.resumeButton, 'click', resumePuzzle);
        bindEvent(elements.printButton, 'click', printPuzzle);
        bindEvent(elements.confirmReturnButton, 'click', gotoMainMenu);
        bindEvent(elements.cancelReturnButton, 'click', cancelReturn);
        bindEvent(elements.showIncorrectCheckbox, 'click', updateShowIncorrect);
        bindEvent(elements.minPuzzleCheckbox, 'click', updateMinimalPuzzle);
        bindEvent(elements.generatePuzzleButton, 'click', gotoPlayableSudoku);
        bindEvent(elements.pauseButton, 'click', pausePuzzle);
        bindEvent(elements.menuButton, 'click', confirmReturnToMenu);
        bindEvent(elements.completionButton, 'click', gotoMainMenu);
        bindEvent(elements.solverMenuButton, 'click', confirmReturnToMenu);
        bindEvent(elements.solveButton, 'click', solvePuzzle);
        bindEvent(elements.clearButton, 'click', showClearMenu);
        bindEvent(elements.clearAllButton, 'click', clearAll);
        bindEvent(elements.clearSolvedButton, 'click', clearSolved);
        bindEvent(elements.cancelClearButton, 'click', cancelReturn);
        bindEvent(elements.helpMenuButton, 'click', gotoMainMenu);
    }

    /*
     * Add "change" listeners to each cell of the playable sudoku board.
     */
    function initPlayableBoardCellEventHandler() {
        var cells,
            i;

        // Get all Table data cells in the playable sudoku.
        cells = elements.playableSudoku.getElementsByTagName('td');

        for (i = 0; i < cells.length; i += 1) {
            // If the cell is not a divider, put it's corresponding value into it.
            if (cells[i].className.indexOf('horizontal-divider') === -1 &&
                    cells[i].className.indexOf('vertical-divider') === -1) {
                bindEvent(cells[i], 'change', playableCellChanged);
            }
        }
    }

    /*
     * Ass "change" listeners to each cell of the solver sudoku board.
     */
    function initSolverBoardCellEventHandler() {
        var cells,
            i;

        // Get all Table data cells in the playable sudoku.
        cells = elements.solverSudoku.getElementsByTagName('td');

        for (i = 0; i < cells.length; i += 1) {
            // If the cell is not a divider, put it's corresponding value into it.
            if (cells[i].className.indexOf('horizontal-divider') === -1 &&
                    cells[i].className.indexOf('vertical-divider') === -1) {
                bindEvent(cells[i], 'change', solverCellChanged);
            }
        }
    }

    /*
     * Add event handlers to all custom checkboxes to allow for the toggling
     * functionality.
     */
    function initCheckboxEventHandler() {
        var boxes,
            i;

        boxes = elements.container.getElementsByClassName('checkbox');

        for (i = 0; i < boxes.length; i += 1) {
            bindEvent(boxes[i], 'click', checkboxClicked);
        }
    }

    /*
     * Create a Sudoku Grid in all elements.sudokuBoards.
     */
    function generateSudokuHTML() {
        var i,
            html,
            x,
            y;

        // Generate HTML for the Sudoku Grid.
        html = '<table>';

        for (y = 0; y < 9; y += 1) {
            html += '<tr>';

            for (x = 0; x < 9; x += 1) {
                html += '<td data-x="' + x + '" data-y="' + y + '"></td>';

                // Check if a horizontal divider is needed.
                if (x === 2 || x === 5) {
                    html += '<td class="horizontal-divider"></td>';
                }
            }

            html += '</tr>';

            // Check if a horizontal divider is needed.
            if (y === 2 || y === 5) {
                html += '<tr class="vertical-divider"></tr>';
            }
        }

        html += '</table>';

        // Apply the Grid HTML to all SudokuBoard elements.
        for (i = 0; i < elements.sudokuBoards.length; i += 1) {
            elements.sudokuBoards[i].innerHTML = html;
        }
    }

    /*
     * Populate the Playable board with the values from the board.
     */
    function populatePlayableBoard() {
        var x,
            y,
            val,
            inputHTML,
            cells;

        // The HTML to use for an empty cell.
        inputHTML = '<input class="scratch" type="text" maxlength="8">' +
            '<input class="answer" type="text" maxlength="1" />';

        // Get all Table data cells in the playable sudoku.
        cells = elements.playableSudoku.getElementsByTagName('td');

        for (i = 0; i < cells.length; i += 1) {
            // If the cell is not a divider, put it's corresponding value into it.
            if (cells[i].className.indexOf('horizontal-divider') === -1 &&
                    cells[i].className.indexOf('vertical-divider') === -1) {
                x = cells[i].dataset.x;
                y = cells[i].dataset.y;

                val = board.getValue(x, y);
                val = (val === board.NO_VALUE) ? inputHTML : val;

                cells[i].innerHTML = val;
            }
        }
    }

    /*
     * Add input elements to all cells of the solver sudoku board.
     */
    function populateSolverBoard() {
        var inputHTML,
            cells;

        // The HTML to use for an empty cell.
        inputHTML = '<input class="answer" type="text" maxlength="1" />';

        // Get all Table data cells in the playable sudoku.
        cells = elements.solverSudoku.getElementsByTagName('td');

        // Put an input in each cell.
        for (i = 0; i < cells.length; i += 1) {
            // If the cell is not a divider, put it's corresponding value into it.
            if (cells[i].className.indexOf('horizontal-divider') === -1 &&
                    cells[i].className.indexOf('vertical-divider') === -1) {
                cells[i].innerHTML = inputHTML;
            }
        }
    }

    /*
     * Bind an event handler to an element on a specified event.
     *
     * @param element the element to bind the handler to.
     * @param event the event type to listen for (ie 'click')
     * @param handler the function that is called when the event is triggered.
     */
    function bindEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else {
            element.attachEvent('on' + event, handler);
        }
    }

    /*
     * Check if a custom checkbox element is checked or not.
     *
     * @param element the custom checkbox element.
     * @returns True if the custom checkbox is checked, False if it is not.
     */
    function isChecked(element) {
        var checkmark = element.getElementsByTagName('div');
        return checkmark[0].className === 'checked';
    }

    /**  --- EVENT HANDLERS  --- **/

    /*
     * Toggle the status of a custom checkbox.
     */
    function checkboxClicked(e) {
        var checkmark = e.target;

        // If the user clicked the outer div, select the inner div instead.
        if (checkmark.className.indexOf('checkbox') !== -1) {
            checkmark = checkmark.firstChild;
        }

        // The CheckBox is not currently checked (being checked).
        if (checkmark.className === 'unchecked') {
            checkmark.className = 'checked';
        } else {
            checkmark.className = 'unchecked';
        }
    }

    /*
     * Switch screens to the Puzzle Parameters Screen.
     */
    function gotoPuzzleParams() {
        switchPage(elements.puzzleParamScreen);
        return false;
    }

    /*
     * Prepare the Solver, and switch screens to it.
     */
    function gotoSolver() {
        board = new SudokuBoard();
        board.reset();
        populateSolverBoard();
        elements.solveMessage.innerHTML = 'Enter Values and Click Solve';
        switchPage(elements.solverScreen);
        return false;
    }

    /*
     * Switch screens to the Help Screen.
     */
    function gotoHelp() {
        switchPage(elements.helpScreen);
        return false;
    }

    /*
     * Remove the "Pause" overlay and restart the timer.
     */
    function resumePuzzle() {
        elements.overlay.style.display = 'none';
        elements.pauseScreen.style.display = 'none';
        startTimer();
        return false;
    }

    /*
     * Open the browsers Print dialog to print the current puzzle.
     */
    function printPuzzle() {
        window.print();
    }

    /*
     * Switch screens to the Main Menu Screen.
     */
    function gotoMainMenu() {
        elements.overlay.style.display = 'none';
        elements.returnToMenu.style.display = 'none';
        elements.completionScreen.style.display = 'none';
        switchPage(elements.mainMenu);
        return false;
    }

    /*
     * Close the opened popup and restart the timer if on the Play screen.
     */
    function cancelReturn() {
        elements.overlay.style.display = 'none';
        elements.returnToMenu.style.display = 'none';
        elements.clearScreen.style.display = 'none';

        if (activePage === elements.playScreen) {
            startTimer();
        }

        return false;
    }

    /*
     * Update the "showIncorrect" property when the checkbox is clicked.
     */
    function updateShowIncorrect() {
        showIncorrect = isChecked(elements.showIncorrectCheckbox);
    }

    /*
     * Update the "minimalPuzzle" property when the checkbox is clicked.
     */
    function updateMinimalPuzzle() {
        minimalPuzzle = isChecked(elements.minPuzzleCheckbox);
    }

    /*
     * Prepare the Play Screen and switch to it.
     */
    function gotoPlayableSudoku() {
        switchPage(elements.workingScreen);

        // Wait for a short time to let the screen switch before starting generation.
        setTimeout(function () {
            generatePuzzle(minimalPuzzle);
            populatePlayableBoard();
            clearWrongAnswers();
            switchPage(elements.playScreen);
            time = 0;
            startTimer();
        }, 100);
        return false;
    }

    /*
     * Stop the timer and open the Pause popup.
     */
    function pausePuzzle() {
        elements.overlay.style.display = 'block';
        elements.pauseScreen.style.display = 'block';
        clearInterval(timer);
        return false;
    }

    /*
     * Stop the timer and open the menu popup.
     */
    function confirmReturnToMenu() {
        elements.overlay.style.display = 'block';
        elements.returnToMenu.style.display = 'block';
        clearInterval(timer);
        return false;
    }

    /*
     * When the user enters a value in the Playable Sudoku, ensure it is a valid
     * value and check if the puzzle is now succesfully complete.
     */
    function playableCellChanged(e) {
        var data,
            val;

        // Only update when the Answer input was changed.
        if (e.target.className.indexOf('answer') !== -1) {
            // Get the Dataset of the cell so we can find it's X,Y coordinate.
            data = e.target.parentNode.dataset;
            val = board.getValue(data.x, data.y);

            // If the user entered nothing, reset the board value to nothing.
            if (e.target.value === '' || e.target.value === ' ') {
                e.target.value = '';
                e.target.parentNode.className = '';
                board.setValue(data.x, data.y, board.NO_VALUE);
            } else if (e.target.value == 0) {
                e.target.value = (val === board.NO_VALUE) ? '' : val;
            } else {
                try {
                    // Update the Board Value.
                    board.setValue(data.x, data.y, e.target.value);
                    checkCorrectness(data.x, data.y, e.target);
                } catch (msg) {
                    // If the update failed, reset board value to previous.
                    e.target.value = (val === board.NO_VALUE) ? '' : val;
                }
            }
        }

        return false;
    }

    /*
     * When the user enters a value in the Solver Sudoku board, ensure it is a valid value.
     */
    function solverCellChanged(e) {
        var data,
            val,
            changed;

        val = e.target.value;
        data = e.target.parentNode.dataset;
        changed = false;

        if (val === ' ' || val === '') {
            e.target.value = '';
            board.setValue(data.x, data.y, board.NO_VALUE);
            changed = true;
        } else if (val == 0) {
            val = board.getValue(data.x, data.y);
            e.target.value = (val === board.NO_VALUE) ? '' : val;
            changed = true;
        } else {
            try {
                board.setValue(data.x, data.y, val);
                changed = true;
            } catch (msg) {
                val = board.getValue(data.x, data.y);
                e.target.value = (val === board.NO_VALUE) ? '' : val;
            }
        }

        // Remove the "solved" class if it is attached.
        if (changed) {
            e.target.parentNode.className = '';
        }

        return false;
    }

    /*
     * Solve the puzzle that the user has entered into the Puzzle Solver.
     */
    function solvePuzzle() {
        solver.solve(board.getValueArray(), solutions, true);

        if (solutions.count === 0) {
            elements.solveMessage.innerHTML = 'The Puzzle has No Solutions';
            clearSolvedCells();
        } else if (solutions.count === 1) {
            elements.solveMessage.innerHTML = 'The Puzzle has a Unique Solution!';
            fillSolverBoard(solutions.solutions[0]);
        } else {
            elements.solveMessage.innerHTML = 'The Puzzle has Multiple Solutions';
            fillSolverBoard(solutions.solutions[0]);
        }
    }

    /*
     * Open the "Clear" Menu.
     */
    function showClearMenu() {
        elements.overlay.style.display = 'block';
        elements.clearScreen.style.display = 'block';
    }

    /*
     * Remove all numbers inserted into the Solver puzzle by the solver, and
     * update the UI to reflect the change.
     */
    function clearSolved() {
        elements.overlay.style.display = 'none';
        elements.clearScreen.style.display = 'none';
        clearSolvedCells();
        elements.solveMessage.innerHTML = 'Solved Squares Have Been Removed!';
    }

    /*
     * Remove all numbers in the Solver puzzle.
     */
    function clearAll() {
        var cells,
            i;

        elements.overlay.style.display = 'none';
        elements.clearScreen.style.display = 'none';

        cells = elements.solverSudoku.getElementsByTagName('input');

        // Fill in each cell
        for (i = 0; i < cells.length; i += 1) {
            cells[i].value = '';
            cells[i].parentNode.className = '';
        }

        board.reset();
        elements.solveMessage.innerHTML = 'Board Cleared!';
    }

    /*
     * Check if a value entered into the Playable board is correct and/or results in
     * the puzzle being successfully solved.
     */
    function checkCorrectness(x, y, cell) {
        var i;

        // Check if the Board is solved.
        if (board.equals(boardSolution)) {
            showCompletionScreen();
        } else if (showIncorrect) {
            cell = cell.parentNode;

            if (board.getValue(x, y) != boardSolution.getValue(x, y)) {
                // Add a "wrong" class to the cell.
                if (cell.className.indexOf(' wrong') == -1) {
                    cell.className += ' wrong';
                }
            } else {
                // Remove the "wrong" class from the cell.
                i = cell.className.indexOf(' wrong');

                if (i != -1) {
                    cell.className = cell.className.slice(0, i) + cell.className.slice(i + 6);
                }
            }
        }
    }

    /*
     * Remove the "incorrect" markings from cells in the Playable sudoku.
     */
    function clearWrongAnswers() {
        var cells;

        cells = elements.playableSudoku.getElementsByClassName('wrong');
        while (cells.length !== 0) {
            cells[0].className = '';
        }
    }

    /*
     * Inject solved numbers into the Solver sudoku.
     *
     * @param valueArray a 2D 9x9 array containing the values to be put in the
     *        Sudoku.
     */
    function fillSolverBoard(valueArray) {
        var cells,
            i,
            data;

        cells = elements.solverSudoku.getElementsByTagName('input');

        // Fill in each cell
        for (i = 0; i < cells.length; i += 1) {
            // If the cell is not a divider, put it's corresponding value into it.
            if ((cells[i].value == '' || cells[i].parentNode.className === 'solved') &&
                    cells[i].parentNode.className.indexOf('horizontal-divider') === -1 &&
                    cells[i].parentNode.className.indexOf('vertical-divider') === -1) {
                data = cells[i].parentNode.dataset;
                cells[i].value = valueArray[data.x][data.y];
                cells[i].parentNode.className = 'solved';
            }
        }
    }

    /*
     * Remove all numbers inserted into the Solver Sudoku by the solver.
     */
    function clearSolvedCells() {
        var cells,
            input;

        cells = elements.solverSudoku.getElementsByClassName('solved');

        // Fill in each cell
        while (cells.length !== 0) {
            input = cells[0].getElementsByTagName('input');
            input[0].value = '';
            cells[0].className = '';
        }
    }

    /*
     * Start the Play time Timer.
     */
    function startTimer() {
        var min,
            sec;

        min = Math.floor(time / 60);
        sec = time - (min * 60);
        sec = (sec < 10) ? '0' + sec : sec;

        elements.timeDisplay.innerHTML = min + ':' + sec;

        timer = setInterval(function () {
            var min,
                sec;

            time += 1;

            min = Math.floor(time / 60);
            sec = time - (min * 60);
            sec = (sec < 10) ? '0' + sec : sec;

            elements.timeDisplay.innerHTML = min + ':' + sec;
        }, 1000);
    }

    /*
     * Generate a Puzzle.
     *
     * @param strictMinimal if True, the puzzle will always be a minimal puzzle. If False, symmetry
     *        is preferred.
     */
    function generatePuzzle(strictMinimal) {
        if (!generator) {
            generator = new SudokuGenerator();
        }

        board = generator.generateBoard(strictMinimal);
        solver.solve(board.getValueArray(), solutions, false);
        boardSolution.setValueArray(solutions.solutions[0]);
    }

    /*
     * Switch Pages, causing the active Page to become hidden.
     *
     * @param newPage the page to switch to.
     */
    function switchPage(newPage) {
        activePage.style.display = 'none';
        activePage = newPage;
        activePage.style.display = 'block';
    }

    /*
     * Prepare the Puzzle completion screen and display it.
     */
    function showCompletionScreen() {
        var min,
            sec;

        min = Math.floor(time / 60);
        sec = time - (min * 60);
        clearInterval(timer);

        elements.completionTime.innerHTML = min + ' Minutes and ' + sec + ' Seconds!';

        elements.overlay.style.display = 'block';
        elements.completionScreen.style.display = 'block';
    }

    // Run the initialization method.
    init();
}
