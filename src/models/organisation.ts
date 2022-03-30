/**
 * Model for organisation
 */

import {Schema,model} from "mongoose";

export interface IOrg {
    name: string, //name of organisation
    email: string, //email of the organization
    password: string, //email of the password
}

const orgSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email: {
        type: String,
        required: true,
    },
    password:{
        type:String,
        required:true,
    },
})

//exporting the model
export default model<IOrg>("org",orgSchema);
