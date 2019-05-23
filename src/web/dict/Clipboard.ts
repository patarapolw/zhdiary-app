import { CreateElement } from "vue";
import { Vue, Component } from "vue-property-decorator";
import XRegExp from "xregexp";
import { fetchJSON } from "../util";
// @ts-ignore
import pinyin from "chinese-to-pinyin";

@Component
export default class Clipboard extends Vue {
    private clipboardText: string = "";

    public render(m: CreateElement) {
        return m("div", {
            class: ["container", "mt-3"]
        }, [
            m("div", {
                class: ["col-md-6"]
            }, [
                m("textarea", {
                    class: ["parse-textarea"],
                    on: {input: (e: any) => this.clipboardText = e.target.value},
                    attrs: {placeholder: "Type or paste text to parse here..."}
                })
            ]),
            m("div", {
                class: ["col-md-6", "c-container"]
            }, [
                m(Vue.component("pre-text-segment", (resolve) => {
                    fetchJSON("/jieba/", {entry: this.clipboardText}).then((res) => {
                        const textSegments = [...res.map((el: string) => {
                            return XRegExp("\\p{Han}").test(el) ? m("ruby", [
                                m("rt", pinyin(el)),
                                el
                            ]) : el;
                        })];

                        resolve(Vue.extend({
                            render(h) {
                                return h("pre", textSegments);
                            }
                        }));
                    });
                }))
            ])
        ])
    }
}
