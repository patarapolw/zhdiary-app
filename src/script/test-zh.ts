import ZhDb from "../server/zhdb";

(async () => {
    const zh = await ZhDb.connect();

    console.log(zh.vocab!.find());

    zh.close();
})();
