/*
 * SudokuGenerator uses a SudokuSolver to create a Sudoku puzzle with a unique solution and
 * visual symmetry for improved asthetics.
 */
function SudokuGenerator() {
    var self = this;

    /** --- PUBLIC FUNCTIONS --- **/

    /*
     * Generate a new SudokuBoard.
     *
     * @param strictMinimal if True, the puzzle will always be a minimal puzzle. If False, symmetry
     *        is preferred.
     * @returns a newly created SudokuBoard.
     */
    self.generateBoard = function (strictMinimal) {
        var board,
            solver,
            solutions;

        // Create a new Board
        board = new SudokuBoard();
        board.reset();

        // Create and prepare the Solver to find 1 random solution to an empty board.
        solver = new SudokuSolver();
        solutions = solver.getSolutionContainer(1);

        // Solve the Board.
        solver.solve(board.getValueArray(), solutions, true);
        board.setValueArray(solutions.solutions[0]);

        // Remove Clues from the Board to make it a minimal puzzle with a unique solution.
        removeClues(board, solver, strictMinimal);

        return board;
    };

    /** --- PRIVATE FUNCTIONS --- **/

    /*
     * Remove Symbols from a Board
     */
    function removeClues(board, solver, strictMinimal) {
        var solutions,
            cells;

        // Get two solution containers that can hold two solutions.
        solutions = solver.getSolutionContainer(2);

        // Get a List of ALL cells.
        cells = randomizeList(getSymmetries());

        // Remove Quads First.
        cells = removeQuads(board, solver, solutions, cells);

        // Remove remaining pairs.
        cells = removePairs(board, solver, solutions, cells);

        // Remove remaining singles.
        if (strictMinimal) {
            removeSingles(board, solver, solutions, cells);
        }

        return board;
    }

    /*
     * Remove Quads while preserving the uniqueness of the puzzle.
     * If a Cell does not have 3 symmetrical cells, it's maximum will be tried.
     *
     * @param board the board being solved.
     * @param solver the solver used to solve the board.
     * @param solutions the solution container configured for 2 solutions.
     * @param cells the list of symmetrical cells to remove.
     * @returns an array containing the symmetrical cells that were not removed.
     */
    function removeQuads(board, solver, solutions, cells) {
        var vals,
            i,
            j,
            notRemoved;

        notRemoved = [];
        vals = [];

        // Iterate through all Cells removing as many quads as possible.
        for (i = 0; i < cells.length; i += 1) {
            for (j = 0; j < cells[i].length; j += 1) {
                vals[j] = board.getValue(cells[i][j].X, cells[i][j].Y);
                board.setValue(cells[i][j].X, cells[i][j].Y, board.NO_VALUE);
            }

            solver.solve(board.getValueArray(), solutions, false);

            // If there is not a unique solution, replace the values.
            if (solutions.count !== 1) {
                // Add it to the list of cells that weren't removed.
                notRemoved[notRemoved.length] = cells[i];

                for (j = 0; j < cells[i].length; j += 1) {
                    board.setValue(cells[i][j].X, cells[i][j].Y, vals[j]);
                }
            }
        }

        return notRemoved;
    }

    /*
     * Remove diagonal Pairs while preserving the uniqueness of the puzzle.
     *
     * @param board the board being solved.
     * @param solver the solver used to solve the board.
     * @param solutions the solution container configured for 2 solutions.
     * @param cells the list of symmetrical cells to remove.
     * @returns an array containing the symmetrical cells that were not removed.
     */
    function removePairs(board, solver, solutions, cells) {
        var vals,
            i,
            j,
            cellList,
            notRemoved;

        notRemoved = [];
        vals = [];

        // Iterate through all Cells removing as many quads as possible.
        for (i = 0; i < cells.length; i += 1) {
            cellList = cells[i];

            // Only attempt removal of pairs if it hasn't already been tried by the Quad remover.
            if (cellList.length === 4) {
                for (j = 0; j <= 2; j += 2) {
                    vals[0] = board.getValue(cellList[j].X, cellList[j].Y);
                    vals[1] = board.getValue(cellList[j + 1].X, cellList[j + 1].Y);

                    board.setValue(cellList[j].X, cellList[j].Y, board.NO_VALUE);
                    board.setValue(cellList[j + 1].X,
                        cellList[j + 1].Y,
                        board.NO_VALUE);

                    solver.solve(board.getValueArray(), solutions, false);

                    // If there is not a unique solution, replace the values.
                    if (solutions.count !== 1) {
                        // Add it to the list of cells that weren't removed.
                        notRemoved[notRemoved.length] = cellList[j];
                        notRemoved[notRemoved.length] = cellList[j + 1];

                        // Reset the values in the board
                        board.setValue(cellList[j].X, cellList[j].Y, vals[0]);
                        board.setValue(cellList[j + 1].X, cellList[j + 1].Y, vals[1]);
                    } else {
                        break;
                    }
                }
            } else {
                for (j = 0; j < cellList.length; j += 1) {
                    notRemoved[notRemoved.length] = cellList[j];
                }
            }
        }

        return notRemoved;
    }

    /*
     * Remove Single clues while preserving the uniqueness of the puzzle.
     *
     * @param board the board being solved.
     * @param solver the solver used to solve the board.
     * @param solutions the solution container configured for 2 solutions.
     * @param cells the list of cells to remove.
     */
    function removeSingles(board, solver, solutions, cells) {
        var val,
            i;

        // Iterate through all Cells removing as many quads as possible.
        for (i = 0; i < cells.length; i += 1) {
            val = board.getValue(cells[i].X, cells[i].Y);
            board.setValue(cells[i].X, cells[i].Y, board.NO_VALUE);

            solver.solve(board.getValueArray(), solutions, false);

            // If there is not a unique solution, replace the value.
            if (solutions.count !== 1) {
                // Reset the values in the board
                board.setValue(cells[i].X, cells[i].Y, val);
            }
        }
    }

    /*
     * Get Cells with their Symmetrical cells.
     *
     * @returns an array of arrays where each sub-array is a list of Cells that are Symmetrical.
     */
    function getSymmetries() {
        var retval,
            cells,
            i;

        retval = [];
        cells = getFirstQuarterCells();

        for (i = 0; i < cells.length; i += 1) {
            retval[i] = getSymmetricalCells(cells[i].X, cells[i].Y);
        }

        return retval;
    }

    /*
     * Get the Top Left Quarter Cells in an array.
     *
     * @returns an array containing the Cells (X, Y) in the top left quadrant.
     */
    function getFirstQuarterCells() {
        var row,
            col,
            list,
            limit;

        list = [];
        limit = Math.ceil(9 / 2);

        for (row = 0; row < limit; row += 1) {
            for (col = 0; col < limit; col += 1) {
                list[list.length] = {
                    X : col,
                    Y : row
                };
            }
        }

        return list;
    }

    /*
     * Get the cells that are symmetrical to the Cell provided.
     *
     * @param x the x coordinate of the Cell.
     * @param y the y coordinate of the Cell.
     * @return an array containing the cells that are symmetrical to the coordinates provided.
     */
    function getSymmetricalCells(x, y) {
        var cells;

        cells = [{
            X : x,
            Y : y
        }
            ];

        // If the Cell is in the middle on the X axis, add it's mirrored cell.
        if (x === 4 && y !== 4) {
            cells[cells.length] = {
                X : 4,
                Y : 8 - y
            };
        } else if (y === 4 && x !== 4) {
            cells[cells.length] = {
                X : 8 - x,
                Y : 4
            };
        } else if (x !== 4 || y !== 4) {
            // Add the Lower Right Quadrant
            cells[cells.length] = {
                X : 8 - x,
                Y : 8 - y
            };

            // Add the Lower Left Quadrant
            cells[cells.length] = {
                X : x,
                Y : 8 - y
            };

            // Add the Upper Right Quadrant
            cells[cells.length] = {
                X : 8 - x,
                Y : y
            };
        }

        return cells;
    }
}
