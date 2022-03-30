/**
 * Controller for job applications
 */

import jobApplication, {IJobApplication} from "../models/jobApplication";
import jobSeeker from "../models/jobSeeker";
import mongoose from "mongoose";
import job, {IJob} from "../models/job";
import moment from "moment";

export default class CtrlJobApplication {

    /**
     * Create a job application
     * by the job seeker
     * @param body
     */
    static async create(body: any): Promise<IJobApplication> {
        // job seeker data according to current session's job seeker id
        const jobSeekerData = await jobSeeker.findOne({_id: new mongoose.Types.ObjectId(body.jobSeekerId)}).lean();
        // job data from given job id
        const jobData = await job.findOne({_id: body.jobId}, {vacancy: 1})
        //if job vacancy greater than 0
        if (jobData.vacancy > 0) {
            //if job seeker is not already selected
            if (!jobSeekerData.jobSelected) {
                //create job application
                return jobApplication.create(body);
            }
            //if job seeker's already selected
            else {
                throw new Error("Already Selected")
            }
        }
        //if vacancy = 0
        else {
            throw new Error("No vacancies left")
        }
    }

    /**
     * Select a job application
     * by the organisation
     * @param jobApplicationId
     */
    static async select(jobApplicationId: string): Promise<any> {
        //job application data according to job application id given
        const jobApplicationData = await jobApplication.findOne({_id: new mongoose.Types.ObjectId(jobApplicationId)});
        //get job seeker id
        const jobSeekerIdData = jobApplicationData.jobSeekerId;
        //get job id
        const jobIdData = jobApplicationData.jobId;
        //get job seeker details
        const jobSeekerData = await jobSeeker.findOne(
            {_id: jobSeekerIdData},
        )
        //if job seeker's not already selected
        if (!jobSeekerData.jobSelected) {
            //update to reflect job seeker has been selected
            await jobSeeker.findOneAndUpdate(
                {_id: jobSeekerIdData},
                {jobSelected: jobIdData}
            );
            //update to decrease vacancy by 1
            await job.findOneAndUpdate(
                {_id: jobIdData},
                {$inc: {vacancy: -1}}
            );
            //update to set job application selected status as true
            await jobApplication.findOneAndUpdate(
                {_id: new mongoose.Types.ObjectId(jobApplicationId)},
                {selected: true}
            )
            //return success
            return "The applicant is selected!"
        }
        //if job seeker is already selected
        else {
            throw new Error("Applicant has already been selected")
        }
    }

    /**
     * Find selected applications for jobs
     * for organisation
     * @param orgData
     */
    static async findJobApplicationsSelect(orgData: string): Promise<IJob[]> {
        return job.aggregate([
            {
                $match: {
                    //show only current org's jobs
                    orgId: new mongoose.Types.ObjectId(orgData),
                },
            },
            //join jobapplications collection
            {
                $lookup: {
                    from: "jobapplications",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "Application",
                    pipeline: [
                        {
                            $match: {
                                selected: true,
                            }
                        },
                        //nested lookup
                        {
                            //get job seeker's details
                            $lookup: {
                                from: "jobseekers",
                                localField: "jobSeekerId",
                                foreignField: "_id",
                                as: "Applicant",
                            }
                        }
                    ]
                }
            },
        ]).exec();
    }
}
