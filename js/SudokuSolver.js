/*
 * SudokuSolver provides functions for solving Sudoku puzzles. The solver is also able to
 * find multiple solutions. The number of solutions that the solver looks for is defined by
 * a "solution container" which is passed into the solver and stores the found solutions once
 * complete.
 */
function SudokuSolver() {
    var self = this,
        NUMBER_MASK = [
            0, // No Values
            1, // 1
            2, // 2
            4, // 3
            8, // 4
            16, // 5
            32, // 6
            64, // 7
            128, // 8
            256 // 9
        ],
        rowContents = [],
        colContents = [],
        regContents = [],
        POSSIBLE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9],
        board,
        solutions,
        rand;

    /** --- PUBLIC FUNCTIONS --- **/

    /*
     * Solve the given board.
     *
     * @param boardGrid the 9x9 2D array of cells that may be preset with values. (MUST BE VALID).
     * @param solutionContainer the SolutionContainer that holds the required number of solutions.
     * @param random if True, the board will be randomized but valid. If false, values from 1-9
     *        will be tried iteratively.
     * @returns the solutionContainer.
     */
    self.solve = function (boardGrid, solutionContainer, random) {
        var i;

        board = boardGrid;
        rand = random;

        solutions = solutionContainer;
        solutionContainer.count = 0;

        // Reset the Candidate arrays
        for (i = 0; i < 9; i += 1) {
            rowContents[i] = NUMBER_MASK[0];
            colContents[i] = NUMBER_MASK[0];
            regContents[i] = NUMBER_MASK[0];
        }

        // Fill the content arrays with the board presets
        if (!prefillContentArrays()) {
            solutionContainer.count = 0;
        } else {
            // Start solving
            solveRecursive(0, 0, solutionContainer, random);
        }

        return solutionContainer;
    };

    /*
     * Get a Container to hold the maximum number of Solutions.
     *
     * @param maxSolutions the maximum number of solutions the container can hold.
     * @returns an object that can be used as a solutionContainer.
     */
    self.getSolutionContainer = function (maxSolutions) {
        var solutionContainer,
            i,
            j;

        solutionContainer = {
            count : 0,
            solutions : []
        };

        // Build the Solutions arrays for all maxSolutions once.
        for (i = 0; i < maxSolutions; i += 1) {
            solutionContainer.solutions[i] = [];

            for (j = 0; j < 9; j += 1) {
                solutionContainer.solutions[i][j] = [];
            }
        }

        return solutionContainer;
    };

    /** --- PRIVATE FUNCTIONS --- **/

    /*
     * Solve the Board Recursively.
     *
     * @param row the Row to put a value in.
     * @param col the Col to put a value in.
     */
    function solveRecursive(row, col) {
        var i,
            reg,
            nextRow,
            nextCol,
            values;

        values = POSSIBLE_VALUES;

        // If we want a random board, randomize the order in which we try values.
        if (rand) {
            values = POSSIBLE_VALUES.slice(0);
            randomizeList(values);
        }

        // If we reached the end of the board, we found a solution!
        if (row === 9 || col === 9) {
            // Increase the Solution Count and go back one level.
            solutions.count += 1;
            return;
        }

        // Get the Region number ( 0-9 ).
        reg = (Math.floor(row / 3) * 3) + Math.floor(col / 3);

        // Get the Next Row and Column
        nextCol = (col + 1) % 9;
        nextRow = (nextCol < col) ? row + 1 : row;

        // If the Cell is preset, just move on to the next Cell.
        if (board[row][col] !== 0) {
            solutions.solutions[solutions.count][row][col] = board[row][col];
            solveRecursive(nextRow, nextCol);
        } else {
            // Try all possible values for the square.
            for (i = 0; i < 9; i += 1) {
                // Only try a value if it's still possible.
                if ((rowContents[row] & NUMBER_MASK[values[i]]) === NUMBER_MASK[0] &&
                        (colContents[col] & NUMBER_MASK[values[i]]) === NUMBER_MASK[0] &&
                        (regContents[reg] & NUMBER_MASK[values[i]]) === NUMBER_MASK[0]) {
                    // Add the value to the temporary solution.
                    solutions.solutions[solutions.count][row][col] = values[i];

                    // Update the candidate arrays
                    rowContents[row] = rowContents[row] ^ NUMBER_MASK[values[i]];
                    colContents[col] = colContents[col] ^ NUMBER_MASK[values[i]];
                    regContents[reg] = regContents[reg] ^ NUMBER_MASK[values[i]];

                    // Try to solve the reduced board
                    solveRecursive(nextRow, nextCol);

                    // If we've found enough solutions, stop looking!
                    if (solutions.count >= solutions.solutions.length) {
                        return;
                    }

                    // Remove the Value from the Cell in the candidate arrays

                    rowContents[row] = rowContents[row] & ~NUMBER_MASK[values[i]];
                    colContents[col] = colContents[col] & ~NUMBER_MASK[values[i]];
                    regContents[reg] = regContents[reg] & ~NUMBER_MASK[values[i]];
                }
            }
        }

        // If we've tried all values and they don't work, backtrack
        return;
    }

    /*
     * Fill the content arrays with values preset by the active board.
     */
    function prefillContentArrays() {
        var row,
            col,
            reg,
            val;

        for (row = 0; row < 9; row += 1) {
            for (col = 0; col < 9; col += 1) {
                val = board[row][col];
                reg = (Math.floor(row / 3) * 3) + Math.floor(col / 3);

                if (val !== 0) {
                    if (((rowContents[row] & NUMBER_MASK[val]) === NUMBER_MASK[0] &&
                            (colContents[col] & NUMBER_MASK[val]) === NUMBER_MASK[0] &&
                            (regContents[reg] & NUMBER_MASK[val]) === NUMBER_MASK[0])) {
                        rowContents[row] = rowContents[row] ^ NUMBER_MASK[val];
                        colContents[col] = colContents[col] ^ NUMBER_MASK[val];
                        regContents[reg] = regContents[reg] ^ NUMBER_MASK[val];
                    } else {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
