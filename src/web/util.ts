import showdown from "showdown";
import mustache from "mustache";
import XRegExp from "xregexp";

export function shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export class Md2Html {
    public template: any = {};

    private mdConverter = new showdown.Converter({
        tables: true
    });

    constructor() {
        this.mdConverter.setFlavor("github");
    }

    public convert(s: string, v?: string): string {
        if (!s) {
            return "";
        }

        console.log(this);
        console.log(this.template);

        s = mustache.render(s, v ? this.template[v] || {} : {});

        return this.mdConverter.makeHtml(s);
    }

    public async addTemplate(v: string): Promise<any> {
        if (!XRegExp("\\p{Han}").test(v) || this.template[v]) {
            return;
        }

        console.log(this);

        const t = await fetchJSON("/api/template/", {vocab: v});
        this.template[v] = t;

        return t;
    }
}

export function toTitle(s: string) {
    return s[0].toLocaleUpperCase() + s.slice(1);
}

export async function fetchJSON(url: string, data: any = {}, method?: string): Promise<any> {
    const res = await fetch(url, {
        method: method || "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data)
    });

    try {
        return await res.json();
    } catch (e) {
        if (res.status < 300) {
            return res.status;
        } else {
            throw new Error(res.statusText);
        }
    }
}
