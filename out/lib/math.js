import * as constant from "/lib/constants.js";

/** @param {NS} ns **/
export async function main(ns) {


}

/** 
 * Returns true if x is a power of two.
 * @param {number} x A numeric expression.
 */
export function isPowerOfTwo(x) {
    return parseInt(Math.ceil(Math.log2(x))) === parseInt(Math.floor(Math.log2(x)));
}

/**
 * Returns the closest number that is a power of two to the passed number, bounded by the maximum
 * possible ram that a purchased server can have in `Bitburner`.
 * @param {number} x A numeric expression.
 * @returns {number} A power of two between 1 and 1,048,576 that is closest to `x`.
 */
export function correctPowerOfTwo(x) {
    if (!isPowerOfTwo(x)) {
        if (x > constant.serverMaxRam()) return constant.serverMaxRam();
        let i = 1;
        while (i < x) {
            i = i * 2;
        }
        // set initialRam to closest power of 2
        if (x - i/2 < i - x) return i/2;
        else return i;
    }

    return x;
}