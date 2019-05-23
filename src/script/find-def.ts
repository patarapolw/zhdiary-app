import ZhLokiDb from "../backend/db/zh";

const vList = `
动词，咬耳朵，跳，害怕，变成，担心，生气，投，掷，扔，抛，请求，卖，希望，结束，抓，拿，责骂，回答，睡醒，起晚，踢，生产，睡觉，睡午觉，侧睡，蹲，无聊，抱，小便，换，打开，遇见，讲，输，举手，微笑，站，借，等，哭，泪流满面，哽咽，啜泣，通知，急，摔倒，跌倒，洗，辛苦，照看，请客，照顾，宽慰，宽心，颤抖，休息，大声笑，出汗，累，呕吐，压，推，读，害羞，住，大便
`.trim().split("，");

(async () => {
    const zh = await ZhLokiDb.connect("public/zh.loki");
    const def = zh.vocab.find({$or: [
        {simplified: {$in: vList}},
        {traditional: {$in: vList}}
    ]});

    for (const d of def) {
        console.log(`- ${d.simplified} ${d.traditional ? `${d.traditional} ` : ""}\\[${d.pinyin}\\] ${d.english}`)
    }

    zh.close();
})();
