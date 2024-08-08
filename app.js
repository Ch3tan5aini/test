import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import passport from 'passport';
import mongoose from "mongoose"
import session from "express-session"
import passportLocalMongoose from "passport-local-mongoose"

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect("mongodb://localhost:27017/UserDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.render("home")
})
app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets")
    }
    else {
        res.redirect("/login")
    }
})
app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if (err) {
            console.log("err", err);
        }
        res.redirect("/")
    })
})
app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            res.redirect("/register")
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets")
        })

    })
});

app.post("/login", (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    }
    req.login(user, (err) => {
        if (err) {console.log(err)};
        passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets")
        })
    })
})


app.listen(port, () => {
    console.log(`Sever is running at http://localhost:${port}`);
})
