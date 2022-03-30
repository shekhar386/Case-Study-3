/**
 * Model for job application
 */

import { Schema, model } from "mongoose";
import {IJob} from "./job";
import {IJobSeeker} from "./jobSeeker";

export interface IJobApplication {
    jobId: IJob | string, //job _id
    jobSeekerId: IJobSeeker | string, //job seeker _id
}

const jobApplicationSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: "job",
        required: true,
    },
    jobSeekerId: {
        type: Schema.Types.ObjectId,
        ref: "jobSeeker",
        required: true,
    },
})

//exporting the model
export default model<IJobApplication>("jobApplication", jobApplicationSchema);
