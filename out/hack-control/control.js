import { Queue, breadthFirstSearch } from "/lib/net.js";
import { dukeNukem } from "/lib/hutil.js";

/** The main controller for dispatching weaken/hack/grow jobs.
 * @param {NS} ns 
 */
export async function main(ns) {
	const flags = ns.flags([
		['log', false],         // should default to false for production code, enables verbose logging
        ['reserve', 128],       // specify amount of ram to try and leave free on the home machine
        ['shy', false]           // shy mode will only target home and purchased servers
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

    if (flags.log) {
        ns.enableLog('print');
        ns.tprint(
            `log enabled\n` +
            `script: ${script.path}\n` +
            `${flags.reserve}GB mem reserved on 'home'`
            );
    }


    do {
        // get all servers in the net...
        const allServers = Array.from(breadthFirstSearch(ns, 'home'));

        // prep servers
        // filter for servers we currently have the levels to mess with
        let validServers = allServers.filter(server => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel());

        // own all ownable servers
        for (let server of validServers) {
            if (!ns.hasRootAccess(server)) {
                const success = dukeNukem(ns, server);
                if (flags.log && success) ns.print(`${server} owned`);
            }
        }

        // clean validServers of servers we can't nab this time around
        validServers = validServers.filter(server => ns.hasRootAccess(server));

        // reduce validServers to the server with the highest yield and least security
        let moneyOverSec = validServers.reduce((best, current) => {
            return (ns.getServerMaxMoney(current) / ns.getServerMinSecurityLevel(current) > ns.getServerMaxMoney(best) / ns.getServerMinSecurityLevel(best)) ? current : best;
        });
        
        if (flags.log) ns.print(`target: ${moneyOverSec}\n` +
            `hack lvl req: ${ns.getServerRequiredHackingLevel(moneyOverSec)}\n` +
            `max $: $${ns.getServerMaxMoney(moneyOverSec).toFixed(2)}\n` +
            `min sec: ${ns.getServerMinSecurityLevel(moneyOverSec).toFixed(2)}`
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

        if (flags.shy) {
            for(let host of ns.getPurchasedServers()) {
                if (flags.log)  {
                    ns.print('SHY MODE ON');
                    ns.print('max ram on host ' + host + ' is ' + ns.getServerMaxRam(host) + 'GB');
                }
                // calc threads available to each atk script
                if (host === 'home') {
                    atk[intent].t = Math.floor((ns.getServerMaxRam(host) - flags.reserve) / ns.getScriptRam(atk[intent].p));
                } else {
                    atk[intent].t = Math.floor(ns.getServerMaxRam(host) / ns.getScriptRam(atk[intent].p));
                }
                // check if atk file already exists on host...
                if (!ns.fileExists(atk[intent].p, host)) {
                    await ns.scp(atk[intent].p, 'home', host);
                }

                // ensure thread calc has produced a num > 0
                if (atk[intent].t > 0) {
                    ns.print('running ' + intent + ' with ' + atk[intent].t + ' threads (' + ns.getScriptRam(atk[intent].p) * atk[intent].t + 'GB)');
                    ns.exec(atk[intent].p, host, atk[intent].t, moneyOverSec);
                }
            }
        } else {
            for (let host of validServers) {
                if (flags.log) ns.print('max ram on host ' + host + ' is ' + ns.getServerMaxRam(host) + 'GB');
                // calc threads available to each atk script
                if (host === 'home') {
                    atk[intent].t = Math.floor((ns.getServerMaxRam(host) - flags.reserve) / ns.getScriptRam(atk[intent].p));
                } else {
                    atk[intent].t = Math.floor(ns.getServerMaxRam(host) / ns.getScriptRam(atk[intent].p));
                }
                // check if atk file already exists on host...
                if (!ns.fileExists(atk[intent].p, host)) {
                    await ns.scp(atk[intent].p, 'home', host);
                }

                // ensure thread calc has produced a num > 0
                if (atk[intent].t > 0) {
                        ns.print('running ' + intent + ' with ' + atk[intent].t + ' threads (' + ns.getScriptRam(atk[intent].p) * atk[intent].t + 'GB)');
                        ns.exec(atk[intent].p, host, atk[intent].t, moneyOverSec);
                }
            }

        }
        ns.print(`waiting ${timeout.toFixed(4)} ms (${(timeout / 1000).toFixed(4)}s)`);
        await ns.sleep(timeout);
    } while (true);
}