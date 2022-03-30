/**
 * Model for job seeker
 */

import { Schema, model } from "mongoose";
import {IJobApplication} from "./jobApplication";

export interface IJobSeeker {
    name: string, //job seeker name
    email: string, //job seeker email id
    password: string, //job seeker password
    skill: string, //skill of the job seeker
    jobSelected: IJobApplication | string, //to hold _id of job, job seeker has been selected for
}

const jobSeekerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    skill: {
        type: String,
        required: true,
    },
    jobSelected: {
        type: Schema.Types.ObjectId,
    }
});

//exporting the model
export default model<IJobSeeker>("jobSeeker", jobSeekerSchema);
