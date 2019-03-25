import showdown from "showdown";
import XRegExp from "xregexp";

export function shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const mdConverter = new showdown.Converter({
    tables: true
});

mdConverter.setFlavor("github");

export function md2html(s: string): string {
    if (!s) {
        return "";
    }

    s = XRegExp.replace(s, XRegExp("([\\p{Han}，、“”0-9]*\\p{Han}[\\p{Han}，、“”0-9]*)", "g"),
    `<span class="zh-speak">$1</span>`);

    return mdConverter.makeHtml(s);
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
