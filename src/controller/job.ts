/**
 * Controller for job
 */

import job, {IJob} from "../models/job";
import moment from "moment";
import mongoose from "mongoose";
import domain from "../models/domain";

export default class CtrlJob {
    /**
     * Create new job posting
     * @param body
     */
    static async create(body: any): Promise<any> {
        //variable to check if domain exists
        const data = await domain.findOne({name: body.domainName});
        //if domain exist
        if(data){
            const data2 = {
                ...body,
                dateAdded: moment().utcOffset(0, true).toISOString(),
            }
            //create job
            return job.create(data2);
        }
        //if domain doesn't exist
        else{
            throw new Error("Domain doesn't exist")
        }
    }

    /**
     * Find all job posting
     * for job seeker
     * @param page
     * @param limit
     * @param ord
     * @param orderBy
     */
    static async findAll(page: number, limit: number, ord: string, orderBy: string ): Promise<IJob[]> {
        //variable for sorting order
        const order = (ord == "asc") ? 1 : -1;
        //sort by ctc
        if(orderBy === "ctc") {
            return job.aggregate([
                {
                    $match: {
                        //vacancy should be greater than 0
                        vacancy: {$gt: 0}
                    }
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //sorting
                {
                    $sort: {
                        ctc: order,
                    }
                },
            ]).exec();
        }
        //sort by date
        else if(orderBy === "date") {
            return job.aggregate([
                {
                    $match: {
                        //vacancy should be greater than 0
                        vacancy: {$gt: 0}
                    }
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //sorting
                {
                    $sort: {
                        dateAdded: order,
                    }
                }
            ]).exec();
        }
        //sort by name
        else if(orderBy === "name") {
            return job.aggregate([
                {
                    $match: {
                        //vacancy should be greater than 0
                        vacancy: {$gt: 0}
                    }
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //sorting
                {
                    $sort: {
                        name: order,
                    }
                }
            ]).exec();
        }
    }

    /**
     * Find certain job postings
     * for job seeker
     * @param page
     * @param limit
     * @param filterBy
     * @param filter
     */
    static async findCert(page: number, limit: number, filterBy: string, filter: number ): Promise<IJob[]> {
        //variable to get date 7 days before current date
        const recent = moment().subtract(7, "days").utcOffset(0, true).toISOString();
        //filter by recently added
        if(filterBy === "recent") {
            return job.aggregate([
                {
                    $match: {
                        //should be added within 7 days
                        dateAdded: { $gte: recent },
                        //vacancy should greater than 0
                        vacancy: {$gt: 0}
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
            ]).exec();
        }
        //filter by vacancy
        else if(filterBy === "vacancy") {
            return job.aggregate([
                {
                    $match: {
                        //match vacancy
                        vacancy: filter,
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
            ]).exec();
        }
        //filter by ctc
        else if(filterBy === "ctc") {
            return job.aggregate([
                {
                    $match: {
                        //match ctc
                        ctc: filter,
                        //vacancy should be greater than 0
                        vacancy: {$gt: 0}
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
            ]).exec();
        }
    }

    /**
     * Find all job posting
     * for organisation
     * @param page
     * @param limit
     * @param ord
     * @param orderBy
     * @param orgData
     */
    static async findAllOrg(page: number, limit: number, ord: string, orderBy: string , orgData: string): Promise<IJob[]> {
        // variable for order of sorting
        const order = (ord == "dsc") ? -1 : 1;
        //sort by ctc
        if(orderBy === "ctc") {
            return job.aggregate([
                {
                    //show only current org's jobs
                    $match: {
                        orgId: new mongoose.Types.ObjectId(orgData),
                    }
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //sorting
                {
                    $sort: {
                        ctc: order,
                    }
                },
                //join jobapplications collections
                {
                    $lookup: {
                        from: "jobapplications",
                        localField: "_id",
                        foreignField: "jobId",
                        as: "Application",
                        pipeline: [
                            {
                                $match: {
                                    selected: false,
                                }
                            },
                            //job seeker's details
                            {
                                $lookup: {
                                    from: "jobseekers",
                                    localField: "jobSeekerId",
                                    foreignField: "_id",
                                    as: "Applicant",
                                }
                            }
                        ]
                    },
                },
            ]).exec();
        }
        //order by date
        else if(orderBy === "date") {
            return job.aggregate([
                {
                    $match: {
                        //show only current org's jobs
                        orgId: new mongoose.Types.ObjectId(orgData)
                    }
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //sorting
                {
                    $sort: {
                        dateAdded: order,
                    }
                },
                //joining jobapplication collection
                {
                    $lookup: {
                        from: "jobapplications",
                        localField: "_id",
                        foreignField: "jobId",
                        as: "Application",
                        pipeline: [
                            {
                                $match: {
                                    selected: false,
                                }
                            },
                            //nested lookup
                            {
                                //job seeker's details
                                $lookup: {
                                    from: "jobseekers",
                                    localField: "jobSeekerId",
                                    foreignField: "_id",
                                    as: "Applicant",
                                }
                            }
                        ]
                    }
                }
            ]).exec();
        }
        //sorting by name
        else if(orderBy === "name") {
            return job.aggregate([
                {
                    $match: {
                        //show only current org's data
                        orgId: new mongoose.Types.ObjectId(orgData),
                    }
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //sorting
                {
                    $sort: {
                        name: order,
                    }
                },
                //joining jobapplication collection
                {
                    $lookup: {
                        from: "jobapplications",
                        localField: "_id",
                        foreignField: "jobId",
                        as: "Application",
                        pipeline: [
                            {
                                $match: {
                                    selected: false,
                                }
                            },
                            //getting job seeker's details
                            {
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

    /**
     * Find certain job postings
     * for organisation
     * @param page
     * @param limit
     * @param filterBy
     * @param filter
     * @param orgData
     */
    static async findCertOrg(page: number, limit: number, filterBy: string, filter: number, orgData: string ): Promise<IJob[]> {
        //variable to store date 7 days before current date
        const recent = moment().subtract(7, "days").utcOffset(0, true).toISOString();
        //filter only recently added jobs
        if(filterBy === "recent") {
            return job.aggregate([
                {
                    $match: {
                        //job should be added within 7 days
                        dateAdded: { $gte: recent },
                        //show only current org's jobs
                        orgId: new mongoose.Types.ObjectId(orgData),
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
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
                                    selected: false,
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
        //filter by vacancy
        else if(filterBy === "vacancy") {
            return job.aggregate([
                {
                    $match: {
                        //should be equal to entered vacancy
                        vacancy: filter,
                        //show only current org's jobs
                        orgId: new mongoose.Types.ObjectId(orgData),
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //joining jobapplication collection
                {
                    $lookup: {
                        from: "jobapplications",
                        localField: "_id",
                        foreignField: "jobId",
                        as: "Application",
                        pipeline: [
                            {
                                $match: {
                                    selected: false,
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
        //filter by ctc
        else if(filterBy === "ctc") {
            return job.aggregate([
                {
                    $match: {
                        //match ctc giver as input
                        ctc: filter,
                        //show only current org's jobs
                        orgId: new mongoose.Types.ObjectId(orgData),
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
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
                                    selected: false,
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
}
