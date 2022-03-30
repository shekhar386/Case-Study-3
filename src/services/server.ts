/**
 * Main file with all the app services
 */

import express, {Request} from "express";
import bodyParser from "body-parser";
import Joi from "joi";
import session from "express-session";
import MongoStore from "connect-mongo";
import expressResponse from "../middleware/expressResponse";
import CtrlJobSeeker from "../controller/jobSeeker";
import CtrlAdmin from "../controller/admin";
import CtrlOrg from "../controller/organisation";
import CtrlJob from "../controller/job";
import CtrlDomain from "../controller/domain";
import CtrlJobApplication from "../controller/jobapplication";

/**
 * Main server class
 */

export default class Server {

    //calling the express to app variable
    app = express();

    //function to start services
    async start() {
        console.log("Starting services")
        //Listening to port no. in .env file
        this.app.listen(process.env.PORT);
        console.log(`Express server started at http://localhost:${process.env.PORT}`)
        //calling middleware
        this.middleware();
        //calling routes
        this.routes();
    }

    /**
     * Middleware
     */
    middleware() {
        //for parsing the URL-encoded data
        this.app.use(bodyParser.urlencoded({extended: false}));
        //initializing the session
        this.app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                store: MongoStore.create({
                    mongoUrl: process.env.SESSION_MONGO_URL,
                }),
                cookie: {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                },
            }),
        );
    }

    /**
     * App routes for cinema
     */
    routes() {

        /**
         * Create a job seeker
         */
        this.app.post("/jobSeeker/create", expressResponse(async (req: Request) => {
            //joi schema to create job seeker profile
            const schema = Joi.object({
                name: Joi.string().required(), //name of job seeker
                email: Joi.string().email().required(), //email id of job seeker
                password: Joi.string().required(), //password of job seeker
                skill: Joi.string().required(), //skill of job seeker
            });
            //validate the schema
            await schema.validateAsync(req.body);
            //set session for the job seeker
            //@ts-ignore
            req.session.jobSeeker = req.body;
            //call and return controller
            //@ts-ignore
            return CtrlJobSeeker.create(req.session.jobSeeker);

        }));

        /**
         * Authenticate a job seeker
         */
        this.app.post("/jobSeeker/auth", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                email: Joi.string().email().required(), //email of job seeker
                password: Joi.string().required(), //password for job seeker
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //calling controller
            //setting session for job seeker
            //@ts-ignore
            req.session.jobSeeker = await CtrlJobSeeker.auth(req.body.email, req.body.password);
            //show success
            return "Login Success!";
        }));

        /**
         * Authenticate the admin
         */
        this.app.post("/admin/auth", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                email: Joi.string().email().required(), //email id of admin
                password: Joi.string().required(), //password of admin
            });
            //validate schema
            await schema.validateAsync(req.body);
            //call controller
            //setting session for admin
            //@ts-ignore
            req.session.admin = await CtrlAdmin.auth(req.body.email, req.body.password);
            //show success
            return "Admin Login successful";
        }));

        /**
         * Create an organisation
         * only be done by administrator
         */
        this.app.post("/org/create", expressResponse(async (req: Request) => {
            //authenticating the admin
            //@ts-ignore
            if(!(req.session && req.session.admin)){
                throw new Error("Not Authenticated")
            }
            //joi schema
            const schema = Joi.object({
                name: Joi.string().required(), //name of organisation
                email: Joi.string().email().required(), //email id of organisation
                password: Joi.string().required(), //password of organisation
            });
            //validate the schema
            await schema.validateAsync(req.body);
            //set session for organisation
            //@ts-ignore
            req.session.org = req.body;
            //call and return controller
            //@ts-ignore
            return CtrlOrg.create(req.session.org);
        }));

        /**
         * Authenticate an organisation
         */
        this.app.post("/org/auth", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                email: Joi.string().email().required(), //email id of the organisation
                password: Joi.string().required(), //password of the organisation
            });
            //validate schema
            await schema.validateAsync(req.body);
            //call controller
            //set session for organisation
            //@ts-ignore
            req.session.org = await CtrlOrg.auth(req.body.email, req.body.password);
            //show success
            return "Organisation Login Success!";
        }));

        /**
         * Logout
         * for all
         */
        this.app.post("/logout",expressResponse(async (req: Request) => {
            // destroy session
            await req.session.destroy(() => {});
            // return success to user
            return "Logged out";
        }));

        /**
         * Create a job domain
         * can only be done by administrator
         */
        this.app.post("/domain/create", expressResponse(async (req: Request) => {
            //authenticating the admin
            //@ts-ignore
            if(!(req.session && req.session.admin)){
                throw new Error("Not Authenticated")
            }
            //joi schema
            const schema = Joi.object({
                name: Joi.string().required(), //name of the domain
            });
            //validate schema
            const data = await schema.validateAsync(req.body);
            //call and return controller
            //@ts-ignore
            return CtrlDomain.create(data);
        }));

        /**
         * Create a job posting
         * can only be done by organisation
         */
        this.app.post("/job/create", expressResponse(async (req: Request) => {
            //authenticating the organisation
            //@ts-ignore
            if(!(req.session && req.session.org)){
                throw new Error("Not Authenticated")
            }
            //joi schema
            const schema = Joi.object({
                name: Joi.string().required(), //job name
                orgName: Joi.string().required(), //organisation's name
                domainName: Joi.string().required(), //domain of job
                skillReq: Joi.string().required(), //skill required for job
                ctc: Joi.number().integer().required(), //salary of job
                vacancy: Joi.number().integer().required(), //seats available
            });
            //validate schema
            await schema.validateAsync(req.body);
            const data = {
                ...req.body,
                //set orgId as current session's organisation's id
                //@ts-ignore
                orgId: req.session.org._id,
            }
            //call and return controller
            //@ts-ignore
            return CtrlJob.create(data);
        }));

        /**
         * Find all job posting
         * for anyone
         */
        this.app.get("/job/all", expressResponse(async (req: Request) => {
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    order: Joi.string().default("dsc"), //order of sorting (asc for ascending and dsc for descending)
                    orderBy: Joi.string().default("date"), //what to sort the list by (date/ctc/name)
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                // call and return controller
                // @ts-ignore
                return CtrlJob.findAll(data.page, data.limit, data.order, data.orderBy);
            }),
        );

        /**
         * Find certain job posting
         * for anyone
         */
        this.app.get("/job/certain", expressResponse(async (req: Request) => {
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    filter: Joi.number(), //filter constraint
                    filterBy: Joi.string().default("recent"), //what to filter by (recent/ctc/vacancy)
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                // call and return controller
                // @ts-ignore
                return CtrlJob.findCert(data.page, data.limit, data.filterBy, data.filter);
            }),
        );

        /**
         * Find all job posting
         * only for organisation
         */
        this.app.get("/org/job/all", expressResponse(async (req: Request) => {
            //authenticating the organisation
            //@ts-ignore
            if(!(req.session && req.session.org)){
                throw new Error("Not Authenticated")
            }
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    order: Joi.string().default("dsc"), //sorting order (asc for ascending order, dsc for descending order)
                    orderBy: Joi.string().default("date"), //what to sort by (date/ctc/name)
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                //variable to store current org's id
                //@ts-ignore
                const orgData = req.session.org._id;
                // call and return controller
                return CtrlJob.findAllOrg(data.page, data.limit, data.order, data.orderBy, orgData);
            }),
        );

        /**
         * Find certain job posting
         * only for organisation
         */
        this.app.get("/org/job/certain", expressResponse(async (req: Request) => {
            //authenticating the organisation
            //@ts-ignore
            if(!(req.session && req.session.org)){
                throw new Error("Not Authenticated")
            }
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    filter: Joi.number(), //filter constraint
                    filterBy: Joi.string().default("recent"),  //what to filter by(recent/ctc/vacancy)
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                //variable to store current org's id
                //@ts-ignore
                const orgData = req.session.org._id;
                // call and return controller
                return CtrlJob.findCertOrg(data.page, data.limit, data.filterBy, data.filter, orgData);
            }),
        );

        /**
         * Find all job domain
         * for anyone
         */
        this.app.get("/domain/all", expressResponse(async (req: Request) => {
            //authenticating the organisation
            //@ts-ignore
            if(!(req.session && req.session.org)){
                throw new Error("Not Authenticated")
            }
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    order: Joi.string().default("dsc"), //sorting order (asc for ascending/dsc for descending)
                    orderBy: Joi.string().default("date"), //what to sort by(date/ctc/name)
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                // call and return controller
                // @ts-ignore
                return CtrlDomain.findAll(data.page, data.limit, data.order, data.orderBy);
            }),
        );

        /**
         * Find certain job domain
         * for anyone
         */
        this.app.get("/domain/certain", expressResponse(async (req: Request) => {
            //authenticating the organisation
            //@ts-ignore
            if(!(req.session && req.session.org)){
                throw new Error("Not Authenticated")
            }
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    domainName: Joi.string().required(), //name of the domain to find by
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                // call and return controller
                // @ts-ignore
                return CtrlDomain.findCert(data.page, data.limit, data.domainName);
            }),
        );

        /**
         * Find all job domain
         * only for organisation
         */
        this.app.get("/org/domain/all", expressResponse(async (req: Request) => {
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    order: Joi.string().default("dsc"), //sorting order (asc/dsc)
                    orderBy: Joi.string().default("date"), //what to order by(date/name/ctc)
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                //variable to store current org's id
                //@ts-ignore
                const orgData = req.session.org._id;
                // call and return controller
                return CtrlDomain.findAllOrg(data.page, data.limit, data.order, data.orderBy, orgData);
            }),
        );

        /**
         * Find certain job domain
         * only for organisation
         */
        this.app.get("/org/domain/certain", expressResponse(async (req: Request) => {
                // joi schema
                const schema = Joi.object({
                    page: Joi.number().integer().default(0), //for paging
                    limit: Joi.number().integer().default(5), //for limit per page
                    domainName: Joi.string().required(), //domain main to filter by
                });
                // validate schema
                const data = await schema.validateAsync(req.query);
                //variable to store current org's id
                //@ts-ignore
                const orgData = req.session.org._id;
                // call and return controller
                // @ts-ignore
                return CtrlDomain.findCertOrg(data.page, data.limit, data.domainName, orgData);
            }),
        );

        /**
         * Job application
         * con only be done by jobSeeker
         */
        this.app.post("/jobApplication/create", expressResponse(async (req: Request) => {
            //authenticating the admin
            //@ts-ignore
            if(!(req.session && req.session.jobSeeker)){
                throw new Error("Not Authenticated")
            }
            //joi schema
            const schema = Joi.object({
                jobId: Joi.string().required(), //job id of job to apply for
            })
            //Validate joi schema
            await schema.validateAsync(req.body);
            const data = {
                ...req.body,
                //set jobSeekerId as current job seeker's id
                //@ts-ignore
                jobSeekerId: req.session.jobSeeker._id,
            }
            //call and return controller
            return CtrlJobApplication.create(data);
        }));

        /**
         * Job seeker's profile
         * only by job seeker
         */
        this.app.get("/jobSeeker/me", expressResponse(async (req: Request) => {
            //variable to store current job seeker's id
            //@ts-ignore
            const jobSeekerData = req.session.jobSeeker._id;
            //return and call controller
            return CtrlJobSeeker.findJobApplication(jobSeekerData);
        }));

        /**
         * Selecting an applicant
         * only by organisation
         */
        this.app.post("/jobApplication/select", expressResponse(async (req: Request) => {
            //authenticating the admin
            //@ts-ignore
            if(!(req.session && req.session.org)){
                throw new Error("Not Authenticated")
            }
            //joi schema
            const schema = Joi.object({
                jobApplicationId: Joi.string().required(), //id of job application to select
            })
            //validate schema
            const data = await schema.validateAsync(req.body);
            //call and return controller
            return CtrlJobApplication.select(data.jobApplicationId);
        }));
    }
}
