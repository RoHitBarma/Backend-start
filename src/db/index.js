import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";

const connectDB = async () => {
    try{
        const connectionInstence = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstence.connection.host}`)
    }catch (error){
        console.log("MongoDB connection FAILED: ", error);
        process.exit(1)
    }
}

export default connectDB;