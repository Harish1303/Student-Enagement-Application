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
    adminid: Number
});

const student = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    password: String,
    gender: String,
    studentid: Number,
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
    teacherid: Number,
    dob: String,
});
const admincounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number
})
const studentcounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number
})
const teachercounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number
})


userschema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userschema);
const Admin = new mongoose.model("Admin", administrator);
const Admincounter = new mongoose.model("Admincounter", admincounter);
const Teachercounter = new mongoose.model("Teachercounter", teachercounter);
const Studentcounter = new mongoose.model("Studentcounter", studentcounter);
const Teacher = new mongoose.model("Teacher", teacher);
const Student = new mongoose.model("Student", student);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function getNextSequenceValues(sequenceName) {
    return Admincounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec()
}
function getNextSequenceValuesforstudents(sequenceName) {
    return Studentcounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec()
}
function getNextSequenceValuesforteachers(sequenceName) {
    return Teachercounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec()
}
function createadminid() {
    h = getNextSequenceValues("adminid").then((p) => {
        h = p.sequence_value
        return h
    })
    return h
}
function createteacherid() {
    h = getNextSequenceValuesforteachers("teacherid").then((p) => {
        h = p.sequence_value
        return h
    })
    return h
}
function createstudentid() {
    h = getNextSequenceValuesforstudents("studentid").then((p) => {
        h = p.sequence_value
        return h
    })
    return h
}

//Studentcounter.create({ _id: "studentid", sequence_value: 0 })

app.get("/", function (req, res) {
    res.render("index")
})
app.get("/register", function (req, res) {
    res.render("register")
})
app.get("/xlogin", function (req, res) {
    res.render("xindex")
})


app.post("/register", function (req, res) {
    var newid = new mongoose.mongo.ObjectId();
    User.register({
        username: req.body.email,
        status: Number(req.body.status),
        _id: newid
    }, req.body.psw,
        function (err) {
            if (err) {
                console.log("error")
                console.log(err);
                res.redirect("/register");
            }
            else {
                if (Number(req.body.status == 1)) {
                    createadminid().then((a) => {
                        Admin.create({ _id: newid, adminid: a, firstname: req.body.fname, lastname: req.body.lname, username: req.body.email, gender: req.body.gender, dob: req.body.dob },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    res.redirect("/")
                                }
                            })
                    })

                }
                else if (Number(req.body.status == 2)) {
                    createteacherid().then((a) => {
                        Teacher.create({ _id: newid, teacherid: a, firstname: req.body.fname, lastname: req.body.lname, username: req.body.email, gender: req.body.gender, dob: req.body.dob },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    res.redirect("/")
                                }
                            })
                    })
                }
                else if (Number(req.body.status == 3)) {
                    createstudentid().then((a) => {
                        Student.create({ _id: newid, studentid: a, firstname: req.body.fname, lastname: req.body.lname, username: req.body.email, gender: req.body.gender, dob: req.body.dob },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    res.redirect("/")
                                }
                            })
                    })
                }
            }
        })
})
app.post("/xlogin", function (req, res) {
    const uname = req.body.username
    User.findByUsername(uname).then(function (su) {
        if (su) {
            su.setPassword(req.body.password, function () {
                su.save()
                res.redirect("/register")
            })
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

                    req.session.uniqueid = users._id
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
            res.render("adminpage", { students: studentlist, teachers: teacherlist })
        })
        //res.render("adminpage")
    }
    else {
        res.redirect("/");
    }
})
app.get("/adminlogin/profiles", function (req, res) {
    res.render("exp")
})
app.get("/studentlogin", function (req, res) {
    console.log(req.session.uniqueid)
    if (req.isAuthenticated()) {
        res.send("Ssuccess")
    }
    else {
        res.redirect("/");
    }
})
app.get("/teacherlogin", function (req, res) {
    console.log(req.session.uniqueid)
    if (req.isAuthenticated()) {
        res.send("Tsuccess")
    }
    else {
        res.redirect("/");
    }
})
app.get("/addsubject", function (req, res) {
    res.render("registersubjects");
})





app.get("/exp", function (req, res) {
    lauda = [{ _id: 60, firstname: 'Harish' }]
    res.render("exp", { students: lauda })
})
app.get("/admin", function (req, res) {
    lauda = [{ _id: 60, firstname: 'Harish' }]
    res.render("admin", { students: lauda })
})
app.listen(3000, function () {
    console.log("Server is running")
})

