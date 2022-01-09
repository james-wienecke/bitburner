import * as constant from "/lib/constants.js";

/** @param {NS} ns **/
export async function main(ns) {


}

/** 
 * Returns true if num is a power of two
 * @param {number} num 
 * @returns {boolean} 
 */
export function isPowerOfTwo(num) {
    return parseInt(Math.ceil(Math.log2(num))) === parseInt(Math.floor(Math.log2(num)));
}

export function correctPowerOfTwo(value) {
    // if passed ram arg is not a power of two
    if (!isPowerOfTwo(value)) {                             // ex. initialRam = 15
        let i = 2;
        // loop until i is a power of two > ram arg
        while (i < constant.serverMaxRam() && i < value) {
            i = i * 2;                                      // 2 -> 4   (4 < 15)    ...
                                                            // 4 -> 8   (8 < 15)    ...
                                                            // 8 -> 16  (16 > 15)   !!!
        }
        // we get the power of two higher than ram arg
        let high = i;                                       // high = 16
        // and lower than ram arg
        let low = i / 2;                                    // low = 8
        // calculate differences between closest powers of two
        let highDiff = high - value;                        // highDiff = 16 - 15 = 1
        let lowDiff = value - low;                          // lowDiff  =  15 - 8 = 7

        // set initialRam to closest power of 2
        if (lowDiff < highDiff) {                           // !(lowDiff = 7 < highDiff = 1)
            value = low;                                        // DNE
        } else if (highDiff < lowDiff) {                    // highDiff = 1 < lowDiff = 7
            value = high;                                       // initialRam = high;
        }
    }

    return value;
}