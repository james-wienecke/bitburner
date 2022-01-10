/** @param {NS} ns **/
export async function main(ns) {
    // this is a function library for common utils needed for bitburner scripts
}

export function dukeNukem(ns, target) {
    let reqPorts = ns.getServerNumPortsRequired(target);

    if (ns.fileExists('BruteSSH.exe')) {
        ns.brutessh(target);
        reqPorts--;
    }
    if (ns.fileExists('FTPCrack.exe')) {
        ns.fptcrack(target);
        reqPorts--;
    }
    if (ns.fileExists('relaySMTP.exe')) {
        ns.relaysmtp(target);
        reqPorts--;
    }
    if (ns.fileExists('HTTPWorm.exe')) {
        ns.httpworm(target);
        reqPorts--;
    }
    if (ns.fileExists('SQLInject.exe')) {
        ns.sqlinject(target);
        reqPorts--;
    }

    if (reqPorts < 1) {
        ns.nuke(target);
        return true;
    } else {
        return false;
    }
}