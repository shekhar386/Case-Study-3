/**
 * Controller for job seeker
 */

import Bcrypt from "../services/bcrypt";
import jobSeeker, {IJobSeeker} from "../models/jobSeeker";
import mongoose from "mongoose";

export default class CtrlJobSeeker {

    /**
     * Create new job seeker
     * @param body
     */
    static async create(body: any): Promise<IJobSeeker> {
        //hashing the password
        const hash = await Bcrypt.hashing(body.password);
        //replacing password with hashed password
        const data = {
            ...body,
            password: hash,
        };
        //create jobSeeker
        return jobSeeker.create(data);
    }

    /**
     * Authorize new job seeker
     * @param email
     * @param password
     */
    static async auth(email: string, password: string): Promise<IJobSeeker> {
        // fetch user from database
        const jobSeekerData = await jobSeeker.findOne({ email }).lean();
        // if users exists or not
        if (jobSeekerData) {
            // verify the password
            const result = await Bcrypt.comparing(password, jobSeekerData.password);
            // if password is correct or not
            // if correct, return the user
            if (result){
                return jobSeekerData;
            }
            // throw error
            else{
                throw new Error("password doesn't match");
            }
        }
        // throw error
        else{
            throw new Error("user doesn't exists");
        }
    }

    /**
     * Return the job seeker's application (profile)
     * @param jobSeekerData
     */
    static async findJobApplication(jobSeekerData: string): Promise<any> {
        //get job seeker details from session id of job seeker
        const cond = await jobSeeker.findOne({_id: new mongoose.Types.ObjectId(jobSeekerData)}).lean();
        //if job seeker is not selected show jobs applied for
        if(!cond.jobSelected) {
            //show result
            return await jobSeeker.aggregate([
                {
                    $match: {
                        //show only session job seeker
                        _id: new mongoose.Types.ObjectId(jobSeekerData),
                    },
                },
                {
                    //get all job applications of the job seeker
                    $lookup: {
                        from: "jobapplications",
                        localField: "_id",
                        foreignField: "jobSeekerId",
                        as: "Job Applications",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "jobs",
                                    localField: "jobId",
                                    foreignField: "_id",
                                    as: "job Details",
                                }
                            }
                        ]
                    },
                },
            ]).exec();
        }
        //if job seeker is selected then show only job that selected for
        else {
            //show result
            return await jobSeeker.aggregate([
                {
                    //match by session
                    $match: {
                        _id: new mongoose.Types.ObjectId(jobSeekerData),
                    },
                },
                //join jobs collection for details of job, job seeker is selected in
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobSelected",
                        foreignField: "_id",
                        as: "Selected in",
                    },
                },
            ]).exec();
        }

    }
}
