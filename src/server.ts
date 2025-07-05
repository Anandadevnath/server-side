import { Express } from "express";
import mongoose from "mongoose";
import {Server } from 'http'
import app from "./app";

let server : Server;

const URL = "mongodb+srv://mongodb:a123456@cluster0.axaw2bo.mongodb.net/LibraryDB?retryWrites=true&w=majority&appName=Cluster0"
let PORT= 5000
async function main() {
    try{
        await mongoose.connect(URL)
        console.log("connected to mongoDB")
         server = app.listen(PORT,()=>{
            console.log(`App in listening on port ${PORT}`)
         })
       }
    catch(error){
        console.log(error)
    }
}
main();

