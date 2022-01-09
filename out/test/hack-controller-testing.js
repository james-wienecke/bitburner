// this will be the main weaken/grow/hack controller
export async function main(ns) {
	const flags = ns.flags([
		['log', true],         // should default to false for production code, enables verbose logging
        ['delay', 1000],        // specifies delay for primary loop
        ['norepeat', false],    // ??? probably will not stay in to production lol
	]);

    const script = {};
    script.dir = "/test/";
    script.path = script.dir + "hack-controller-testing.js"

    for(const host of ns.scan().filter(server => !ns.getPurchasedServers().includes(server))) {
        ns.tprint(`\n` +
            `${host}\tgrow time: ${ns.getGrowTime(host).toFixed(2)}ms\n` +
            `${host}\tweak time: ${ns.getWeakenTime(host).toFixed(2)}ms\n` +
            `${host}\thack time: ${ns.getHackTime(host).toFixed(2)}ms\n\n`
            );
    }

    // let growTime = ns.getGrowTime("joesguns");
    // tprint(ns.getGrowTime("joesguns"));

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