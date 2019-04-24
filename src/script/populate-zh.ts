import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import ZhLokiDb from "../backend/db/zh";
dotenv.config();

export const mongoClient = new MongoClient(process.env.MONGO_URI!, { useNewUrlParser: true });

(async () => {
    await mongoClient.connect();
    const localDb = await ZhLokiDb.connect("public/zh.loki");

    const onlineDb = mongoClient.db("data");
    localDb.sentence.insert(await onlineDb.collection("sentence").find().project({_id: 0}).toArray());

    localDb.token.insert(await onlineDb.collection("token").find().project({_id: 0}).toArray());

    localDb.vocab.insert(await onlineDb.collection("vocab").find().project({_id: 0}).toArray());

    localDb.close();
    mongoClient.close();
})();
