import { Queue, breadthFirstSearch } from "/lib/net.js";
import { dukeNukem } from "/lib/hutil.js";

/** The main controller for dispatching weaken/hack/grow jobs.
 * @param {NS} ns 
 */
export async function main(ns) {
	const flags = ns.flags([
		['log', true],         // should default to false for production code, enables verbose logging
        ['delay', 12000],        // specifies delay for primary loop
        ['norepeat', false],    // ??? probably will not stay in to production lol
	]);

    

    const script = {};
    script.dir = "/hack-control/";
    script.path = script.dir + "control.js";

    // atk contains the paths to the hack, grow, and weaken scripts as well as thread multipliers to control how much RAM is put into each
    const atk = {
        weak: {
            p:          script.dir + "atk/weak.js",
            tRatio:     6,
        },
        grow: {
            p:          script.dir + "atk/grow.js",
            tRatio:     22,
        },
        hack: {
            p:          script.dir + "atk/hack.js",
            tRatio:     1,
        }
    };

    // reserve some ram for home machine
    const homeReserved = 64;

    // get all servers in the net...
    const allServers = Array.from(breadthFirstSearch(ns, 'home'));

    // prep servers
    // filter for servers we currently have the levels to mess with
    let validServers = allServers.filter(server => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel());

    // own all ownable servers
    for (let server of validServers) {
        if (!ns.hasRootAccess(server)) {
            dukeNukem(ns, server);
            ns.print(`${server} owned`);
        }
    }

    ns.tprint(validServers);

    // do { // this will eventually run in a loop
    
    // reduce validServers to the server with the highest yield and least security
    const moneyOverSec = validServers.reduce((best, current) => {
        return (ns.getServerMaxMoney(current) / ns.getServerMinSecurityLevel(current) > ns.getServerMaxMoney(best) / ns.getServerMinSecurityLevel(best)) ? current : best;
    });
    ns.print(`\n` +
        `${moneyOverSec}\thack lvl req: ${ns.getServerRequiredHackingLevel(moneyOverSec)}\n` +
        `${moneyOverSec}\tmax $: $${ns.getServerMaxMoney(moneyOverSec).toFixed(2)}\n` +
        `${moneyOverSec}\tmin sec: ${ns.getServerMinSecurityLevel(moneyOverSec).toFixed(2)}`
    );

    

    // await scp.sleep(delay)
    // } while (norepeat) // while loop ends
}