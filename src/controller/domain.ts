/**
 * Controller for domain
 */

import domain, { IDomain } from "../models/domain";
import { IJob } from "../models/job";
import mongoose from "mongoose";

export default class CtrlDomain {
    /**
     * Create new job domain
     * @param body
     */
    static async create(body: any): Promise<IDomain> {
        //create domain
        return domain.create(body);
    }

    /**
     * Find all job domain
     * for job seeker
     * @param page
     * @param limit
     * @param  ord
     * @param orderBy
     */
    static async findAll(page: number, limit: number, ord: string, orderBy: string ): Promise<IJob[]> {
        // variable for sorting order
        const order = (ord == "asc") ? 1 : -1;
        //sort according to ctc
        if(orderBy === "ctc") {
            return domain.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //join jobs collection
                {
                    $lookup: {
                        from: "jobs",
                        localField: "name",
                        foreignField: "domainName",
                        as: "Jobs",
                        pipeline: [
                            {
                                $match: {
                                    //vacancy should be greater than 0
                                    vacancy: {$gt: 0}
                                }
                            },
                            {
                                //sorting
                                $sort: {
                                    ctc: order,
                                }
                            }
                        ]
                    }
                }
            ]).exec();
        }
        //sort by date
        else if(orderBy === "date") {
            return domain.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //joining jobs collection
                {
                    $lookup: {
                        from: "jobs",
                        localField: "name",
                        foreignField: "domainName",
                        as: "Jobs",
                        pipeline: [
                            {
                                $match: {
                                    //vacancy should be greater than 0
                                    vacancy: {$gt: 0}
                                }
                            },
                            {
                                //sorting
                                $sort: {
                                    dateAdded: order,
                                }
                            }
                        ]
                    }
                }
            ]).exec();
        }
        //sort by name
        else if(orderBy === "name") {
            return domain.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    //joining jobs collection
                    $lookup: {
                        from: "jobs",
                        localField: "name",
                        foreignField: "domainName",
                        as: "Jobs",
                        pipeline: [
                            {
                                $match: {
                                    //vacancy should be greater than 0
                                    vacancy: {$gt: 0}
                                }
                            },
                            {
                                //sorting
                                $sort: {
                                    name: order,
                                }
                            }
                        ]
                    }
                }
            ]).exec();
        }
    }

    /**
     * Find certain job domain
     * for job seeker
     * @param page
     * @param limit
     * @param domainName
     */
    static async findCert(page: number, limit: number, domainName: string ): Promise<IJob[]> {
        return domain.aggregate([
            {
                $match: {
                    //get domains according to domain name taken as input
                    name: domainName,
                },
            },
            //paging and limit per page
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
            },
            //joining jobs collection
            {
                $lookup: {
                    from: "jobs",
                    localField: "name",
                    foreignField: "domainName",
                    as: "Jobs",
                    pipeline: [
                        {
                            $match: {
                                //vacancy should be greater than 0
                                vacancy: {$gt: 0}
                            }
                        },
                    ]
                }
            }
        ]).exec();
    }

    /**
     * Find all job domain
     * for organisation
     * @param page
     * @param limit
     * @param ord
     * @param orderBy
     * @param orgData
     */
    static async findAllOrg(page: number, limit: number, ord: string, orderBy: string , orgData: string): Promise<IJob[]> {
        //variable for order of sorting
        const order = (ord == "asc") ? 1 : -1;
        //sort by ctc
        if(orderBy === "ctc") {
            return domain.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //join jobs collection
                {
                    $lookup: {
                        from: "jobs",
                        localField: "name",
                        foreignField: "domainName",
                        as: "Jobs",
                        pipeline: [
                            //get only authorized org's jobs
                            {
                                $match: {
                                    orgId: new mongoose.Types.ObjectId(orgData),
                                }
                            },
                            //sorting
                            {
                                $sort: {
                                    ctc: order,
                                }
                            },
                            //nested lookup
                            {
                                //joining job application for that particular job
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
                                            //joining job seekers details of that application
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
                        ]
                    }
                }
            ]).exec();
        }
        //sort by date
        else if(orderBy === "date") {
            return domain.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //joining jobs collection
                {
                    $lookup: {
                        from: "jobs",
                        localField: "name",
                        foreignField: "domainName",
                        as: "Jobs",
                        pipeline: [
                            {
                                $match: {
                                    //get only org's jobs
                                    orgId: new mongoose.Types.ObjectId(orgData),
                                }
                            },
                            //sorting
                            {
                                $sort: {
                                    dateAdded: order,
                                }
                            },
                            //nested lookup
                            {
                                //get job application for that particular job application
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
                                            //get job seeker's details for that application
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
                        ]
                    }
                }
            ]).exec();
        }
        //sort by name
        else if(orderBy === "name") {
            return domain.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //joining jobs collection
                {
                    $lookup: {
                        from: "jobs",
                        localField: "name",
                        foreignField: "domainName",
                        as: "Jobs",
                        pipeline: [
                            {
                                $match: {
                                    //get only authorized org's jobs
                                    orgId: new mongoose.Types.ObjectId(orgData),
                                }
                            },
                            //sorting
                            {
                                $sort: {
                                    name: order,
                                }
                            },
                            //nested lookup
                            {
                                $lookup: {
                                    // join job application for jobs
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
                            },
                        ]
                    }
                }
            ]).exec();
        }
    }
    /**
     * Find certain job domain
     * for job seeker
     * @param page
     * @param limit
     * @param domainName
     * @param orgData
     */
    static async findCertOrg(page: number, limit: number, domainName: string, orgData: string ): Promise<IJob[]> {
        return domain.aggregate([
            //filter by domain name
            {
                $match: {
                    name: domainName,
                },
            },
            //paging and limit per page
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
            },
            //joining jobs collection
            {
                $lookup: {
                    from: "jobs",
                    localField: "name",
                    foreignField: "domainName",
                    as: "Jobs",
                    pipeline: [
                        //match only org's job
                        {
                            $match: {
                                orgId: new mongoose.Types.ObjectId(orgData),
                            },
                        },
                        //nested lookup
                        {
                            //get application for job
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
                    ]
                },
            },
        ]).exec();
    }
}
