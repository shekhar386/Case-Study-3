/**
 * Model for job
 */

import { Schema, model } from "mongoose";
import {IOrg} from "./organisation";

export interface IJob {
    name: string, //job name
    orgId: IOrg | string, //organisation's _id
    domainName: string, //domain name
    skillReq: string, //skills required
    dateAdded: string, //date job was added
    ctc: number, //salary for the job
    vacancy: number, //amount of seats left
}

const jobSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    orgId: {
        type: Schema.Types.ObjectId,
        ref: "org",
        required: true,
    },
    domainName: {
        type: String,
        required: true,
    },
    skillReq: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: String,
    },
    ctc: {
        type: Number,
        required: true,
    },
    vacancy: {
        type: Number,
        required: true,
    },
})

//exporting the job
export default model<IJob>("job", jobSchema);
