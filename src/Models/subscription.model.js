import mongoose, {Schema, SchemaType} from "mongoose";

const subscriptionSchema = new Schema({

    subscriber: {
        type: Schema.Types.ObjectId,   //one who is subscribing 
        ref: "User"
    },

    channel: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    }
},{timestamps:true});

export const Subscribtion = mongoose.model("Subscription", subscriptionSchema);