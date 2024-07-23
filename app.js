import 'dotenv/config';
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app = express();
const port = 3000;

mongoose.connect("mongodb://localhost:27017/UserDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']})
const User = mongoose.model("User", userSchema)

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res)=>{
    res.render("home")
})
app.get("/login", (req, res)=>{
    res.render("login")
})
app.get("/register", (req, res)=>{
    res.render("register")
})
app.post("/register", (req, res)=>{
    try {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        })
        newUser.save()
        res.render("secrets")
    } catch (error) {
        res.send("error")
    }
});

app.post("/login", async(req, res)=>{
    const userName = req.body.username;
    const password = req.body.password;

    const foundUser = await User.findOne({email: userName})
    if(foundUser){
        if(foundUser.password === password){
            res.render("secrets")
        }else{
            res.send("Incorrect Password")
        }
    }else{
        res.send("Username Not Found")
    }
})


app.listen(port, ()=>{
    console.log(`Sever is running at http://localhost:${port}`);
})
