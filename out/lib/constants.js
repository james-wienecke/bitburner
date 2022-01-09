/** @param {NS} ns **/
export async function main(ns) {
    // this is a library for various bitburner game values that would consume (pretend game) RAM if called with netscript functions
}

/**
 * Returns the maximum ram allowed for a purchased server.
 */
export function serverMaxRam() {
    return 1048576;
}

/**
 * Returns the maximum number of purchased servers the player can have.
 */
export function purchaseServerLimit() {
    return 25;
}