import { DbEditor } from "./dbEditor/dbEditor";
import { Md2Html } from "./util";

const md2html = new Md2Html();

const editor = new DbEditor({
    el: document.getElementById("App")!,
    endpoint: "/api/editor/",
    convert: (s, v) => md2html.convert(s, v),
    columns: [
        {name: "deck", width: 200, type: "one-line", required: true},
        {name: "vocab", width: 150, type: "one-line", required: true, oninput: (v) => md2html.addTemplate(v)},
        {name: "front", width: 500, type: "markdown", required: true, template: (
            "### {{v.0.english}}"
        ), templateSource: md2html.template},
        {name: "back", width: 500, type: "markdown", template: `
## {{v.0.simplified}}

{{#v.0.traditional}}### {{v.0.traditional}}
{{/v.0.traditional}}
{{v.0.pinyin}}

{{#s}}
- {{chinese}}
  - {{english}}
{{/s}}`.trim(), templateSource: md2html.template},
        {name: "tag", width: 150, type: "list", separator: " "},
        {name: "note", width: 300, type: "markdown", templateSource: md2html.template},
        {name: "srsLevel", width: 150, type: "number", label: "SRS Level", newEntry: false},
        {name: "nextReview", width: 200, type: "datetime", label: "Next Review", newEntry: false}
    ]
});
