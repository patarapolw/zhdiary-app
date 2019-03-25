import P from "parsimmon";
import XRegExp from "xregexp";
import moment from "moment";

export interface ILokiSearchQueryRule {
    any?: string[];
    isString?: string[];
    isDate?: string[];
}

export class LokiSearchQuery {
    private lang: P.Language;

    constructor(rule: ILokiSearchQueryRule = {}) {
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
                r.FullExpr,
                r.PartialExpr
            ),
            PartialExpr: (r) => r.Value.map((el) => {
                const expr = [] as any[];

                if (rule.any) {
                    for (const col of rule.any) {
                        if (rule.isString) {
                            if (rule.isString.indexOf(col) !== -1) {
                                expr.push({[col]: {$regex: XRegExp.escape(el.toString())}});
                            } else {
                                expr.push({[col]: el});
                            }
                        } else {
                            expr.push({[col]: {$regex: XRegExp.escape(el.toString())}});
                        }
                    }
                } else if (rule.isString) {
                    for (const col of rule.isString) {
                        expr.push({[col]: {$regex: XRegExp.escape(el.toString())}});
                    }
                }

                if (expr.length === 0) {
                    throw new Error("Any or String not set");
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

                const result = {} as any;

                if (v === "NULL") {
                    return {$or: [
                        {[k]: ""},
                        {[k]: {$exists: false}}
                    ]};
                }

                if (rule.isDate && rule.isDate.indexOf(k) !== -1) {
                    const m = /^([-+]?\d+)(\S+)$/.exec(v.toString());

                    if (m) {
                        v = moment().add(moment.duration(parseInt(m[1]), m[2] as any)).toISOString();
                        op = "<=";
                    } else if (v === "now") {
                        v = moment().toISOString();
                        op = "<=";
                    }
                }

                switch (op) {
                    case ":":
                        if (rule.isString) {
                            if (rule.isString.indexOf(k) !== -1) {
                                v = {$regex: XRegExp.escape(v.toString())};
                            }
                        } else {
                            v = {$regex: XRegExp.escape(v.toString())};
                        }
                        break;
                    case "~":
                        v = {$regex: v.toString()};
                        break;
                    case ">=":
                        v = {$and: [
                            {$gte: v},
                            {$exists: true}
                        ]};
                        break;
                    case ">":
                        v = {$and: [
                            {$gt: v},
                            {$exists: true}
                        ]};
                        break;
                    case "<=":
                        v = {$and: [
                            {$lte: v},
                            {$exists: true}
                        ]};
                        break;
                    case "<":
                        v = {$and: [
                            {$lt: v},
                            {$exists: true}
                        ]};
                        break;
                    case "=":
                    default:
                }

                result[k] = v;

                return result;
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
            RawString: () => P.regexp(/[^" :>=<~]+/),
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

    public search(s: string) {
        return this.lang.Input.tryParse(s);
    }
}

export default LokiSearchQuery;
