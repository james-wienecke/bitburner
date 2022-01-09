import * as math from "/lib/math";
import { serverMaxRam, purchaseServerLimit } from "/lib/constants.js";

/** @param {NS} ns **/
export async function main(ns) {
	const flags = ns.flags([
		['server', 'joesguns'],
		['ram', 512],
		['script', '/work/scripts/basic-hackv3.ns'],
		['log', false]
	])

    // custom logging
    ns.disableLog('ALL');

    const cfg = {
        script: {
            path:           flags.script,
            moneyBound:     ns.getServerMaxMoney(flags.server) * 0.75,
            secBound:       ns.getServerMinSecurityLevel(flags.server) + 5,
        },
        ram:                math.correctPowerOfTwo(flags.ram),
        target:             flags.server,
        prefix:             'comrade',
    }

    if (flags.log) {
        ns.enableLog('print');
        ns.tprint(`running server-managerv1...\nbuilding ${cfg.prefix} servers series ${cfg.ram}\nscript target: ${cfg.target}`);
    }

    while (cfg.ram < serverMaxRam()) {
        if (flags.log) ns.tprint(`Beginning new cycle for ${cfg.ram}GB servers...`);
        // continuously buy all available servers with our existing money
        // our purchased server hostnames are formatted like:
        // <prefix>-<index>_<ram>
        await serverPurchaseCycle(ns, cfg, flags)

        // set ram for next cycle
        cfg.ram = cfg.ram * 2;
    }
	ns.tprint(`\n\n\t\tCOMPLETE\n\n\t\t`);
	ns.tprint(`\n\n\t\tGLOBAL\n\n\t\t`);
	ns.tprint(`\n\n\t\tSATURATION\n\n\t\t`);
}

const serverPurchaseCycle = async (ns, {script, ram, target, prefix}, flags) => {
    let i = 0;
    // cyclecount just keeps track of the number of times we've gone around without buying a server
    // it's used for very funny log message
    let cyclecount = i;
    while (i < purchaseServerLimit()) {
        const availableMoney = ns.getServerMoneyAvailable("home");
        const serverCost = ns.getPurchasedServerCost(ram);
        cyclecount = cyclecount % 25;
        if (flags.log && cyclecount === 0) ns.print(
            `me: can we stop and get ${prefix.toUpperCase()} SERVER ${serverCost.toLocaleString("en-US", { style: 'currency', currency: 'USD' })}\nmom: we have money at home!\nmoney at home: ${availableMoney.toLocaleString("en-US", { style: 'currency', currency: 'USD' })}`
            );
        if (availableMoney > serverCost) {
            // check all existing servers and check if the old server at the current index and previous ram exists
            const oldHost = `${prefix}-${i}_${ram / 2}`;
            for (let host of ns.getPurchasedServers()) {
                if (oldHost === host) {
                    // if the targeted server exists, we will replace it
                    if (flags.log) ns.print(`old host: ${oldHost}\nram: ${ns.getServerMaxRam(oldHost)}GB`);
                    ns.killall(oldHost);
                    ns.deleteServer(oldHost);
                    if (flags.log) ns.print(`${oldHost} removed. Replacing...`);

                    const hostname = ns.purchaseServer(prefix + '-' + i + '_' + ram, ram);
                    await ns.scp(script.path, hostname);
                    const threads = Math.floor(ns.getServerMaxRam(hostname) / ns.getScriptRam(script.path));
                    ns.exec(script.path, hostname, threads, target, script.moneyBound, script.secBound);
                    if (flags.log) ns.print('Purchased server: ' + hostname);
                } else if (`${prefix}-${i}_${ram}` === host) {
                    // else if this current server index is already up to the latest ram spec, we'll skip this index value
                    if (flags.log) ns.print(`${prefix}-${i}_${ram} already exists, skipping to next index...`);
                }
            }
            i++;
        }
        cyclecount++;
        await ns.sleep(2000);
    }

    if (flags.log) ns.tprint(`All servers have ${ram}GB of ram!`);
}