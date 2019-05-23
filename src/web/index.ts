import Vue from "vue";
import VueRouter from "vue-router";
import Counter from "./DbEditor/component/Counter";
import SearchBar from "./DbEditor/component/SearchBar";
import "./index.scss";
import Quiz from "./Quiz/Quiz";
import BootstrapVue from "bootstrap-vue";
import "bootstrap";
import CardEditor from "./DbEditor/CardEditor";
import ImportExport from "./ImportExport";
import Clipboard from "./dict/Clipboard";
import Hanzi from "./dict/Hanzi";
import Vocab from "./dict/Vocab";
import "./contextmenu";
import Thousand from "./res/Thousand";

Vue.use(VueRouter);
Vue.use(BootstrapVue);

const router = new VueRouter({
    routes: [
        {name: "default", path: "/", component: Quiz},
        {name: "quiz", path: "/quiz", component: Quiz},
        {name: "cardEditor", path: "/editor", component: CardEditor},
        {name: "importExport", path: "/importExport", component: ImportExport},
        {name: "clipboard", path: "/clipboard", component: Clipboard},
        {name: "dictHanzi", path: "/dict/hanzi", component: Hanzi},
        {name: "dictVocab", path: "/dict/vocab", component: Vocab},
        {name: "thousand", path: "/res/thousand", component: Thousand}
    ]
});

const app = new Vue({
    router,
    components: {Counter, SearchBar},
    render(m) {
        return m("div", {class: ["h-100"]}, [
            m("nav", {
                class: ["navbar", "navbar-expand-lg", "navbar-light", "bg-light"]
            }, [
                m("a", {
                    class: ["navbar-brand"],
                    domProps: {href: "#"}
                }, "中文 Diary"),
                m("button", {
                    class: ["navbar-toggler"],
                    attrs: {
                        "data-target": "#navbarSupportedContent",
                        "data-toggle": "collapse",
                        "type": "button"
                    }
                }, [
                    m("span", {class: "navbar-toggler-icon"})
                ]),
                m("div", {
                    class: ["collapse", "navbar-collapse"],
                    attrs: {id: "navbarSupportedContent"}
                }, [
                    m("ul", {
                        class: ["navbar-nav", "mr-auto"]
                    }, [
                        m("li", {
                            class: ["nav-item", this.$route.path === "/quiz" ? "active" : ""]
                        }, [
                            m("router-link", {
                                class: ["nav-link"],
                                props: {to: "/quiz"}
                            }, "Quiz")
                        ]),
                        m("li", {
                            class: ["nav-item", this.$route.path === "/editor" ? "active" : ""]
                        }, [
                            m("router-link", {
                                class: ["nav-link"],
                                props: {to: "/editor"}
                            }, "Editor")
                        ]),
                        m("li", {
                            class: ["nav-item", "dropdown"]
                        }, [
                            m("a", {
                                class: ["nav-link", "dropdown-toggle"],
                                attrs: {"id": "navbarDropdown", "role": "button", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false"},
                                domProps: {href: "#"}
                            }, "Dictionaries"),
                            m("div", {
                                class: ["dropdown-menu"],
                                attrs: {"aria-labelledby": "navbarDropdown"}
                            }, [
                                m("router-link", {
                                    class: ["dropdown-item"],
                                    props: {to: "/clipboard"}
                                }, "Clipboard parser"),
                                m("router-link", {
                                    class: ["dropdown-item"],
                                    props: {to: "/dict/hanzi"}
                                }, "Hanzi"),
                                m("router-link", {
                                    class: ["dropdown-item"],
                                    props: {to: "/dict/vocab"}
                                }, "Vocab")
                            ])
                        ]),
                        m("li", {
                            class: ["nav-item", "dropdown"]
                        }, [
                            m("a", {
                                class: ["nav-link", "dropdown-toggle"],
                                attrs: {"id": "navbarDropdownResource", "role": "button", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false"},
                                domProps: {href: "#"}
                            }, "Resources"),
                            m("div", {
                                class: ["dropdown-menu"],
                                attrs: {"aria-labelledby": "navbarDropdownResource"}
                            }, [
                                m("router-link", {
                                    class: ["dropdown-item"],
                                    props: {to: "/res/thousand"}
                                }, "千字文"),
                                m("router-link", {
                                    class: ["dropdown-item"],
                                    props: {to: "/res/category"}
                                }, "Categories")
                            ])
                        ]),
                        m("li", {
                            class: ["nav-item"]
                        }, [
                            m("a", {
                                class: ["nav-link"],
                                domProps: {href: "https://github.com/patarapolw/zhdiary-app"},
                                attrs: {target: "_blank"}
                            }, "About")
                        ]),
                        m(Counter)
                    ]),
                    m("ul", {
                        class: ["navbar-nav"]
                    }, [
                        m(SearchBar)
                    ])
                ])
            ]),
            m("router-view")
        ]);
    }
}).$mount("#App");
