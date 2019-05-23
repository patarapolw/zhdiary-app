import uuid4 from "uuid/v4";
import { CreateElement } from "vue";
import { Vue, Component } from "vue-property-decorator";
import XRegExp from "xregexp";
import $ from "jquery";
import url from "url";
import { fetchJSON } from "../util";

interface IRadical {
    sub?: string[];
    sup?: string[];
    var?: string[];
}

@Component
export default class Hanzi extends Vue {
    private radical: IRadical = {};
    private vocab: any[] = [];
    private hanziList: string[] = [];
    private currentHanzi: string = "";

    private current: any = {};
    private i: number = 0;
    private IsHanRegex = XRegExp("\\p{Han}");

    private q: string = "";

    public render(m: CreateElement) {
        const that = this;

        function getCharacterBlock(s: string) {
            const sUuid = s + uuid4().substring(0, 8);
    
            return m("div", {
                class: ["character-block"]
            }, [
                m("div", {
                    attrs: {id: `${sUuid}-base`},
                    class: ["character-block-base"],
                    on: {mouseenter: (e: any) => {
                        const baseEl = e.target;
                        const hoverEl = document.getElementById(`${sUuid}-hover`);
                        const $baseOffset = $(baseEl).offset();
    
                        if (hoverEl !== null && $baseOffset !== undefined) {
                            $(hoverEl).offset({
                                left: $baseOffset.left + (baseEl.offsetWidth / 2) - (hoverEl.offsetWidth / 2),
                                top: $baseOffset.top + (baseEl.offsetHeight / 2) - (hoverEl.offsetHeight / 2)
                            });
    
                            baseEl.style.color = "white";
                        }
                    }}
                }, s),
                m("div", {
                    attrs: {id: `${sUuid}-hover`},
                    class: ["character-block-hover"],
                    on: {
                        click: (e: any) => {
                            that.parseHanziList(e.target.innerText, 0);
                        },
                        mouseout: (e: any) => {
                            const baseEl = document.getElementById(`${sUuid}-base`);
                            const $hoverEl = $(e.target);
        
                            let observer: any = null;
                            function removeHoverEl() {
                                $hoverEl.offset({
                                    left: -9999
                                });
    
                                if (baseEl !== null) {
                                    baseEl.style.color = "black";
                                }
    
                                if (observer !== null) {
                                    observer.disconnect();
                                }
                            }
        
                            observer = new MutationObserver(removeHoverEl);
                            observer.observe(document.body,  { attributes: true, childList: true });
        
                            removeHoverEl();
                        }
                    }
                }, s)
            ]);
        }

        const q = url.parse(location.hash.substring(2), true).query.q as string;

        if (this.current.q !== q) {
            this.parseHanziList(q);
            this.current.q = q;
        }

        if (this.currentHanzi !== this.hanziList[this.i] && this.hanziList[this.i] !== undefined) {
            this.currentHanzi = this.hanziList[this.i];
            fetchJSON("/dict/radical", {
                entry: this.currentHanzi
            }).then((res) => {
                this.radical = res;
            });

            fetchJSON("/dict/vocab", {
                entry: this.currentHanzi
            }).then((res) => {
                this.vocab = res;
            });
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
                        this.parseHanziList(this.q, 0);
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
                        class: ["col-md-6", "hanzi-display", "c-input"],
                        on: {input: (e: any) => {
                            this.parseHanziList(e.target.value);
                            return true;
                        }},
                        domProps: {value: this.hanziList[this.i]}
                    }),
                    m("div", {
                        class: ["button-prev-next"]
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
                                attrs: {disabled: !(this.i < this.hanziList.length - 1)},
                                on: {click: (e: any) => this.i++}
                            }, "Next")
                        ])
                    ])
                ]),
                m("div", {
                    class: ["col-md-6"]
                }, [
                    m("div", {class: ["row"]}, [m("h4", "Subcompositions")]),
                    m("div", {class: ["row", "hanzi-list"]},
                        this.radical.sub ? this.radical.sub.map((el: string) => getCharacterBlock(el)) : []),
                    m("div", {class: ["row"]}, [m("h4", "Supercompositions")]),
                    m("div", {class: ["row", "hanzi-list"]},
                        this.radical.sub ? this.radical.sub.map((el: string) => getCharacterBlock(el)) : []),
                    m("div", {class: ["row"]}, [m("h4", "Variants")]),
                    m("div", {class: ["row", "hanzi-list"]},
                        this.radical.var ? this.radical.var.map((el: string) => getCharacterBlock(el)) : []),
                    m("div", {class: ["row"]}, [m("h4", "Vocabularies")]),
                    m("div", {class: ["row", "vocab-list"]},
                        this.vocab.map((el: any) => {
                            return m("div", {
                                class: ["inline"]
                            }, [
                                m("span", el.simplified),
                                el.traditional === undefined ? "" : m("span", el.traditional),
                                m("span", `[${el.pinyin}]`),
                                m("span", el.english)
                            ]);
                        }))
                ])
            ])
        ]);
    }

    private parseHanziList(s: string, index?: number) {
        if (s.length > 0) {
            const _hanziList: any = XRegExp.matchChain(s, [this.IsHanRegex]);
            this.hanziList = (_hanziList === null ? this.hanziList : _hanziList)
                .filter((el: string, _i: number, self: any) => {
                    return self.indexOf(el) === _i;
                });

            if (index !== undefined) {
                this.i = index;
            }
        }
    }
}
