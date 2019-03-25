import $ from "jquery";

$(() => {
    $(document.body).on("click", ".zh-speak", (e) => {
        const utterance = new SpeechSynthesisUtterance($(e.target).text());
        utterance.lang = "zh-CN";
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    });
});
