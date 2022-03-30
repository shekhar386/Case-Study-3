/**
 * Controller for organisation
 */

import Bcrypt from "../services/bcrypt";
import org, {IOrg} from "../models/organisation";

export default class CtrlOrg {
    /**
     * Creating a new organisation
     * @param body
     */
    static async create(body: any): Promise<IOrg> {
        //hashing the password
        const hash = await Bcrypt.hashing(body.password);
        const data = {
            ...body,
            //replacing password with hashed password
            password: hash,
        };
        //create organisation
        return org.create(data);
    }

    /**
     * authenticating an organisation
     * @param email
     * @param password
     */
    static async auth(email: string, password: string): Promise<IOrg> {
        // fetch user from database
        const orgData = await org.findOne({email}).lean();
        // if users exists or not
        if (orgData) {
            // verify the password
            const result = await Bcrypt.comparing(password, orgData.password);
            // if password is correct or not
            // if correct, return the user
            if (result) {
                return orgData;
            }
            // throw error
            else {
                throw new Error("password doesn't match");
            }
        }
        // throw error
        else {
            throw new Error("organisation doesn't exists");
        }
    }
}
