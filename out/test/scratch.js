import * as math from "/lib/math";
import { Queue, breadthFirstSearch } from "/lib/net";
//import { serverMaxRam } from "/lib/constants.js";

export async function main (ns) {
    ns.tprint("hello from vscode");


    testPassNSEnv(ns, 'testing...');

    const servers = breadthFirstSearch(ns, 'home');

    for (let server of servers) {
        ns.tprint(server);
    }
    ns.tprint('we did it, girls and gays');
}

const testPassNSEnv = (ns, str) => {
    ns.tprint(str);
}