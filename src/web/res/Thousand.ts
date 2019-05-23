import { CreateElement } from "vue";
import { Vue, Component } from "vue-property-decorator";
import tText from "./1000.txt";

@Component
export default class Thousand extends Vue {
    public render(m: CreateElement) {
        return m("div", {
            class: ["container", "c-container"]
        }, [
            m("div", {
                style: {whiteSpace: "nowrap"}
            }, tText.split("\n\n").map((seg) => {
                return m("table", {
                    class: ["table", "table-striped"],
                    style: {
                        display: "inline-block",
                        verticalAlign: "top",
                        width: "initial",
                        marginRight: "1em"
                    }
                }, [
                    m("tbody", seg.split("\n").map((r) => {
                        return m("tr", r);
                    }))
                ])
            }))
        ])
    }
}
