/** @param {NS} ns **/
export async function main(ns) {
    // this is a function library for common utils needed for bitburner scripts
}

/** Attempts to crack and nuke the hostname it is given
 *  @param {NS} ns 
 *  @param {string} target A valid Bitburner server hostname.
 */
export function dukeNukem(ns, target) {
    let reqPorts = ns.getServerNumPortsRequired(target);

    if (ns.fileExists('BruteSSH.exe')) {
        ns.brutessh(target);
        reqPorts--;
    }
    if (ns.fileExists('FTPCrack.exe')) {
        ns.ftpcrack(target);
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