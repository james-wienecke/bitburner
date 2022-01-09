// this will be the main weaken/grow/hack controller
export async function main(ns) {
	const flags = ns.flags([
		['log', true],         // should default to false for production code, enables verbose logging
        ['delay', 1000],        // specifies delay for primary loop
        ['norepeat', false],    // ??? probably will not stay in to production lol
	]);

    const script = {}
    script.dir = "/test/";
    script.path = script.dir + "hack-controller-testing.js"

    const atk = {
        weak:   script.dir + "atk/weaken.js",
        grow:   script.dir + "atk/grow.js",
        hack:   script.dir + "atk/hack.js",
    }


}