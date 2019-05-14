import sqlite3 from "better-sqlite3";
import ZhLokiDb from "../backend/db/zh";
// @ts-ignore
import pinyinConverter from "chinese-to-pinyin";

(async () => {
    const db = await ZhLokiDb.connect("public/zh.loki");

    const sql = sqlite3("zh.db");

    sql.exec(`
    CREATE TABLE sentence (
        id  INTEGER PRIMARY KEY AUTOINCREMENT,
        chinese TEXT NOT NULL UNIQUE,
        pinyin  TEXT,
        english TEXT
    );

    CREATE TABLE vocab (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        simplified  TEXT NOT NULL,
        traditional TEXT,
        pinyin      TEXT,
        english     TEXT NOT NULL,
        UNIQUE (simplified, traditional, pinyin)
    );

    CREATE TABLE token (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        entry       TEXT NOT NULL,
        sub         TEXT,
        sup         TEXT,
        var         TEXT,
        frequency   FLOAT,
        hlevel      INTEGER,
        tag         TEXT
    );
    `);

    (() => {
        const stmt = sql.prepare(`
        INSERT INTO sentence (chinese, pinyin, english)
        VALUES (?, ?, ?)`);

        sql.transaction(() => {
            db.sentence.find().map((s) => {
                stmt.run(s.chinese, pinyinConverter(s.chinese), s.english);
            });
        })();
    })();

    (() => {
        const stmt = sql.prepare(`
        INSERT INTO vocab (simplified, traditional, pinyin, english)
        VALUES (?, ?, ?, ?)`);

        sql.transaction(() => {
            db.vocab.find().map((s) => {
                stmt.run(s.simplified, s.traditional, s.pinyin, s.english);
            });
        })();
    })();

    (() => {
        const stmt = sql.prepare(`
        INSERT INTO token (sub, sup, var, frequency, hlevel, tag, entry)
        VALUES (?, ?, ?, ?, ?, ?, ?)`);

        sql.transaction(() => {
            db.token.find().map((s) => {
                stmt.run(
                    s.sub ? s.sub.join("") : null,
                    s.sup ? s.sup.join("") : null,
                    s.var ? s.var.join("") : null,
                    s.frequency,
                    s.hanziLevel && s.name.length === 1 ? s.hanziLevel[0] : null,
                    s.tag ? s.tag.join("\x1f") : null,
                    s.name
                );
            });
        })();
    })();

    sql.close();
    db.close();
})();
