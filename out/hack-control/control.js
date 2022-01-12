import { Queue, breadthFirstSearch } from "/lib/net.js";
import { dukeNukem } from "/lib/hutil.js";
import { timeFormat } from "/lib/strings.js";

/** The main controller for dispatching weaken/hack/grow jobs.
 * @param {NS} ns 
 */
export async function main(ns) {
	const flags = ns.flags([
		['log', false],         // should default to false for production code, enables verbose logging
        ['reserve', 128],       // specify amount of ram to try and leave free on the home machine
        ['delay', 500],
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

    let hasHacked = false;
    let tgtServer;
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

        // if we've completed a full hacking cycle, let's check our targets again and maybe find a newer, juicier target
        if (hasHacked || tgtServer === undefined) {
            // reduce validServers to the server with the highest yield and least security
            tgtServer = validServers.reduce((best, current) => {
                // new selection algo
                let oldTotalTime = ns.getGrowTime(best) + ns.getHackTime(best) + ns.getWeakenTime(best);
                let newTotalTime = ns.getGrowTime(current) + ns.getHackTime(current) + ns.getWeakenTime(current);
                return (ns.getServerMaxMoney(current) / newTotalTime > ns.getServerMaxMoney(best) / oldTotalTime) ? current : best;
            });
            hasHacked = false;
            if (flags.log) ns.print(`New target ${tgtServer}`);
        }
        
        if (flags.log) ns.print(`target: ${tgtServer}\n` +
            `hack lvl req: ${ns.getServerRequiredHackingLevel(tgtServer)}\n` +
            `max $: $${ns.getServerMaxMoney(tgtServer).toFixed(2)}\n` +
            `$ now: $${ns.getServerMoneyAvailable(tgtServer).toFixed(2)}\n` +
            `min sec: ${ns.getServerMinSecurityLevel(tgtServer).toFixed(2)}`
        );

        for (let server of ns.getPurchasedServers()) {
            validServers.push(server);
        }

        // set loop intent
        let intent = 'weak';
        let timeout = 60000;
        if (ns.getServerSecurityLevel(tgtServer) > ns.getServerMinSecurityLevel(tgtServer) + 5) {
            intent = 'weak';
            timeout = ns.getWeakenTime(tgtServer) + 5000;
        } else if (ns.getServerMoneyAvailable(tgtServer) < ns.getServerMaxMoney(tgtServer) * 0.75) {
            intent = 'grow';
            timeout = ns.getGrowTime(tgtServer) + 5000;
        } else {
            intent = 'hack';
            timeout = ns.getHackTime(tgtServer) + 5000;
        }

        for (let host of validServers) {
            const serverMaxRam = ns.getServerMaxRam(host);
            // calc threads available to each atk script
            if (host === 'home') {
                atk[intent].t = Math.floor((serverMaxRam - flags.reserve) / ns.getScriptRam(atk[intent].p));
            } else {
                atk[intent].t = Math.floor(serverMaxRam / ns.getScriptRam(atk[intent].p));
            }

            // adjust threads per script to allow for running several scripts in parallel per server
            let numInstances = 1;
            if (atk[intent].t > 200) {
                numInstances = Math.floor(atk[intent].t / 200);
                atk[intent].t = atk[intent].t / numInstances;
            }

            // check if atk file already exists on host...
            if (!ns.fileExists(atk[intent].p, host)) {
                await ns.scp(atk[intent].p, 'home', host);
            }

            // ensure thread calc has produced a num > 0
            if (atk[intent].t > 0) {
                    // split the intent into multiple instances. by passing the index as an arg, we are able to run multiple copies of the script!
                    for (let i = 0; i < numInstances; i++) {
                        ns.exec(atk[intent].p, host, atk[intent].t, tgtServer, i);
                    }
            }
        }

        // if we hacked on this cycle, we can try picking a new target
        if (intent === 'hack') hasHacked = true;

        if (flags.log) ns.print(`waiting for ${timeFormat(timeout)}...`);
        await ns.sleep(timeout + flags.delay);
    } while (true);
}