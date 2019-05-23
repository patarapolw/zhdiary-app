import { CreateElement } from "vue";
import { Vue, Component } from "vue-property-decorator";
import { md2html } from "../util";

@Component({
    beforeRouteUpdate(to, from, next) {
        fetch(`/md/${to.params.category}.md`).then((r) => r.text()).then((r) => {
            // @ts-ignore
            this.md = r;
            next();
        });
    }
})
export default class Resource extends Vue {
    private md: string = "";

    public render(m: CreateElement) {
        return m("div", {
            class: ["container", "c-container"]
        }, [
            m("div", {
                domProps: {innerHTML: md2html(this.md)}
            })
        ])
    }

    public mounted() {
        fetch(`/md/${this.$route.params.category}.md`).then((r) => r.text()).then((r) => {
            // @ts-ignore
            this.md = r;
        });
    }
}
