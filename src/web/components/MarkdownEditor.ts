// @ts-ignore
import SimpleMde from "vue-simplemde/src/markdown-editor";
import { Vue, Component, Prop } from "vue-property-decorator";
import h from "hyperscript";
import { quizDataToContent, ankiMustache } from "../util";
import "./markdown-editor.scss";

@Component({
    components: {SimpleMde},
    template: h(".w-100", [
        h("simple-mde", {attrs: {
            "ref": "mde",
            ":class": "required ? 'form-required' : 'form-not-required'",
            "v-model": "value",
            ":configs": "mdeConfig"
        }}),
        h("input.form-control.flatten", {attrs: {
            ":required": "required",
            ":value": "value"
        }}),
        h(".invalid-feedback", "{{ invalidFeedback || '' }}")
    ]).outerHTML
})
export default class MarkdownEditor extends Vue {
    @Prop() required?: boolean;
    @Prop() value: string = "";
    @Prop() invalidFeedback?: string;
    @Prop() data: any;

    private mdeConfig: SimpleMDE.Options = {
        spellChecker: false,
        status: false,
        previewRender: (md: string) => {
            return quizDataToContent(this.data, null, ankiMustache(md, this.data));
        }
    };
}
