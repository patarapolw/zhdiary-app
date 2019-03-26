import express from "express";
import apiRouter from "./api";
import Config from "./config";
import ZhDb from "./zhdb";
import UserDb from "./userDb";
import nunjucks from "nunjucks";

(async () => {
    const [zhDb, userDb] = await Promise.all([
        ZhDb.connect(),
        UserDb.connect()
    ]);
    Config.zhDb = zhDb;
    Config.userDb = userDb;

    const app = express();
    nunjucks.configure("views", {
        autoescape: true,
        express: app
    });

    app.use(express.static("public"));
    app.use(express.static("dist"));

    app.use("/api", apiRouter);

    app.get("/", (req, res) => {
        res.render("layout/withNav.html", {
            title: "中文 Diary",
            js: `index.min.js`
        });
    });

    // app.get("/:p", (req, res) => {
    //     res.render("layout/withNav.html", {
    //         title: "中文 Diary",
    //         js: `${req.params.p}.min.js`
    //     });
    // });

    app.listen(Config.PORT, () => {
        console.log(`Server listening on ${Config.PORT}`);
    });
})();
