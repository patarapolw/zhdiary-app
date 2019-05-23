import XRegExp from "xregexp";
import url from "url";
import { CreateElement } from "vue";
import { Vue, Component } from "vue-property-decorator";
import { fetchJSON } from "../util";

@Component
export default class Vocab extends Vue {
    private i = 0;
    private vocabList: any[] = [];
    private sentenceList: any[] = [];
    private current: any = {};
    private q: string = "";

    public render(m: CreateElement) {
        const urlJson = url.parse(location.hash.substring(2), true).query;
        const is = urlJson.is as string;
        const q = urlJson.q as string;

        if (is && this.current.is !== is) {
            this.current.is = is;
            this.parseVocab([this.current.is]);
        } else if (this.current.q !== q) {
            this.current.q = q;
            this.parseJieba(this.current.q);
        }

        let currentVocab = this.vocabList[this.i];

        if (currentVocab === undefined) {
            currentVocab = {};
            this.sentenceList = [];
        } else {
            if (this.current.simplified !== currentVocab.simplified) {
                fetchJSON("/dict/sentence", { entry: currentVocab.simplified }).then((res) => {
                    this.sentenceList = res;
                    this.current.simplified = currentVocab.simplified;
                });
            }
        }

        return m("div", {
            class: ["container", "mt-3"]
        }, [
            m("input", {
                class: ["form-control", "mt-3", "search-bar"],
                domProps: {placeholder: "Type here to search", value: this.q},
                on: {keypress: (e: any) => {
                    if (e.key === "Enter") {
                        this.q = e.target.value;
                        this.parseJieba(this.q);
                    }
                }}
            }),
            m("div", {
                class: ["row", "mt-3", "full-width", "c-container"]
            }, [
                m("div", {
                    class: ["col-md-6", "text-center"]
                }, [
                    m("input", {
                        class: ["col-md-6", "vocab-display", "c-input"],
                        on: {keypress: (e: any) => {
                            if (e.key === "Enter") {
                                this.parseVocab([e.target.value]);
                            }
                        }},
                        domProps: {value: currentVocab.simplified}
                    }),
                    m("div", {
                        class: ["button-prev-next"]
                    }, [
                        m("div", {
                            class: ["btn-group", "col-auto"]
                        }, [
                            m("div", {
                                class: ["btn-group", "col-auto"]
                            }, [
                                m("button", {
                                    class: ["btn", "btn-info", "btn-default"],
                                    attrs: {disabled: !(this.i > 0)},
                                    on: {click: (e: any) => this.i--}
                                }, "Previous"),
                                m("button", {
                                    class: ["btn", "btn-info", "btn-default"],
                                    attrs: {disabled: !(this.i < this.vocabList.length - 1)},
                                    on: {click: (e: any) => this.i++}
                                }, "Next")
                            ])
                        ]),
                        m("div", {
                            class: ["mt-3"]
                        }, [
                            m("a", {
                                domProps: {href:
                                    `https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${
                                        this.q || currentVocab.simplified}`},
                                attrs: {target: "_blank"}
                            }, "Open in MDBG")
                        ])
                    ])
                ]),
                m("div", {
                    class: ["col-md-6"]
                }, [
                    m("div", {class: ["row"]}, [m("h4", "Traditional")]),
                    m("div", {
                        class: ["row", "vocab-list"]
                    }, [
                        m("div", {class: ["vocab-small-display"]}, currentVocab.traditional || "")
                    ]),
                    m("div", {class: ["row"]}, [m("h4", "Reading")]),
                    m("div", {
                        class: ["row", "pinyin-list"]
                    }, [
                        m("div", currentVocab.pinyin || "")
                    ]),
                    m("div", {class: ["row"]}, [m("h4", "English")]),
                    m("div", {
                        class: ["row", "pinyin-list"]
                    }, [
                        m("div", currentVocab.english || "")
                    ]),
                    m("div", {class: ["row"]}, [m("h4", "Sentence")]),
                    m("div", {
                        class: ["row", "sentence-list"]
                    }, [
                        this.sentenceList.map((el: any) => {
                            return m("div", {
                                class: ["inline"]
                            }, [
                                m("span", el.chinese),
                                m("span", el.english)
                            ]);
                        })
                    ])
                ])
            ])
        ]);
    }

    private parseJieba(s: string) {
        if (s.length > 0) {
            fetchJSON("http://localhost:33436/jieba/cut", { entry: s }).then((res) => {
                const distinctVocabList = res.result
                    .filter((el: string, _i: number, self: any) => {
                        return XRegExp("\\p{Han}").test(el) && self.indexOf(el) === _i;
                    });

                console.log(distinctVocabList);
                this.parseVocab(distinctVocabList);
            });
        }
    }

    private parseVocab(vocabList: string[]) {
        fetchJSON("dict/vocab/match", { vocabList }).then((res) => {
            this.i = 0;
            this.vocabList = res;
        });
    }
}
