import loki from "lokijs";
import Config from "../config";

export interface IDeck {
    $loki?: number;
    guid?: string;
    name: string;
}

export interface ICard {
    $loki?: number;
    guid?: string;
    deckId: number;
    front: string;
    back?: string;
    note?: string;
    srsLevel?: number;
    nextReview?: Date;
    tag?: string[];
    vocab?: string;
    template?: string;
}

export interface IImage {
    $loki?: number;
    guid: string;
    url: string;
    h: string;
    b?: Buffer;
    md5?: string;
    note?: string;
    tags?: string[];
}

export class UserDb {
    public static async connect(filename: string = Config.USER_DB) {
        const u = new UserDb(filename);

        await new Promise((resolve, reject) => {
            u.db.loadDatabase({}, (e) => e ? reject(e) : resolve());
        });

        u.init();

        return u;
    }

    public deck?: Collection<IDeck>;
    public card?: Collection<ICard>;
    public image?: Collection<IImage>;

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
        this.deck = this.db.getCollection("deck");
        if (this.deck === null) {
            this.deck = this.db.addCollection("deck", {
                unique: ["name"]
            });
        }

        this.card = this.db.getCollection("card");
        if (this.card === null) {
            this.card = this.db.addCollection("card", {
                unique: ["front"]
            });
        }

        this.image = this.db.getCollection("image");
        if (this.image === null) {
            this.image = this.db.addCollection("image", {
                unique: ["url", "md5"]
            });
        }
    }
}

export default UserDb;
