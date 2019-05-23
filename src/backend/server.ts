import express from "express";
import bodyParser from "body-parser";
import cardRouter from "./route/card";
import quizRouter from "./route/quiz";
// import jiebaRouter from "./route/jieba";
import dictRouter from "./route/dict";
// import ioRouter from "./route/io";
import ejs from "ejs";
import path from "path";
import ZhLokiDb from "./db/zh";
import LokiDb from "./db";
import Config from "./config";
import cors from "cors";

const app = express();
const port = Config.PORT;

app.use(cors());
app.set("view engine", "ejs");
app.engine("ejs", ejs.renderFile);
app.engine("html", ejs.renderFile);
app.set("views", path.join(__dirname, "../views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../dist")));

app.use(bodyParser.json());
app.use("/card", cardRouter);
app.use("/quiz", quizRouter);
// app.use("/jieba", jiebaRouter);
app.use("/dict", dictRouter);
// app.use("/io")

app.get("/", (req, res) => {
    res.render("layout/min", {
        js: "/index.min.js"
    });
});

(async () => {
    const [zhDb, userDb] = await Promise.all([
        ZhLokiDb.connect(path.join(__dirname, "../public/zh.loki")),
        LokiDb.connect(Config.COLLECTION)
    ]);
    Config.userDb = userDb;
    Config.zhDb = zhDb;

    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
})();
