import { Vue, Component, Watch } from "vue-property-decorator";
import h from "hyperscript";
import "./vocab.scss";

@Component({
    template: h(".container.mt-3#vocab-ui", [
        h("input.form-control", {attrs: {
            "v-on:keydown.enter": "onSearchInput($event)",
            "placeholder": "Type here to search"
        }}),
        h(".row.mt-3", [
            h(".col-md-6.text-center", [
                h("input.vocab-display", {attrs: {
                    "v-on:input": "onVocabInput($event)"
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
                ]),
                h(".mt-3", [
                    h("a", {attrs: {
                        "v-if": "vocab",
                        ":href": "'https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=' + vocab",
                        "target": "_blank"
                    }}, "Open in MDBG")
                ])
            ]),
            h(".col-md-6", [
                h(".row", [
                    h("h4", "Traditional")
                ]),
                h(".row.vocab-list", [
                    h(".vocab-small-display", "{{data.traditional}}")
                ]),
                h(".row", [
                    h("h4", "Pinyin")
                ]),
                h(".row.pinyin-list", "{{data.pinyin}}"),
                h(".row", [
                    h("h4", "English")
                ]),
                h(".row.pinyin-list", "{{data.english}}"),
                h(".row", [
                    h("h4", "Sentences")
                ]),
                h(".row.sentence-list", [
                    h(".w-100", {attrs: {
                        "v-for": "s in data.sentence"
                    }}, [
                        h("span", "{{s.chinese}} "),
                        h("span", "{{s.english}}")
                    ])
                ])
            ])
        ])
    ]).outerHTML
})
export default class VocabUi extends Vue {
    private ls: string[] = [];
    private i: number = 0;
    private data = {
        simplified: "",
        traditional: "",
        pinyin: "",
        english: "",
        sentence: []
    };

    get vocab() {
        return this.ls[this.i];
    }

    private onSearchInput(evt: any) {
        // this.ls = [];
    }

    private onVocabInput(evt: any) {
        const v = evt.target.value;
        if (v > 0) {
            this.ls = [v];
            this.i = 0;
        }
    }

    @Watch("vocab")
    private fetchData() {}
}
