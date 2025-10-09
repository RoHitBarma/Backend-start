// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";
// import express from "express";

// const connectDB = async () => {
//     try{
//         const connectionString = process.env.MONGODB_URI
//         const encodedURI = encodeURI(connectionString);
//         console.log("encoded uri from env ...", encodedURI)
//         const connectionInstence = await mongoose.connect(encodedURI)
//         // const connectionInstence = await mongoose.connect(`${encodedURI}/${DB_NAME}`)
//         console.log(`\n MongoDB connected !! DB Host: ${connectionInstence.connection.host}`)
//     }catch (error){
//         console.log("MongoDB connection FAILED: ", error);
//         process.exit(1)
//     }
// }

// export default connectDB;

import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config(); // Make sure this is at the top

const connectDB = async () => {
    try {
        console.log("🔄 Attempting MongoDB connection...");
        
        // Connect directly without any string manipulation
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}:${process.env.DB_NAME}`);
        
        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`📊 Database: ${connectionInstance.connection.name}`);
        console.log(`🖥️ Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("❌ MongoDB Connection FAILED: ", error.message);
        process.exit(1);
    }
}

export default connectDB;