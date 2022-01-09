export async function main(ns) {

}

export const getConnections = (ns, {depth, root, nukeable}) => {
    if (depth === undefined) depth = 1;
    if (root === undefined) root = true;
    if (nukeable === undefined) nukeable === true;
    
    for(const host of ns.scan().filter(server => !ns.getPurchasedServers().includes(server))) {
        ns.scan()
        .filter(server => !ns.getPurchasedServers().includes(server))
        .forEach((server, index, connections) => {

        })
}