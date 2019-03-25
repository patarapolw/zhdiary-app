import { DbEditor } from "./dbEditor/dbEditor";
import { md2html } from "./util";
import "./common";

const editor = new DbEditor({
    el: document.getElementById("App")!,
    endpoint: "/api/editor/",
    templateApi: "/api/template/",
    convert: (s) => md2html(s),
    columns: [
        {name: "deck", width: 200, type: "one-line", required: true},
        {name: "template", width: 150, type: "one-line"},
        {name: "front", width: 500, type: "markdown", required: true},
        {name: "back", width: 500, type: "markdown"},
        {name: "tag", width: 150, type: "list", separator: " "},
        {name: "note", width: 300, type: "markdown"},
        {name: "srsLevel", width: 150, type: "number", label: "SRS Level", newEntry: false},
        {name: "nextReview", width: 200, type: "datetime", label: "Next Review", newEntry: false}
    ]
});
