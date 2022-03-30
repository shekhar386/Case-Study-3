/**
 * Controller for Administrator
 */

import Bcrypt from "../services/bcrypt";
import admin, {IAdmin} from "../models/admin";

export default class CtrlAdmin {
    /**
     * Authorize the admin
     */
    static async auth(email: string, password: string): Promise<IAdmin> {
        // fetch user from database
        const adminData = await admin.findOne({ email }).lean();

        // if users exists or not
        if (adminData) {
            // verify the password
            const result = await Bcrypt.comparing(password, adminData.password);

            // if password is correct or not
            // if correct, return the user
            if (result) return adminData;
            // throw error
            else throw new Error("password doesn't match");
        }
        // throw error
        else throw new Error("user doesn't exists");
    }
}
