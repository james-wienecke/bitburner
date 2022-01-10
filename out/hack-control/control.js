import { Queue, breadthFirstSearch } from "/lib/net.js";
import { dukeNukem } from "/lib/hutil.js";

/** The main controller for dispatching weaken/hack/grow jobs.
 * @param {NS} ns 
 */
export async function main(ns) {
	const flags = ns.flags([
		['log', false],         // should default to false for production code, enables verbose logging
        ['reserve', 256]
	]);

    // custom logging
    ns.disableLog('ALL');

    const script = {};
    script.dir = "/hack-control/";
    script.path = script.dir + "control.js";

    // atk contains the paths to the hack, grow, and weaken scripts as well as thread multipliers to control how much RAM is put into each
    const atk = {
        weak: {
            p:          script.dir + "atk/weak.js",
            tRatio:     8,
        },
        grow: {
            p:          script.dir + "atk/grow.js",
            tRatio:     1,
        },
        hack: {
            p:          script.dir + "atk/hack.js",
            tRatio:     22,
        }
    };

    // reserve some ram for home machine
    const homeReserved = flags.reserve;

    // get all servers in the net...
    const allServers = Array.from(breadthFirstSearch(ns, 'home'));

    // prep servers
    // filter for servers we currently have the levels to mess with
    let validServers = allServers.filter(server => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel());

    // own all ownable servers
    for (let server of validServers) {
        if (!ns.hasRootAccess(server)) {
            dukeNukem(ns, server);
            if (flags.log) ns.print(`${server} owned`);
        }
    }

    do {
        // reduce validServers to the server with the highest yield and least security
        let moneyOverSec = validServers.reduce((best, current) => {
            return (ns.getServerMaxMoney(current) / ns.getServerMinSecurityLevel(current) > ns.getServerMaxMoney(best) / ns.getServerMinSecurityLevel(best)) ? current : best;
        });
        
        if (flags.log) ns.print(`\n` +
            `${moneyOverSec}\thack lvl req: ${ns.getServerRequiredHackingLevel(moneyOverSec)}\n` +
            `${moneyOverSec}\tmax $: $${ns.getServerMaxMoney(moneyOverSec).toFixed(2)}\n` +
            `${moneyOverSec}\tmin sec: ${ns.getServerMinSecurityLevel(moneyOverSec).toFixed(2)}`
        );

        // set loop intent
        let intent = 'weak';
        let timeout = 60000;
        if (ns.getServerSecurityLevel(moneyOverSec) > ns.getServerMinSecurityLevel(moneyOverSec) + 5) {
            intent = 'weak';
            timeout = ns.getWeakenTime(moneyOverSec) + 5000;
        } else if (ns.getServerMoneyAvailable(moneyOverSec) < ns.getServerMaxMoney(moneyOverSec) * 0.75) {
            intent = 'grow';
            timeout = ns.getGrowTime(moneyOverSec) + 5000;
        } else {
            intent = 'hack';
            timeout = ns.getHackTime(moneyOverSec) + 5000;
        }

        // temp - will be replaced with all valid servers when loop is added
        for (let host of validServers) {
            if (flags.log) ns.print('max ram on host ' + host + ' is ' + ns.getServerMaxRam(host) + 'GB');

            // calc threads available to each atk script
            if (host === 'home') {

                atk[intent].t = Math.floor((ns.getServerMaxRam(host) - homeReserved) / ns.getScriptRam(atk[intent].p));
            } else {
                atk[intent].t = Math.floor(ns.getServerMaxRam(host) / ns.getScriptRam(atk[intent].p));
            }
            
            // check if atk file already exists on host...
            if (!ns.fileExists(atk[intent].p, host)) {
                await ns.scp(atk[intent].p, home, host);
            }


            ns.print('running ' + intent + ' with ' + atk[intent].t + ' threads (' + ns.getScriptRam(atk[intent].p) * atk[intent].t + 'GB)');
            ns.exec(atk[intent].p, host, atk[intent].t, moneyOverSec);
        }

        ns.print('waiting ' + timeout + 'ms (' + timeout / 1000 + 's)');
        await ns.sleep(timeout);
    } while (true);
}