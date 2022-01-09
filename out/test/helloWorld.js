import { isPowerOfTwo } from "/lib/math";

export async function main (ns) {
    ns.tprint("hello from vscode");

    ns.tprint(isPowerOfTwo(8));
    ns.tprint(isPowerOfTwo(25));
}