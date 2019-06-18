import { Vue, Component } from "vue-property-decorator";
import h from "hyperscript";
import txt from "../../../asset/1000.txt";

@Component({
    template: h(".text-center.mt-3", {style: {"white-space": "nowrap"}}, [
        h("table.table.table-striped", {attrs: {
            "v-for": "seg in txt.split('\\n\\n')",
            "style": "display: inline-block; vertical-align: top; width: initial; margin-right: 1em;"
        }}, [
            h("tbody", [
                h("tr", {attrs: {
                    "v-for": "row in seg.split('\\n')"
                }}, "{{row}}")
            ])
        ])
    ]).outerHTML
})
export default class ThousandUi extends Vue {
    private txt = txt;
}
