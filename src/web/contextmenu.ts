import $ from "jquery";
import "jquery-contextmenu";
import "jquery-contextmenu/dist/jquery.contextMenu.css";
import XRegExp from "xregexp";

// @ts-ignore
$.contextMenu({
    selector: ".tree-text",
    items: {
        rename: {
            name: "Rename",
            callback(key: any, opt: any) {
                const item = opt.$trigger.data();
                console.log(item);
            }
        },
        export: {
            name: "Export",
            callback(key: any, opt: any) {
                const item = opt.$trigger.data();
                console.log(item);
            }
        },
        delete: {
            name: "Delete Deck",
            callback(key: any, opt: any) {
                const item = opt.$trigger.data();
                if (confirm("Are you sure you want to delete?")) {
                    item.delete();
                }
            }
        }
    }
});

// @ts-ignore
$.contextMenu({
    selector: ".c-container",
    build($trigger: any, e: MouseEvent) {
        const selection = window.getSelection();

        if (selection && XRegExp("\\p{Han}").test(selection.toString())) {
            return {
                items: {
                    speak: {
                        name: "Speak",
                        callback() {
                            const u = new SpeechSynthesisUtterance(selection.toString());
                            u.lang = "zh-CN";
                            u.rate = 0.8;
                            window.speechSynthesis.speak(u);
                        }
                    }
                }
            }
        } else {
            $(".warning-tooltip").css({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            });
            // @ts-ignore
            $(`.warning-tooltip`).tooltip("show");

            setTimeout(() => {
                $(".warning-tooltip").css({
                    left: 0,
                    top: 0
                });
                // @ts-ignore
                // $(`.warning-tooltip`).tooltip("hide");
            }, 2000);
        }

        return false;
    }
});
