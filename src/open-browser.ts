import http from "http";
import open from "opn";
import Config from "./server/config";

(async () => {
    const start = (new Date()).getSeconds();
    while ((new Date()).getSeconds() - start < 10) {
        try {
            const r = await new Promise((resolve, reject) => {
                http.get(`http://localhost:${Config.PORT}/`, (res) => resolve(res))
                .on("error", (e) => reject(e));
            }) as http.IncomingMessage;
            if (r.statusCode === 200) {
                break;
            }
        } catch (e) {}
    }
    open(`http://localhost:${Config.PORT}/`);
})();
