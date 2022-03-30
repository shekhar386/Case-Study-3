/**
 * Model for job domain
 */

import {Schema,model} from "mongoose";

export interface IDomain {
    name: string, //domain name
}


const domainSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique: true,
    },
})

//exporting the model
export default model<IDomain>("domain",domainSchema);
