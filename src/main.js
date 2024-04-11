import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
})

connectDB();             //executed the connection function























/*
import express from 'express';

const app = express();

;( async () => {
      try {
        await mongoose.connect(`process.env.${MONGODB_URL}/${db_Name}`)
        app.on("error", (error)=>{
            console.log("Error : ", error);
            throw error;
        })

        app.listen(process.env.PORT, ()=>{
            console.log("Server is Active on Port :", process.env.PORT);
        })

      } catch (error) {
        console.log("Error : ", error);
        throw error;
      }
})() */               //IIFE 