import { Vue, Component, Emit } from "vue-property-decorator";
import { CreateElement } from "vue";
import dbEditorState from "../shared";
import $ from "jquery";

@Component
export default class CellEditorText extends Vue {
    private canRemove = false;
    private id?: number;
    private colName?: string;
    private value: string = "";

    private config = dbEditorState.editor.text;
    private position = this.config.position;

    constructor(props: any) {
        super(props);
        this.config.show = this.show;
        this.config.hide = this.hide;
    }

    public render(m: CreateElement) {
        setTimeout(() => this.canRemove = true, 100);

        return m("div", {
            class: { "cell-editor-text": true, "can-remove": this.canRemove },
            style: {
                width: `${this.position ? this.position.width : 0}px`,
                height: `${this.position ? this.position.height : 0}px`,
                left: `${this.position ? this.position.offset.left : 0}px`,
                top: `${this.position ? this.position.offset.top : 0}px`,
                position: "absolute",
                display: this.position ? "block" : "none"
            }
        }, [
                m("textarea", {
                    ref: "textarea",
                    domProps: { value: this.value },
                    on: {
                        keyup: (e: any) => {
                            console.log(e);
                            if (e.keyCode === 13 || e.key === "Enter") {
                                if (e.shiftKey) {
                                    $(this.$refs.textarea).trigger(jQuery.Event("keydown", {
                                        keyCode: 13, // ENTER
                                        shiftKey: false
                                    }));
                                } else {
                                    this.hide();
                                }
                            } else {
                                this.value = e.target.value;
                            }
                        }
                    }
                })
            ]);
    }

    private show(id: number, colName: string, value: string, position: any) {
        if (this.position) {
            this.hide();
        }

        this.id = id;
        this.colName = colName;
        this.value = value;
        this.position = position;
        this.canRemove = false;
    }

    @Emit("hide")
    private hide() {
        if (this.id) {
            try {
                return { id: this.id, colName: this.colName, value: this.value };
            } finally {
                this.position = this.config.position = null;
                this.id = undefined;
                this.colName = undefined;
                this.$forceUpdate();
            }
        }
        return {};
    }
}
