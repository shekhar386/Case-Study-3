/**
 * Model for Administrator
 */

import {Schema,model} from "mongoose"

export interface IAdmin {
    email: string, //admin's email
    password: string, //admin's password
}

const adminSchema=new Schema({
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
})

//exporting the model
export default model<IAdmin>("admin",adminSchema);