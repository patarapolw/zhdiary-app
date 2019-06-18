import { Vue, Component, Watch } from "vue-property-decorator";
import h from "hyperscript";

interface IRubySegment {
    rt?: string;
    text: string;
}

@Component({
    template: h(".container.mt-3", [
        h(".col-md-6", [
            h("textarea.paste-area", {attrs: {
                "v-model": "q",
                "placeholder": "Type or paste text to parse here...",
                "style": `
                    resize: none;
                    width: 95%;
                    height: 300px;
                    font-size: 16spx;
                    padding: 10px;
                    border-radius: 5px;
                    border-color: #bdc3c7;`
            }})
        ]),
        h(".col-md-6", [
            h("span", {attrs: {
                "v-for": "seg in parsedQ"
            }}, [
                h("ruby", {attrs: {
                    "v-if": "seg.rt"
                }}, [
                    h("rt", "{{seg.rt}}"),
                    h("span", "{{seg.text}}")
                ]),
                h("span", {attrs: {
                    "v-else": ""
                }}, "{{seg.text}}"),
            ])
        ])
    ]).outerHTML
})
export default class ClipboardUi extends Vue {
    private q: string = "";
    private parsedQ: IRubySegment[] = [];

    @Watch("q")
    private parse() {

    }
}
