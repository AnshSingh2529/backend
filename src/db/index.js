import  mongoose  from "mongoose";
import { db_Name } from "../constants.js";


const connectDB = async () => {
    try {
        const InstanceConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${db_Name}`)

        console.log(`\n MongoDB connected !!  DB HOST : ${InstanceConnection.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection Error :", error);
        process.exit(1);
    }
}

export default connectDB;