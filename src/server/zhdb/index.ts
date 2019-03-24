import loki from "lokijs";

export class ZhDb {
    public static async connect(filename: string = "src/asset/zh.loki") {
        const zh = new ZhDb(filename);

        await new Promise((resolve, reject) => {
            zh.db.loadDatabase({}, (e) => e ? reject(e) : resolve());
        });

        zh.init();

        return zh;
    }

    public sentence?: Collection<ISentence>;
    public token?: Collection<IToken>;
    public vocab?: Collection<IVocab>;

    public db: loki;

    private constructor(filename: string) {
        this.db = new loki(filename, {
            autosave: true,
            autosaveInterval: 4000
        });
    }

    public close() {
        this.db.close();
    }

    private init() {
        this.sentence = this.db.getCollection("sentence");
        if (this.sentence === null) {
            this.sentence = this.db.addCollection("sentence", {
                unique: ["chinese"]
            });
        }

        this.token = this.db.getCollection("token");
        if (this.token === null) {
            this.token = this.db.addCollection("token", {
                unique: ["entry"]
            });
        }

        this.vocab = this.db.getCollection("vocab");
        if (this.vocab === null) {
            this.vocab = this.db.addCollection("vocab");
        }
    }
}

export interface ISentence {
    chinese: string;
    english: string;
    source?: "tatoeba" | "jukuu";
}

export interface IToken {
    entry: string;
    frequency?: number;
    sub?: string[];
    super?: string[];
    variant?: string[];
    tag?: string[];
    level?: ILevel;
}

export interface IVocab {
    simplified: string;
    traditional?: string;
    pinyin: string;
    english?: string;
}

export interface ILevel {
    hanzi?: number;
    vocab?: number;
}

export default ZhDb;
