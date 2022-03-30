/**
 * Controller for job applications
 */

import jobApplication, {IJobApplication} from "../models/jobApplication";
import jobSeeker from "../models/jobSeeker";
import mongoose from "mongoose";
import job from "../models/job";

export default class CtrlJobApplication {

    /**
     * Create a job application
     * by the job seeker
     * @param body
     */
    static async create(body: any): Promise<IJobApplication> {
        // job seeker data according to current session's job seeker id
        const jobSeekerData =  await jobSeeker.findOne({_id: new mongoose.Types.ObjectId(body.jobSeekerId)}).lean();
        // job data from given job id
        const jobData = await job.findOne({_id:body.jobId}, {vacancy: 1})
        //if job vacancy greater than 0
        if(jobData.vacancy > 0){
            //if job seeker is not already selected
            if(!jobSeekerData.jobSelected) {
                //create job application
                return jobApplication.create(body);
            }
            //if job seeker's already selected
            else {
                throw new Error("Already Selected")
            }
        }
        //if vacancy = 0
        else{
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
        const jobApplicationData = await jobApplication.findOne({_id: new mongoose.Types.ObjectId(jobApplicationId) });
        //get job seeker id
        const jobSeekerIdData = jobApplicationData.jobSeekerId;
        //get job id
        const jobIdData = jobApplicationData.jobId;
        //get job seeker details
        const jobSeekerData = await jobSeeker.findOne(
            {_id: jobSeekerIdData},
        )
        //if job seeker's not already selected
        if(!jobSeekerData.jobSelected){
            //update to reflect job seeker has been selected
            await jobSeeker.findOneAndUpdate(
                {_id: jobSeekerIdData},
                {jobSelected: jobIdData}
            )
            //update to decrease vacancy by 1
            await job.findOneAndUpdate(
                {_id: jobIdData},
                {$inc: {vacancy: -1}}
            );
            //delete job application from database
            await jobApplication.findOne({_id: new mongoose.Types.ObjectId(jobApplicationId) }).remove()
            //return success
            return "The applicant is selected!"
        }
        //if job seeker is already selected
        else{
            throw new Error("Applicant has already been selected")
        }
    }
}
