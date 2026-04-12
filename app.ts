import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"
import healthCheckRouter from "./routes/health.route"

const app=express();

app.use(cors());// need to update
app.use(express.json());


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended:true ,limit:"16kb"}));
app.use(express.static("public"));

app.use(cookieParser());


app.use("/api/v1",healthCheckRouter);   




export default app;