/*
 * A SudokuBoard is a 9x9 grid of numbers. It contains methods for resetting the board as well as
 * getting and setting the values of the cells in the grid. It is also able to check if the board
 * is in a valid state. The board is said to be valid if all cells have a value that is unique in
 * both it's row and column, as well as within the 3x3 division that it is found in.
 *
 * @author Calvin Rempel
 * @date July 1, 2014
 */
function SudokuBoard() {
    var self = this,
        cells;

    self.NO_VALUE = 0;

    /** --- PUBLIC FUNCTIONS --- **/

    /*
     * Set all Cells in the SudokuBoard to an empty state.
     */
    self.reset = function () {
        var x,
            y;

        cells = [];

        for (x = 0; x < 9; x += 1) {
            cells[x] = [];

            for (y = 0; y < 9; y += 1) {
                cells[x][y] = self.NO_VALUE;
            }
        }
    };

    /*
     * Get the value at the given Cell coordinates.
     *
     * @param x the x coordinate on the board (in the range 0 to 8).
     * @param y the y coordinate on the board (in the range 0 to 8).
     * @throws error on arguments outside of the given range.
     * @returns the value of the cell at the given coordinates.
     */
    self.getValue = function (x, y) {
        // Ensure that the coordinates are within range.
        if (x < 0 || x > 8 || y < 0 || y > 8) {
            throw "Invalid Argument in SudokuBoard.getValue( " + x + ", " + y + " )";
        }

        return cells[x][y];
    };

    /*
     * Get the 2D array of cell Values.
     *
     * @returns the 9x9 2D array of cell Values.
     */
    self.getValueArray = function () {
        return cells;
    };

    /*
     * Set the value at the given Cell coordinates.
     *
     * @param x the x coordinate on the board (in the range 0 to 8).
     * @param y the y coordinate on the board (in the range 0 to 8).
     * @param value the numeric value to assign to the cell (in the range 1 to 9).
     * @throws error on arguments outside of the given range or value is non-integer.
     */
    self.setValue = function (x, y, value) {
        // Ensure that all arguments are within range.
        if (x < 0 || x > 8 || y < 0 || y > 8 || value % 1 !== 0 || value < 0 || value > 9) {
            throw "Invalid Argument in SudokuBoard.setValue( " + x + ", " + y + ", " + value + " )";
        }

        cells[x][y] = value;
    };

    /*
     * Set the values of ALL cells at once.
     *
     * @param boardGrid a 2D array containing the values for the Board.
     */
    self.setValueArray = function (boardGrid) {
        cells = boardGrid;
    };

    /*
     * Check if Two Sudoku Boards are equal.
     *
     * @param other the board to check against.
     * @returns True if they contain the same values in the same cells, false otherwise.
     */
    self.equals = function (other) {
        var x,
            y;

        // Compare all cells. If any is different, the boards are not equal.
        for (x = 0; x < 9; x += 1) {
            for (y = 0; y < 9; y += 1) {
                if (self.getValue(x, y) != other.getValue(x, y)) {
                    return false;
                }
            }
        }

        return true;
    };
}
