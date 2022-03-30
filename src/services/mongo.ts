/**
 * @info starting the mongodb
 */
// @ts-ignore
import mongoose from "mongoose";


export default class Mongo {
    /**
     * connect directly to mongodb
     */
    static async connect(): Promise<boolean> {
        await mongoose.connect(process.env.MONGO_URL, {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
        });
        console.log("Connected to MongoDb");
        return true;
    }
}
