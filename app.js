const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");


app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,

    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/stundentengagementsystem", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);


const userschema = new mongoose.Schema({

    username: String,
    password: String,
    status: Number
});
const administrator = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    gender: String,
    dob: String,

});

const student = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    password: String,
    gender: String,
    dob: String,
});
const subject = new mongoose.Schema({

    subjectcode: String,
    subjectname: String,

});
const teacher = new mongoose.Schema({
    firstname: String,
    lastname: String,
    subjects: [mongoose.Types.ObjectId],
    phonenumber: String,
    username: String,
    password: String,
    gender: String,
    dob: String,
});


userschema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userschema);
const Admin = new mongoose.model("Admin", administrator);
const Teacher = new mongoose.model("Teacher", teacher);
const Student = new mongoose.model("Student", student);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("index")
})
app.get("/register", function (req, res) {
    res.render("register")
})

app.post("/register", function (req, res) {
    User.register({
        username: req.body.email,
        status: Number(req.body.status)
    }, req.body.psw,
        function (err) {
            if (err) {
                console.log("error")
                console.log(err);
                res.redirect("/register");
            }
            else {
                if (Number(req.body.status == 1)) {
                    Admin.create({ firstname: req.body.fname, lastname: req.body.lname, username: req.body.email, gender: req.body.gender, dob: req.body.dob },
                        function (err, ctd) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                res.redirect("/")
                            }
                        })
                }
                else if (Number(req.body.status == 2)) {
                    Student.create({ firstname: req.body.fname, lastname: req.body.lname, username: req.body.email, gender: req.body.gender, dob: req.body.dob },
                        function (err, ctd) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                res.redirect("/")
                            }
                        })
                }
                else if (Number(req.body.status == 3)) {
                    Teacher.create({ firstname: req.body.fname, lastname: req.body.lname, username: req.body.email, gender: req.body.gender, dob: req.body.dob },
                        function (err, ctd) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                res.redirect("/")
                            }
                        })
                }
            }
        })
})

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            passport.authenticate("local")(req, res, function () {
                User.findOne({ username: req.body.username }).then((users) => {
                    if (Number(users.status) == 1) {
                        res.redirect("/adminlogin")
                    }
                    if (Number(users.status) == 2) {
                        res.redirect("/teacherlogin")
                    }
                    if (Number(users.status) == 3) {
                        res.redirect("/studentlogin")
                    }

                }).catch((e) => {
                    console.log(e)
                })
            })
        }
    })
})
app.get("/adminlogin", function (req, res) {
    if (req.isAuthenticated()) {
        Teacher.find({}, { "firstname": 1 }).exec().then(tlist => {
            teacherlist = tlist
        })
        Student.find({}, { "firstname": 1 }).exec().then(slist => {
            studentlist = slist
            console.log(studentlist, teacherlist)
            res.render("adminpage", { students: studentlist, teachers: teacherlist })
        })
        //setTimeout(function () {  }, 3000);


        //res.render("adminpage")
    }
    else {
        res.redirect("/");
    }
})

app.get("/studentlogin", function (req, res) {
    if (req.isAuthenticated()) {
        res.send("Ssuccess")
    }
    else {
        res.redirect("/");
    }
})
app.get("/teacherlogin", function (req, res) {
    if (req.isAuthenticated()) {
        res.send("Tsuccess")
    }
    else {
        res.redirect("/");
    }
})
app.listen(3000, function () {
    console.log("Server is running")
})