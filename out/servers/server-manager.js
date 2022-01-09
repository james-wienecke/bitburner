/** @param {NS} ns **/
export async function main(ns) {
	const flags = ns.flags([
		['server', 'joesguns'],
		['ram', 512],
		['script', '/work/scripts/basic-hackv3.ns'],
		['log', false]
	])

	// ram for server
	const initalRam = flags.ram;
	const scrTgt = flags.server;

	// basic-hackv3 is slightly more optimized by offloading the threshold calc to the script's executor (-0.2GB!!!!!!)
	const script = flags.script;
	const scrMoneyThresh = ns.getServerMaxMoney(scrTgt) * 0.75;
	const scrSecurThresh = ns.getServerMinSecurityLevel(scrTgt) + 5;

	ns.tprint(initalRam, scrTgt, script, flags.log);

	// custom logging
	ns.disableLog('ALL');
	if (flags.log) {
		ns.enableLog('print');
	}

	// setup for main loop
	let ram = initalRam;
	let i = 0;
	while (ram < ns.getPurchasedServerMaxRam()) {
		if (flags.log) ns.tprint(`Beginning new cycle for ${ram}GB servers...`);
		// continuously buy all available servers with our existing money
		// our purchased server hostnames are formatted like:
		// comrade-<index>_<ram>
		while (i < ns.getPurchasedServerLimit()) {
			if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
				const oldHostname = `comrade-${i}_${ram / 2}`;
				// check all existing servers and check if the old server at the current index and previous ram exists
				for (let hostname of ns.getPurchasedServers()) {
					if (oldHostname === hostname) {
						// if the targeted server exists, we will replace it
						if (flags.log) ns.print(`old hostname: ${oldHostname}\told ram: ${ns.getServerMaxRam(oldHostname)}GB`);
						ns.killall(oldHostname);
						ns.deleteServer(oldHostname);
						if (flags.log) ns.print(`${oldHostname} removed. Replacing...`);

						const hostname = ns.purchaseServer('comrade-' + i + '_' + ram, ram);
						await ns.scp(script, hostname);
						const threads = Math.floor(ns.getServerMaxRam(hostname) / ns.getScriptRam(script));
						ns.exec(script, hostname, threads, scrTgt, scrMoneyThresh, scrSecurThresh);
						if (flags.log) ns.print('Purchased server: ' + hostname);
					} else if (`comrade-${i}_${ram}` === hostname) {
						// else if this current server index is already up to the latest ram spec, we'll skip this index value
						if (flags.log) ns.print(`comrade-${i}_${ram} already exists, skipping to next index...`);
					}
				}
				i++;
			}
			await ns.sleep(2000);
		}
		if (flags.log) ns.tprint(`All servers have ${ram}GB of ram!`);
		// reset index
		i = 0;
		// set ram for next cycle
		ram = ram * 2;
	}
	ns.tprint(`\n\n\t\tCOMPLETE\n\n\t\t`);
	ns.tprint(`\n\n\t\tGLOBAL\n\n\t\t`);
	ns.tprint(`\n\n\t\tSATURATION\n\n\t\t`);
}