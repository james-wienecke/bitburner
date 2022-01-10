export async function main(ns) {

}
export class Queue {
    constructor() {
        this.elems = [];
    }
}
Queue.prototype.enQueue = function(elem) {
    this.elems.push(elem);
}
Queue.prototype.deQueue = function() {
    return this.elems.shift();
}
Queue.prototype.isEmpty = function() {
    return this.elems.length === 0;
}
Queue.prototype.peek = function() {
    return !this.isEmpty() ? this.elems[0] : undefined;
}

export const breadthFirstSearch = (ns, server) => {
    const q = new Queue();
    const explored = new Set();
    q.enQueue(server);
    explored.add(server);

    while (!q.isEmpty()) {
        const node = q.deQueue();
        ns.scan(node)
            .filter(s => !explored.has(s))
            .forEach(s => {
                explored.add(s);
                q.enQueue(s);
            });

    }

    return explored;
}