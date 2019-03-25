import "bootstrap";
import $ from "jquery";
import "jstree";
import uuid from "uuid/v4";
import { shuffle, md2html, fetchJSON, toTitle } from "./util";
import "./deckViewer/deckViewer.scss";
import "jstree/dist/themes/default/style.min.css";
import deckViewerHtml from "./deckViewer/deckViewer.html";
import { IDbEditorSettings, IJqList, IMdeList, IModalList } from "./dbEditor/dbEditor";
import SimpleMDE from "simplemde";
import tingle from "tingle.js";
import flatpickr from "flatpickr";
import "./common";

let uuidToDeck = {} as any;
let jstree: any = null;
let q: string = "";

async function loadJstree() {
    const deckList = await fetchJSON("/api/deck/filter", {q});

    if (deckList.length === 0) {
        return;
    }

    if (jstree) {
        uuidToDeck = {} as any;
        $("#DeckArea").html("");
        jstree.destroy();
    }

    const deckWithSubDecks: string[] = [];

    deckList.sort().forEach((d: string) => {
        const deck = d.split("/");
        deck.forEach((seg, i) => {
            const subDeck = deck.slice(0, i + 1).join("/");
            if (deckWithSubDecks.indexOf(subDeck) === -1) {
                deckWithSubDecks.push(subDeck);
            }
        });
    });

    const data = [] as any[];

    deckWithSubDecks.forEach((d) => {
        const deck = d.split("/");
        recurseParseData(data, deck);
    });

    $(() => {
        // @ts-ignore
        $("#DeckArea").jstree({
            core: {
                data,
                multiple: false
            }
        });

        // @ts-ignore
        jstree = $("#DeckArea").jstree(true);

        $("#DeckArea").bind("loaded.jstree", () => {
            Object.keys(uuidToDeck).forEach((id) => {
                const node = jstree.get_node(id);
                if (node.children.length === 0) {
                    nodeAddStat(id);
                }
            });
        })
        .bind("after_open.jstree", (e: any, current: any) => {
            $(".tree-score", $(`#${current.node.id}`)).remove();
            current.node.children_d.forEach((id: string) => {
                if (!jstree.get_node(id).state.opened) {
                    nodeAddStat(id);
                }
            });
        })
        .bind("after_close.jstree", (e: any, current: any) => {
            nodeAddStat(current.node.id);
        })
        .bind("select_node.jstree", (e: any, current: any) => {
            initQuiz(current.node.id);
            $("#App").removeClass("container").addClass("container-fluid");
            $("#DeckColumn").removeClass("col-12").addClass("col-3").addClass("border-right");
            setTimeout(() => {
                $("#QuizArea").removeClass("hidden");
            }, 400);
        });
    });
}

function recurseParseData(data: any[], deck: string[], _depth = 0) {
    let doLoop = true;

    while (_depth < deck.length - 1) {
        for (const c of data) {
            if (c.text === deck[_depth]) {
                c.children = c.children || [];
                recurseParseData(c.children, deck, _depth + 1);
                doLoop = false;
                break;
            }
        }

        _depth++;

        if (!doLoop) {
            break;
        }
    }

    if (doLoop && _depth === deck.length - 1) {
        const id = uuid();

        data.push({
            id,
            text: deck[_depth],
            state: _depth < 2 ? {opened: true} : undefined
        });

        uuidToDeck[id] = deck.join("/");
    }
}

async function nodeAddStat(id: string) {
    const stat = await fetchJSON("/api/deck/stat", {
        deck: uuidToDeck[id],
        q
    });

    $(`#${id}`).append(`
    <div class="tree-score float-right text-align-right">
        <span class="tree-new tree-score-child">${stat.new}</span>
        <span class="tree-leech tree-score-child">${stat.leech}</span>
        <span class="tree-due tree-score-child">${stat.due}</span>
    </div>
    `);
}

async function initQuiz(id: string) {
    const deck = uuidToDeck[id];
    const cardIds = await fetchJSON("/api/quiz/", {deck, q});
    const quizAreaEl = document.getElementById("QuizArea") as HTMLDivElement;
    const $quizArea = $(quizAreaEl);

    $quizArea.html(`<div>${cardIds.length} entries to go...</div>`);
    if (cardIds.length > 0) {
        shuffle(cardIds);

        while (cardIds.length > 0) {
            const cardId = cardIds.splice(0, 1)[0];
            const c = await fetchJSON("/api/quiz/render", {id: cardId});

            const $parent = $(`
            <div class="c-container">
                <div class="c-all c-data-front">${md2html(c.front)}</div>
                <div class="c-back c-data-back">${md2html(c.back || "")}</div>
                <div class="c-btn-list mt-3 mb-3">
                    <button class="btn btn-primary c-front c-btn-show">Show</button>
                    <button class="btn btn-success c-back c-btn-right">Right</button>
                    <button class="btn btn-danger c-back c-btn-wrong">Wrong</button>
                    <button class="btn btn-info c-back c-btn-edit">Edit entry</button>
                    <button class="btn btn-warning c-back c-btn-skip">Skip</button>
                </div>
            </div>
            `);
            $parent.data("id", cardId);
            $quizArea.append($parent);
            quizAreaEl.scrollTo(0, quizAreaEl.scrollHeight);

            $(".c-back", $parent).hide();
            $(".c-btn-show", $parent).click(() => {
                $(".c-front", $parent).hide();
                $(".c-back", $parent).show();
                quizAreaEl.scrollTo(0, quizAreaEl.scrollHeight);
            });

            await new Promise((resolve, reject) => {
                $(".c-btn-right", $parent).click(() => {
                    fetchJSON("/api/quiz/right", {id: cardId}, "PUT");
                    resolve();
                });

                $(".c-btn-wrong", $parent).click(() => {
                    fetchJSON("/api/quiz/wrong", {id: cardId}, "PUT");
                    resolve();
                });

                $(".c-btn-skip", $parent).click(() => {
                    resolve();
                });
            });

            $(".c-btn-list", $parent).hide();
        }

        $quizArea.append(`<div>All done!</div>`);
    } else {
        const [nextHour, nextDay] = await Promise.all([
            fetchJSON("/api/quiz/", {
                deck,
                q,
                due: [1, "hour"]
            }),
            fetchJSON("/api/quiz/", {
                deck,
                q,
                due: [1, "day"]
            })
        ]);

        $quizArea.append(`
        <div>Pending next hour: ${nextHour.length}</div>
        <div>Pending next day: ${nextDay.length}</div>`);
    }
}

class EntryEditor {
    private settings: IDbEditorSettings;

    private $el: IJqList = {};
    private mde: IMdeList = {};
    private modal: IModalList = {};
    private current = {
        vocab: ""
    };

    constructor(settings: IDbEditorSettings) {
        this.settings = settings;

        this.$el.editEntry = $(`
        <form class="needs-validation db-editor-new-entry-editor">
            <h3>Edit entry</h3>
        </form>`);
        $(settings.el).append(this.$el.editEntry);

        for (const col of this.settings.columns) {
            if (typeof col.editEntry === "boolean" && !col.editEntry) {
                continue;
            }

            switch (col.type) {
                case "one-line":
                case "number":
                case "list":
                case "datetime":
                    this.$el[col.name] = $(`
                    <div class="form-group row">
                        <label class="col-sm-2 col-form-label">${col.label || toTitle(col.name)}</label>
                        <div class="col-sm-10">
                            <input class="form-control" type="text"
                            name="${col.name}" ${col.required ? "required" : ""}>
                        </div>
                    </div>`);
                    break;
                case "markdown":
                default:
                    this.$el[col.name] = $(`
                    <div class="form-group">
                        <label>${toTitle(col.name)}</label>
                        <textarea class="form-control" rows="3"
                        name="${col.name}" ${col.required ? "required" : ""}></textarea>
                    </div>"`);
            }

            if (col.type === "datetime") {
                const $input = $("input", this.$el[col.name]);
                flatpickr($input, {
                    enableTime: true,
                    dateFormat: "Y-M-d H:i"
                });
            } else if (col.type === "markdown") {
                this.mde[col.name] = new SimpleMDE({
                    element: $("textarea", this.$el[col.name]).get(0),
                    spellChecker: false,
                    previewRender: (md) => {
                        return settings.convert!(md, this.current.vocab);
                    }
                });
            }

            if (settings.templateApi && col.name === "template") {
                $("input, textarea", this.$el[col.name]).on("input", (e) => {
                    const v = (e.target as any).value;
                    if (v) {
                        fetchJSON(this.settings.templateApi!, {template: v}).then((t) => {
                            if (t) {
                                for (const col2 of settings.columns) {
                                    if (t[col2.name]) {
                                        if (col2.type === "markdown") {
                                            this.mde[col2.name].value(t[col2.name]);
                                            setTimeout(() => this.mde[col2.name].codemirror.refresh(), 0);
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }

            this.$el.editEntry.append(this.$el[col.name]);
            this.$el[col.name].data("col", col);

            if (col.required) {
                $("input, textarea", this.$el[col.name]).parent().append(`
                <div class="invalid-feedback">
                    ${col.requiredText ? col.requiredText : `${toTitle(col.name)} is required.`}
                </div>`);
            }
        }

        this.modal.editEntry = new tingle.modal({
            footer: true,
            stickyFooter: false,
            closeMethods: ["button", "escape"],
            onOpen: () => {
                for (const col of settings.columns) {
                    if (col.type === "markdown") {
                        if (this.mde[col.name].isFullscreenActive()) {
                            SimpleMDE.toggleFullScreen(this.mde[col.name]);
                        }

                        if (this.mde[col.name].isPreviewActive()) {
                            SimpleMDE.togglePreview(this.mde[col.name]);
                        }

                        setTimeout(() => this.mde[col.name].codemirror.refresh(), 0);
                    }
                }
            },
            onClose: () => {
                (this.$el.editEntry.get(0) as HTMLFormElement).reset();
                Object.values(this.mde).forEach((el) => el.value(""));
            }
        });

        this.modal.editEntry.setContent(this.$el.editEntry.get(0));
        this.modal.editEntry.addFooterBtn("Save", "tingle-btn tingle-btn--primary", () => {
            for (const col of this.settings.columns) {
                if (col.type === "markdown") {
                    $("textarea", this.$el[col.name]).val(this.mde[col.name].value());
                }
            }

            for (const col of this.settings.columns) {
                if (col.required) {
                    col.constraint = col.constraint ? col.constraint : (x: any) => !!x;
                    if (!col.constraint!($("input, textarea", this.$el[col.name]).val())) {
                        this.$el.editEntry.addClass("was-validated");
                        return;
                    }
                }
            }

            const entry = {} as any;
            for (const col of this.settings.columns) {
                if (col.type === "datetime") {
                    // @ts-ignore
                    entry[col.name] = $("input", this.$el[col.name])[0]._flatpickr.selectedDates[0];
                    continue;
                }

                let v: string | number | string[] | object | null =
                ($("input, textarea", this.$el[col.name]).val() || "") as string;
                if (col.type === "list") {
                    const ls = v.split(col.separator || " ");
                    v = ls.filter((el, i) => el && ls.indexOf(el) === i).sort();
                } else if (col.type === "number") {
                    v = v ? parseFloat(v) : null;
                }

                entry[col.name] = v;
            }

            this.updateEntry(entry, this.$el.editEntry.data("$container"));
            this.modal.editEntry.close();
        });

        $(settings.el).on("click", ".c-btn-edit", (e) => {
            const $container = $(e.target).closest(".c-container");
            this.$el.editEntry.data("$container", $container);

            fetchJSON(this.settings.endpoint, {
                q: `id:${$container.data("id")}`,
                offset: 0,
                limit: 1
            }).then((r) => {
                const entry = r.data[0];
                for (const col of settings.columns) {
                    switch (col.type) {
                        case "list":
                            $("input", this.$el[col.name]).val(entry[col.name].join(col.separator || " "));
                            break;
                        case "markdown":
                            this.mde[col.name].value(entry[col.name] || "");
                            break;
                        case "datetime":
                            // @ts-ignore
                            $("input", this.$el[col.name])[0]._flatpickr.setDate(entry[col.name]);
                            break;
                        default:
                            $("input, textarea", this.$el[col.name]).val(entry[col.name]);
                    }
                }
            });

            this.modal.editEntry.open();
        });
    }

    private updateEntry(entry: any, $container: JQuery) {
        $(".c-data-front", $container).html(this.settings.convert!(entry.front));
        $(".c-data-back", $container).html(this.settings.convert!(entry.back || ""));
        console.log($container.data("id"));
        fetchJSON(this.settings.endpoint, {
            id: $container.data("id"),
            update: entry
        }, "PUT");
    }
}

$(() => {
    $("#App").addClass("container").html(deckViewerHtml);
    const $nav = $("nav");
    if ($nav.length > 0) {
        $("#App").css("height", `calc(100% - ${$nav[0].offsetHeight}px`);
    }
    loadJstree();

    $("#search-bar").on("input", (e) => {
        q = $(e.target).val() as string;
        loadJstree();
    });
});

const entryEditor = new EntryEditor({
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
        {name: "srsLevel", width: 150, type: "number", label: "SRS Level"},
        {name: "nextReview", width: 200, type: "datetime", label: "Next Review"}
    ]
});
