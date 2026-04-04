import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"

const app=express();

app.use(cors());// need to update
app.use(express.json());


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended:true ,limit:"16kb"}));
app.use(express.static("public"));

app.use(cookieParser());


app.get("/",(req,res)=>{
    res.send("Hello World");
}
);

export default app;