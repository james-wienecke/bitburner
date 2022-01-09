import * as math from "/lib/math";
//import { serverMaxRam } from "/lib/constants.js";

export async function main (ns) {
    ns.tprint("hello from vscode");

    const testCorrectPowOfTwo = () => {
        ns.tprint('Correcting value = 19 to closest power of 2');
        ns.tprint(math.correctPowerOfTwo(19));
        ns.tprint('Correcting value = 255 to closest power of 2');
        ns.tprint(math.correctPowerOfTwo(255));
        ns.tprint('Correcting value = 256 to closest power of 2');
        ns.tprint(math.correctPowerOfTwo(256));
        ns.tprint('Correcting value = 1,048,577 to closest power of 2');
        ns.tprint(math.correctPowerOfTwo(1048577));
        ns.tprint('Correcting value = 262,145 to closest power of 2');
        ns.tprint(math.correctPowerOfTwo(262145));
    }

    // testing power of two library functions
    testCorrectPowOfTwo();


}


