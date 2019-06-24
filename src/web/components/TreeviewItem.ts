import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import h from "hyperscript";
import $ from "jquery";
import { normalizeArray } from "../util";

interface ITreeViewStat {
    new: number;
    leech: number;
    due: number;
}

export interface ITreeViewItem {
    name: string;
    query: string;
    isOpen?: boolean;
    children?: ITreeViewItem[];
    stat?: ITreeViewStat;
}

@Component({
    name: "treeview-item",
    template: h("li", [
        h("span", [
            h(".caret", {attrs: {
                "v-on:click": "onCaretClicked"
            }}, [
                h("i.fas.fa-chevron-down", {attrs: {
                    "v-if": "data.children && isOpen"
                }}),
                h("i.fas.fa-chevron-right", {attrs: {
                    "v-if": "data.children && !isOpen"
                }})
            ]),
            h("span.tree-text", {attrs: {
                "ref": "tree-text",
                "v-on:click": "startReview"
            }}, "{{ data.name }}"),
            h(".float-right.text-align-right.tree-score", {attrs: {
                "v-if": "isShownStat && data.stat"
            }}, [
                h("span.tree-new", "{{ data.stat.new.toLocaleString() }}"),
                h("span.tree-leech", "{{ data.stat.leech.toLocaleString() }}"),
                h("span.tree-due", "{{ data.stat.due.toLocaleString() }}")
            ])
        ]),
        h("ul", {attrs: {
            "v-if": "data.children && isOpen"
        }}, [
            h("treeview-item", {attrs: {
                "v-for": "c in data.children",
                ":key": "c.query",
                ":data": "c",
                ":q": "[q, data.query].join(' ')",
                ":parent-is-open": "isOpen"
            }})
        ])
    ]).outerHTML
})
export default class TreeviewItem extends Vue {
    @Prop() private data!: ITreeViewItem;
    @Prop() private q!: string;
    @Prop() private parentIsOpen!: boolean;
    @Prop() private onReview!: (query: string, type?: string) => any;
    
    private isOpen = true;
    private isShownStat = true;

    constructor(props: any) {
        super(props)
        this.isOpen = this.data.isOpen !== undefined ? this.data.isOpen : this.isOpen;
    }

    public mounted() {
        $(normalizeArray(this.$refs["tree-text"])).data({
            dueAndNew: () => this.startReview(),
            due: () => this.startReview("due"),
            leech: () => this.startReview("leech"),
            new: () => this.startReview("new"),
            all: () => this.startReview("all")
        });
        this.updateStat();
    }

    private async startReview(type?: string) {
        await this.onReview(this.data.query, type);
        this.updateStat();
    }

    @Watch("q")
    @Watch("isOpen")
    private updateStat() {
        if (!this.data.children || (this.parentIsOpen && !this.isOpen)) {
            this.isShownStat = true;
        } else {
            this.isShownStat = false;
        }
    }

    private onCaretClicked() {
        this.isOpen = !this.isOpen;
    }
}
