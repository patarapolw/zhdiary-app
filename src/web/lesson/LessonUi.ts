import { Vue, Component } from "vue-property-decorator";
import h from "hyperscript";
import { treeviewData } from "../shared";
import TreeviewItem from "../components/TreeviewItem";

@Component({
    components: {TreeviewItem},
    template: h(".row.stretched", [
        h(".col-3", {style: {overflow: "scroll"}}, [
            h("input.form-control.mt-3", {
                placeholder: "Type here to search",
                attrs: {
                    "v-model": "q",
                    "v-on:keyup": "onInputKeypress",
                    "spellcheck": "false",
                    "autocomplete": "off",
                    "autocorrect": "off",
                    "autocapitalize": "off"
                }
            }, "{{ q }}"),
            h(".treeview", [
                h("img.small-spinner", {attrs: {
                    "src": "Spinner-1s-200px.svg",
                    "v-if": "isLoading"
                }}),
                h("ul", [
                    h("treeview-item", {attrs: {
                        "v-for": "c in data",
                        ":key": "c.query",
                        ":data": "c",
                        ":q": "q",
                        ":parent-is-open": "true",
                        ":on-review": "onReview"
                    }})
                ])
            ])
        ]),
        h(".separate-vertical")
    ]).outerHTML
})
export default class LessonUi extends Vue {
    private isLoading = false;
    private data = treeviewData;
    private q = "";

    private onInputKeypress(evt: any) {
        if (evt.key === "Enter") {
            this.getTreeViewData();
        }
    }

    private async getTreeViewData() {
        this.isLoading = true;
        // this.data = await fetchJSON("/api/quiz/treeview", {q: this.q});
        this.isLoading = false;
    }
}
