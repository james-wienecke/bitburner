export async function main(ns) {
    while (true) {
        ns.weaken(ns.args[0]);
    }
}