import mongoose, {Schema} from "mongoose";

const SubscriptionSchema = new Schema(
{   
    subscriber: {
        typeof: Schema.Types.ObjectId,        //one who is subscribing your channel
        ref:'User'
    },
    
   channel: {
        typeof: Schema.Types.ObjectId,       
        ref:'User'
    },
    
},
    { timestamps: true }
);


export const Subscription = mongoose.model('Subscription', SubscriptionSchema)
