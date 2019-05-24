import $ from "jquery";
import "jquery-contextmenu";
import "jquery-contextmenu/dist/jquery.contextMenu.css";
import XRegExp from "xregexp";
import { openNewWindow } from "./util";

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
                            openNewWindow(`#/dict/hanzi?q=${encodeURIComponent(s)}`);
                        }
                    },
                    parseVocab: {
                        name: "Parse vocab",
                        callback() {
                            openNewWindow(`#/dict/vocab?q=${encodeURIComponent(s)}`);
                        }
                    },
                    openInMdbg: {
                        name: "Open in MDBG",
                        callback() {
                            openNewWindow(`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${s}`);
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
