import { Queue, breadthFirstSearch } from "/lib/net";

// this will be the main weaken/grow/hack controller
export async function main(ns) {
	const flags = ns.flags([
		['log', true],         // should default to false for production code, enables verbose logging
        ['delay', 1000],        // specifies delay for primary loop
        ['norepeat', false],    // ??? probably will not stay in to production lol
	]);

    const script = {};
    script.dir = "/test/";
    script.path = script.dir + "hack-controller-testing.js";

    let servers = Array.from(breadthFirstSearch(ns, 'home'));

    servers = servers.filter(server => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel());

    const moneyOverSec = servers.reduce((best, current) => {
        return (ns.getServerMaxMoney(current) / ns.getServerMinSecurityLevel(current) > ns.getServerMaxMoney(best) / ns.getServerMinSecurityLevel(best)) ? current : best;
    });

    ns.tprint(`\n` +
        `${moneyOverSec}\thack lvl req: ${ns.getServerRequiredHackingLevel(moneyOverSec)}\n` +
        `${moneyOverSec}\tmax $: $${ns.getServerMaxMoney(moneyOverSec).toFixed(2)}\n` +
        `${moneyOverSec}\tmin sec: ${ns.getServerMinSecurityLevel(moneyOverSec).toFixed(2)}`
    );

    // atk contains the paths to the hack, grow, and weaken scripts as well as thread multipliers to control how much RAM is put into each
    const atk = {
        weak: {
            path:       script.dir + "atk/weak.js",
            tRatio:     6,
        },
        grow: {
            path:       script.dir + "atk/grow.js",
            tRatio:     22,
        },
        hack: {
            path:       script.dir + "atk/hack.js",
            tRatio:     1,
        }
    };

    
}