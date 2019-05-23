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
            const s = selection.toString().replace(/(<ruby>|<\/ruby>|<rt>[^<]*<\/rt>)/gi, "");

            return {
                items: {
                    speak: {
                        name: "Speak",
                        callback() {
                            const u = new SpeechSynthesisUtterance(s);
                            u.lang = "zh-CN";
                            u.rate = 0.8;
                            window.speechSynthesis.speak(u);
                        }
                    },
                    parseHanzi: {
                        name: "Parse Hanzi",
                        callback() {
                            open(`#/dict/hanzi?q=${encodeURIComponent(s)}`, "_blank");
                        }
                    },
                    parseVocab: {
                        name: "Parse vocab",
                        callback() {
                            open(`#/dict/vocab?q=${encodeURIComponent(s)}`, "_blank");
                        }
                    },
                    openInMdbg: {
                        name: "Open in MDBG",
                        callback() {
                            open(`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${s}`,
                            "_blank");
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
