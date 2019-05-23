import { CreateElement } from "vue";
import { Vue, Component } from "vue-property-decorator";
import tText from "./1000.txt";

@Component
export default class Thousand extends Vue {
    public render(m: CreateElement) {
        return m("div", {
            class: ["container"]
        }, [
            m("table", {
                class: ["table", "table-striped", "c-container"]
            }, [
                m("tbody", tText.split("\n").map((r) => {
                    return m("tr", r);
                }))
            ])
        ])
    }
}
