export async function main(ns) {
    while (true) {
        ns.grow(ns.args[0]);
    }
}