import { CreateElement } from "vue";
import h from "hyperscript";
import { fetchJSON, shuffle, md2html } from "../util";
import { Vue, Component, Watch } from "vue-property-decorator";
import quizState from "./shared";
import globalState from "../shared";
import EntryEditor from "../DbEditor/entry/EntryEditor";

@Component
export default class QuizArea extends Vue {
    private state = quizState;

    private currentId?: number;
    private isQuizStarted = false;
    private isLoading = false;

    public render(m: CreateElement) {
        return m("div", {
            style: {
                display: this.state.isQuizReady ? "inline-block" : "none",
                height: `${window.innerHeight - 60}px`, overflow: "scroll"
            },
            class: {
                "col-12": this.state.isDeckHidden,
                "col-9": !this.state.isDeckHidden,
                "fixed-container": true
            }
        }, [
            m(EntryEditor, {
                ref: "entryEditor",
                props: {
                    title: "Edit entry",
                    cols: globalState.cols,
                    showAll: true,
                    editorApi: globalState.cardEditorApi
                },
                on: {save: this.onEntryUpdated}
            }),
            m("div", {
                class: ["quiz-area"]
            }, [
                m("img", {
                    domProps: {src: "/asset/Spinner-1s-200px.svg"},
                    style: {height: "5em", display: this.isLoading ? "block" : "none", margin: "0 auto"}
                })
            ])
        ]);
    }

    @Watch("state.isQuizStarted")
    public async initQuiz() {
        if (this.state.isQuizStarted) {
            this.isLoading = true;

            const quizAreaEl = this.$el;
            const $quizArea = $(".quiz-area", quizAreaEl);

            const cards = await fetchJSON(globalState.quizApi, {deck: this.state.currentDeck, q: this.state.q});
            $quizArea.html("");

            this.state.isQuizStarted = false;
            this.isLoading = false;

            $quizArea.html(h("div", `${cards.length.toLocaleString()} entries to go...`).outerHTML);
            if (cards.length > 0) {
                shuffle(cards);

                while (cards.length > 0) {
                    const card = cards.splice(0, 1)[0];
                    console.log(card);
                    const c = await fetchJSON(globalState.quizApi + "render", card);

                    card.id = c.id;

                    const $parent = $(h(`.c-container.c-${card.id}`, [
                        h(".c-all.c-data-front", {innerHTML: md2html(c.front)}),
                        h(".c-back.c-data-back", {innerHTML: md2html(c.back)}),
                        h(".c-btn-list.mt-3.mb-3", [
                            h("button.btn.btn-primary.c-front.c-btn-show", "Show"),
                            h("button.btn.btn-success.c-back.c-btn-right.mr-1", "Right"),
                            h("button.btn.btn-danger.c-back.c-btn-wrong.mr-1", "Wrong"),
                            h("button.btn.btn-info.c-back.c-btn-edit.mr-1", "Edit entry"),
                            h("button.btn.btn-warning.c-back.c-btn-skip", "Skip")
                        ])
                    ]).outerHTML);

                    $parent.data("id", card.id);
                    $quizArea.append($parent);
                    quizAreaEl.scrollTo(0, quizAreaEl.scrollHeight);

                    $(".c-back", $parent).hide();
                    $(".c-btn-show", $parent).click(() => {
                        $(".c-front", $parent).hide();
                        $(".c-back", $parent).show();
                        quizAreaEl.scrollTo(0, quizAreaEl.scrollHeight);
                    });

                    $(".c-btn-edit", $parent).click(() => {
                        this.currentId = card.id;
                        (this.$refs.entryEditor as any).show(card.id);
                    });

                    await new Promise((resolve, reject) => {
                        $(".c-btn-right", $parent).click(() => {
                            fetchJSON("/quiz/right", {id: card.id}, "PUT");
                            resolve();
                        });

                        $(".c-btn-wrong", $parent).click(() => {
                            fetchJSON("/quiz/wrong", {id: card.id}, "PUT");
                            resolve();
                        });

                        $(".c-btn-skip", $parent).click(() => {
                            resolve();
                        });
                    });

                    $(".c-btn-list", $parent).hide();
                }

                $quizArea.append(h("div", "All done!").outerHTML);
            } else {
                const [nextHour, nextDay] = await Promise.all([
                    fetchJSON("/quiz/", {
                        deck: quizState.currentDeck,
                        q: this.state.q,
                        due: [1, "hour"]
                    }),
                    fetchJSON("/quiz/", {
                        deck: quizState.currentDeck,
                        q: this.state.q,
                        due: [1, "day"]
                    })
                ]);

                $quizArea.append(h("div", [
                    h("div", `Pending next hour: ${nextHour.length.toLocaleString()}`),
                    h("div", `Pending next day: ${nextDay.length.toLocaleString()}`)
                ]));
            }
        }
    }

    private async onEntryUpdated(entry: any) {
        await fetchJSON(globalState.cardEditorApi, {id: this.currentId, update: entry}, "PUT");
        const $parent = $(`.c-${this.currentId}`);
        console.log(entry);

        $(".c-data-front", $parent).html(md2html(entry.front));
        $(".c-data-back", $parent).html(md2html(entry.back));
    }
}
