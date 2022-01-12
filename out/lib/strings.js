/** @param {NS} ns **/
export async function main(ns) {

}

export const timeFormat = (ms = 0, options = { format: "HMS2MS", } ) => {
    switch (options.format) {
        case "HMS2MS":
            if (ms <= 0) return "00:00:00";
            if (!ms) return new Date().getTime();
            return new Date(ms).toISOString().substring(11, 21);
    }
}