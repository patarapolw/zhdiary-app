import "./common";
import $ from "jquery";
import initDeckViewer from "./deckViewer";
import initCardEditor, { destroyCardEditor } from "./cardEditor";
import { fetchJSON } from "./util";

$(() => {
    $("#link-deckViewer").on("click", () => {
        destroyCardEditor();
        initDeckViewer();
    });

    $("#link-cardEditor").on("click", () => {
        initCardEditor();
    });
});

fetchJSON("/api/editor/", {q: "", offset: 0, limit: 1}).then((r) => {
    if (r && r.total) {
        initDeckViewer();
    } else {
        initCardEditor();
    }
});
