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