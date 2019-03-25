export interface ITemplate {
    front?: string;
    back?: string;
    note?: string;
}

export interface ITemplateMap {
    [key: string]: ITemplate;
}

export const templateMap = {
    "^v/[^/]+(?:/(\\d+))?$": {
        front: "### {{{v.english}}}",
        back: `
## {{{v.simplified}}}

{{#v.traditional}}### {{{v.traditional}}}
{{/v.traditional}}
{{{v.pinyin}}}

{{#s}}
- {{{chinese}}}
    - {{{english}}}
{{/s}}`.trim()
    }
} as ITemplateMap;

export default templateMap;
