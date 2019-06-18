import { Vue, Component, Watch } from "vue-property-decorator";
import h from "hyperscript";
import XRegExp from "xregexp";
import "./hanzi.scss";

@Component({
    template: h(".container.mt-3#hanzi-ui", [
        h("input.form-control", {attrs: {
            "v-on:keydown.enter": "onSearchInput($event)",
            "placeholder": "Type here to search"
        }}),
        h(".row.mt-3", [
            h(".col-md-6.text-center", [
                h("input.hanzi-display", {attrs: {
                    ":value": "hanzi",
                    "v-on:input": "onHanziInput($event)"
                }}),
                h(".btn-prev-next", [
                    h(".btn-group.col-auto", [
                        h("button.btn.btn-info", {attrs: {
                            ":disabled": "!(i > 0)",
                            "v-on:click.native": "i--"
                        }}, "Previous"),
                        h("button.btn.btn-info", {attrs: {
                            ":disabled": "!(i < ls.length - 1)",
                            "v-on:click.native": "i++"
                        }}, "Next")
                    ])
                ])
            ]),
            h(".col-md-6", [
                h(".row", [
                    h("h4", "Subcompositions")
                ]),
                h(".row.hanzi-list", [
                    h(".c-block", {attrs: {
                        "v-for": "c in data.sub"
                    }}, [
                        h(".c-block-base", {attrs: {
                            "v-on:mouseenter": "cHover = c"
                        }}, "{{c}}"),
                        h(".c-block-hover", {attrs: {
                            "v-if": "cHover === c",
                            "v-on:click": "ls = c; i = 0",
                            "v-on:mouseout": "cHover = null"
                        }}, "{{c}}")
                    ])
                ]),
                h(".row", [
                    h("h4", "Supercompositions")
                ]),
                h(".row.hanzi-list", [
                    h(".c-block", {attrs: {
                        "v-for": "c in data.sup"
                    }}, [
                        h(".c-block-base", {attrs: {
                            "v-on:mouseenter": "cHover = c"
                        }}, "{{c}}"),
                        h(".c-block-hover", {attrs: {
                            "v-if": "cHover === c",
                            "v-on:click": "ls = c; i = 0",
                            "v-on:mouseout": "cHover = null"
                        }}, "{{c}}")
                    ])
                ]),
                h(".row", [
                    h("h4", "Variants")
                ]),
                h(".row.hanzi-list", [
                    h(".c-block", {attrs: {
                        "v-for": "c in data.var"
                    }}, [
                        h(".c-block-base", {attrs: {
                            "v-on:mouseenter": "cHover = c"
                        }}, "{{c}}"),
                        h(".c-block-hover", {attrs: {
                            "v-if": "cHover === c",
                            "v-on:click": "ls = c; i = 0",
                            "v-on:mouseout": "cHover = null"
                        }}, "{{c}}")
                    ])
                ]),
                h(".row", [
                    h("h4", "Vocabularies")
                ]),
                h(".row.vocab-list", [
                    h(".w-100", {attrs: {
                        "v-for": "v in data.vocab"
                    }}, [
                        h("span", "{{v.simplified}} "),
                        h("span", {attrs: {
                            "v-if": "v.traditional"
                        }}, "{{v.traditional}} "),
                        h("span", "[{{v.pinyin}}] "),
                        h("span", "{{v.english}}")
                    ])
                ]),
            ])
        ])
    ]).outerHTML
})
export default class HanziUi extends Vue {
    private ls: string = "";
    private i: number = 0;
    private data = {
        sup: [],
        sub: [],
        var: [],
        vocab: []
    };

    get hanzi() {
        return this.ls[this.i];
    }

    private onSearchInput(evt: any) {
        this.ls = XRegExp.replace(evt.target.value, XRegExp("[^\\p{Han}]", "g"), "");
    }

    private onHanziInput(evt: any) {
        const v = XRegExp.replace(evt.target.value, XRegExp("[^\\p{Han}]", "g"), "");
        if (v.length > 0) {
            this.ls = v[v.length - 1];
            this.i = 0;
        }
    }

    @Watch("hanzi")
    private fetchData() {
        // console.log(this.hanzi);
    }
}
