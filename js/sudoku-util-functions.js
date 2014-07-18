/*
 * Performs an in place shuffle of the supplied array.
 *
 * @param list the array of values to randomize.
 * @returns the randomized list.
 */
function randomizeList(list) {
    var elementsRemaining,
        i,
        temp;

    // Move a random element to the back of the list and hide it. Repeat for each element.
    elementsRemaining = list.length;
    while (elementsRemaining > 0) {
        i = Math.floor(Math.random() * elementsRemaining);
        temp = list[elementsRemaining - 1];
        list[elementsRemaining - 1] = list[i];
        list[i] = temp;

        elementsRemaining -= 1;
    }

    return list;
};
