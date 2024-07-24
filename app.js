import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const app = express();
const port = 3000;
const saltRound = 5;

mongoose.connect("mongodb://localhost:27017/UserDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

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
        bcrypt.hash(req.body.password, saltRound, (err, hash)=>{
            if(err){
                res.send("error hashing password" , err)
            }else{
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                })
                newUser.save()
                res.render("secrets")
            }
        })
   
    } catch (error) {
        res.send("error")
    }
});

app.post("/login", async(req, res)=>{
    const userName = req.body.username;
    const password = req.body.password

    const foundUser = await User.findOne({email: userName})
    if(foundUser){
        bcrypt.compare(password, foundUser.password, (err, result)=>{
            if(err){
                res.render("Error hashing Password ", err)
            }else{
                if(!result){
                    console.log("error");
                }
                else{
                res.render("secrets")
            }
            }
        })
    }else{
        res.send("Username Not Found")
    }
})


app.listen(port, ()=>{
    console.log(`Sever is running at http://localhost:${port}`);
})
