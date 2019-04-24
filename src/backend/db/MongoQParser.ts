import P from "parsimmon";
import XRegExp from "xregexp";
import moment from "moment";

export interface ISearchParserRule {
    anyOf?: string[];
    isString?: string[];
    isDate?: string[];
    isList?: string[];
    flattenDates?: boolean;
}

export class SearchParser {
    private lang: P.Language;

    constructor(rule: ISearchParserRule = {}) {
        this.lang = P.createLanguage({
            Input: (r) => P.alt(
                r.OrSentence,
                r.AndSentence,
                r.Sentence
            ),
            OrSentence: (r) => P.seq(
                r.Sentence,
                P.string(" OR "),
                r.Sentence
            ).map((el) => {
                return {$or: [el[0], el[2]]};
            }),
            AndSentence: (r) => P.seq(
                r.Sentence,
                P.string(" "),
                r.Sentence
            ).map((el) => {
                return {$and: [el[0], el[2]]};
            }),
            Sentence: (r) => P.alt(
                r.Bracketed,
                r.OrExpr,
                r.AndExpr,
                r.Expr
            ),
            Bracketed: (r) => P.string("(").then(r.Sentence).skip(P.string(")")),
            OrExpr: (r) => P.seq(
                r.Expr,
                P.string(" OR "),
                r.Expr
            ).map((el) => {
                return {$or: [el[0], el[2]]};
            }),
            AndExpr: (r) => P.seq(
                r.Expr,
                P.string(" "),
                r.Expr
            ).map((el) => {
                return {$and: [el[0], el[2]]};
            }),
            Expr: (r) => P.alt(
                r.PosExpr,
                r.NegExpr
            ),
            NegExpr: (r) => P.string("-").then(r.PosExpr).map((x) => {
                return {$not: x};
            }),
            PosExpr: (r) => P.alt(
                r.FullExpr,
                r.PartialExpr
            ),
            PartialExpr: (r) => r.Value.map((el) => {
                const expr = [] as any[];

                if (rule.anyOf) {
                    for (const col of rule.anyOf) {
                        let def = {[col]: el};

                        if ((!rule.isString && !rule.isList) || (rule.isString && rule.isString.indexOf(col) !== -1)) {
                            def = {[col]: {$regex: XRegExp.escape(el.toString())}};
                        }

                        expr.push(def);
                    }
                } else if (rule.isString) {
                    for (const col of rule.isString) {
                        expr.push({[col]: {$regex: XRegExp.escape(el.toString())}});
                    }
                }

                if (expr.length === 0) {
                    throw new Error("Any or String not set");
                } else if (expr.length === 1) {
                    return expr[0];
                }

                return {$or: expr};
            }),
            FullExpr: (r) => P.seq(
                r.String,
                r.Op,
                r.Value
            ).map((el: any[]) => {
// tslint:disable-next-line: prefer-const
                let [k, op, v] = el;

                if (k === "is") {
                    if (v === "due") {
                        k = "nextReview";
                        op = "<=";
                        v = moment().toDate();
                    } else if (v === "leech") {
                        k = "srsLevel";
                        v = 0;
                    } else if (v === "new") {
                        k = "srsLevel";
                        v = "NULL";
                    }
                }

                if (v === "NULL") {
                    return {$or: [
                        {[k]: null},
                        {[k]: {$exists: false}}
                    ]};
                }

                if (rule.isDate && rule.isDate.indexOf(k) !== -1) {
                    const m = /^([-+]?\d+)(\S+)$/.exec(v.toString());

                    if (m) {
                        v = moment().add(moment.duration(parseInt(m[1]), m[2] as any)).toDate();
                        op = "<=";
                    } else if (v === "now") {
                        v = moment().toDate();
                        op = "<=";
                    }
                }

                if (rule.flattenDates) {
                    if (moment.isDate(v)) {
                        v = v.toISOString();
                    }
                }

                switch (op) {
                    case ":":
                        if (typeof v === "string") {
                            v = {$regex: XRegExp.escape(v)};
                        } else if (rule.isString && rule.isString.indexOf(v) !== -1) {
                            v = {$regex: XRegExp.escape(v.toString())};
                        }
                        break;
                    case "~":
                        v = {$regex: v.toString()};
                        break;
                    case ">=":
                        v = {$gte: v};
                        break;
                    case ">":
                        v = {$gt: v};
                        break;
                    case "<=":
                        v = {$lte: v};
                        break;
                    case "<":
                        v = {$lt: v};
                        break;
                    case "=":
                    default:
                }

                return {[k]: v};
            }),
            Value: (r) => P.alt(
                r.Number,
                r.String
            ),
            Number: () => P.regexp(/^\d+(?:\.\d+)?$/).map(Number),
            String: (r) => P.alt(
                r.RawString,
                r.QuoteString
            ),
            RawString: () => P.regexp(/[^-" :>=<~]+/),
            QuoteString: (r) => r.Quote.then(r.Value).skip(r.Quote),
            Quote: () => P.string('"'),
            Op: () => P.alt(
                P.string(":"),
                P.string("~"),
                P.string(">="),
                P.string(">"),
                P.string("<="),
                P.string("<"),
                P.string("=")
            ),
            _: () => P.optWhitespace
        });
    }

    public parse(s?: string) {
        const r = this.lang.Input.parse(s || "");
        if (!r.status) {
            return {};
        } else {
            return r.value;
        }
    }
}

export default SearchParser;

export function mongoToFilter(cond: any): (item: any) => boolean {
    return (item: any) => {
        for (const k of Object.keys(cond)) {
            if (k[0] === "$") {
                if (k === "$and") {
                    const ck: any[] = cond[k];
                    return ck.every((c) => mongoToFilter(c)(item));
                } else if (k === "$or") {
                    const ck: any[] = cond[k];
                    return ck.some((c) => mongoToFilter(c)(item));
                } else if (k === "$not") {
                    return !mongoToFilter(cond[k])(item);
                }
            } else {
                const ck: any = cond[k];

                if (ck && typeof ck === "object" && Object.keys(ck).some((c) => c[0] === "$")) {
                    return mongoCompare(item[k], ck);
                } else {
                    if (Array.isArray(item[k])) {
                        if (item[k].indexOf(ck) === -1) {
                            return false;
                        }
                    } else {
                        if (item[k] !== ck) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    };
}

function mongoCompare(v: any, ck: any): boolean {
    for (const op of Object.keys(ck)) {
        const v0 = ck[op];

        if (op === "$regex") {
            if (Array.isArray(v)) {
                return v.some((b) => new RegExp(v0.toString()).test(b));
            } else {
                return new RegExp(v0.toString()).test(v);
            }
        } else if (op === "$gte") {
            return v >= v0;
        } else if (op === "$gt") {
            return v > v0;
        } else if (op === "$lte") {
            return v <= v0;
        } else if (op === "$lt") {
            return v < v0;
        } else if (op === "$exists") {
            return (v !== undefined) === v0;
        } else if (op === "$in") {
            return (v0 as any[]).some((a) => a === v);
        }
    }

    return false;
}
