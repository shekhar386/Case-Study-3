/**
 * Main file to start the server and connect to the database
 */

import "dotenv/config";
import Mongo from "./services/mongo";
import Server from "./services/server";

(async () => {
    try {
        await Mongo.connect();
        await new Server().start();
    } catch (e) {
        console.log("mongo or services error")
        process.exit();
    }
})();
