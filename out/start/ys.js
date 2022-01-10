/** @param {NS} ns **/
export async function main(ns) {
	// setup victim for target machines to hack with provided script
	const script = "/work/scripts/basic-hackv3.ns";
	const victim = "joesguns";
	const scrMoneyThresh = ns.getServerMaxMoney(victim) * 0.75;
	const scrSecurThresh = ns.getServerMinSecurityLevel(target) + 5;

	// own victim
	if (!ns.hasRootAccess(victim)) {
		ns.nuke(victim);
	}

	// build local connections 1 step away from home
	let localNeighbors = ns.scan("home").filter(neighbor => {
		// filter out our purchased servers
		return ns.getPurchasedServers().includes(neighbor) === false;
	});
	//ns.tprint('neighbors depth 1: ' + localNeighbors);

	// build connections 2 steps away from home
	let neighbors = [];
	localNeighbors.forEach(neighbor => {
		const newNodes = ns.scan(neighbor).filter(node => node !== 'home');
		if (newNodes.length > 0) neighbors.push(newNodes);
	});
	//ns.tprint('neighbors depth 2: ' + neighbors);

	neighbors = [...localNeighbors, ...neighbors];
	//ns.tprint('all neighbors: ' + neighbors);

	// filter out all servers that require port opening
	let loTargets = neighbors.filter(hostname => {
		if (ns.getServerNumPortsRequired(hostname) === 0) return hostname;
	});
	ns.tprint('lowsec targets: ' + loTargets);

	for (let target of loTargets) {
		if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
			continue;
		}
		// copy over our hack script
		await ns.scp(script, target);
		// own the server
		ns.nuke(target);
		// eval max usable threads on target to run script with
		const threads = Math.floor(ns.getServerMaxRam(target) / ns.getScriptRam(script));

		ns.exec(script, target, threads, victim, scrMoneyThresh, scrSecurThresh);
		ns.tprint(`owned ${target}. ${victim} is bitchmade.`);
	}
}