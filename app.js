const   express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
const nodemailer = require('nodemailer');
const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    },
});
var upload = multer({ storage: storage });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/stundentengagementsystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

var imageSchema = new mongoose.Schema({
    fname: String,
    img: {
        data: Buffer,
        contentType: String,
    },
});
const imgModel = new mongoose.model('Image', imageSchema);
const userschema = new mongoose.Schema({
    username: String,
    password: String,
    status: Number,
});
const administrator = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    gender: String,
    dob: String,
    adminid: String,
});

const student = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    password: String,
    gender: String,
    studentid: String,
    dob: String,
    semester: Number,
    department: String,
});

const teacher = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    username: String,
    password: String,
    gender: String,
    teacherid: String,
    dob: String,
    department: String,
});
const admincounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const studentcounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const teachercounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const filecounter = new mongoose.Schema({
    _id: String,
    sequence_value: Number,
});
const subject_teacher_mapping = new mongoose.Schema({
    _id: { teacherid: { type: String }, subjectid: { type: String } },
    teacherid: String,
    subjectid: String,
});
const subject_student_mapping = new mongoose.Schema({
    _id: { studentid: { type: String }, subjectid: { type: String } },
    studentid: String,
    subjectid: String,
});
const uploadfile = new mongoose.Schema({
    filecode: String,
    data: Buffer
})
var submission = new mongoose.Schema({
    studentid: String,
    evaluated: Boolean,
    marks: Number,
    answer_file_code: String
})
var assignments = new mongoose.Schema({
    assignment_file_code: String,
    submissions: [submission]
})
const subject = new mongoose.Schema({
    _id: String,
    subjectname: String,
    department: String,
    semester: Number,
    assignments: [assignments],
    credits: Number
});
userschema.plugin(passportLocalMongoose);
const User = new mongoose.model('User', userschema);
const Admin = new mongoose.model('Admin', administrator);
const Admincounter = new mongoose.model('Admincounter', admincounter);
const Teachercounter = new mongoose.model('Teachercounter', teachercounter);
const Studentcounter = new mongoose.model('Studentcounter', studentcounter);
const Filecounter = new mongoose.model('Filecounter', filecounter);
const Teacher = new mongoose.model('Teacher', teacher);
const Student = new mongoose.model('Student', student);
const Subject = new mongoose.model('Subject', subject);
const Uploadfile = new mongoose.model('Uploadfile', uploadfile);
const Submissions = new mongoose.model('Submissions', submission);
const Assignments = new mongoose.model('Assignments', assignments);
const Subjects = new mongoose.model('Subjects', subject);
const Subject_teacher_mapping = new mongoose.model(
    'Subject_teacher_mapping',
    subject_teacher_mapping
);

const Subject_student_mapping = new mongoose.model(
    'Subject_student_mapping',
    subject_student_mapping
);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function getNextSequenceValues(sequenceName) {
    return Admincounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}

function getNextSequenceValuesforstudents(sequenceName) {
    return Studentcounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}
function getNextSequenceValuesforteachers(sequenceName) {
    return Teachercounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}
function getNextSequenceValuesforfiles(sequenceName) {
    return Filecounter.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { new: true }
    ).exec();
}
function createadminid() {
    h = getNextSequenceValues('adminid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}
function createteacherid() {
    h = getNextSequenceValuesforteachers('teacherid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}
function createstudentid() {
    h = getNextSequenceValuesforstudents('studentid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}
function createfileid() {
    h = getNextSequenceValuesforfiles('fileid').then((p) => {
        h = p.sequence_value;
        return h;
    });
    return h;
}

Studentcounter.create({
    _id: 'studentid',
    sequence_value: 0,
}).catch((err) => { });
Admincounter.create({ _id: 'adminid', sequence_value: 0 }).catch((err) => { });
Teachercounter.create({
    _id: 'teacherid',
    sequence_value: 0,
}).catch((err) => { });
Filecounter.create({
    _id: 'fileid',
    sequence_value: 0,
}).catch((err) => { });


app.get('/', function (req, res) {
    res.render('landingpage', { err: '' });
});
app.get('/index', function (req, res) {
    res.render('index', { err: '' });
});
app.get('/register', function (req, res) {
    res.render('register');
});
app.get('/fake', function (req, res) {
    res.render('fake');
});
app.get('/assfake', function (req, res) {
    res.render('assfake');
});


app.get('/forgotpassword', function (req, res) {
    res.render('exception_handlingpage', {mes:""});
});

app.get('/admin/change_password', function (req, res) {
    res.render('change_password');
});

app.get('/admin/newStudent', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid }).exec().then(user => {
            if (user.status == 1) {
                res.render("newStudent")
            }
        })
    }
    else {
        res.redirect("/")
    }
});
app.get('/admin/newTeacher', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid }).exec().then(user => {
            if (user.status == 1) {
                res.render("newTeacher")
            }
        })
    }
    else {
        res.redirect("/")
    }
});

app.get('/uploadimage', (req, res) => {
    console.log(req.session.uniqueid);
    imgModel.find({ _id: req.session.uniqueid }, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('uploadimage', { items: items });
        }
    });
});

function sendmail(p1, currmail) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        //port: 587,
        //secure: false, // true for 465, false for other ports
        auth: {
            user: 'krishnavarun307@gmail.com', // generated ethereal user
            pass: 'krishna@307', // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    let mailOptions = {
        from: 'krishnavarun307@gmail.com', // sender address
        to: currmail, // list of receivers
        subject: 'Node Contact Request', // Subject line
        text: p1, // plain text body
        //html: output // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            //return console.log(error);
            res.redirect('/index');
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        //res.render('contact', { msg: 'Email has been sent' });
    });
}
app.post('/register', function (req, res) {
    console.log(req.body);
    var newid = new mongoose.mongo.ObjectId();
    pass = "asdfghjkl";
    console.log(pass);
    console.log(typeof pass);
    User.register(
        {
            username: req.body.email,
            status: Number(req.body.status),
            _id: newid,
        },
        pass,
        function (err) {
            if (err) {
                console.log('error');
                console.log(err);
                res.redirect('/register');
            } else {
                console.log('registered');
                if (Number(req.body.status == 1)) {
                    createadminid().then((a) => {
                        trial = 'ADMIN' + String(a).padStart(3, '0');
                        Admin.create(
                            {
                                _id: newid,
                                adminid: trial,
                                firstname: req.body.fname,
                                lastname: req.body.lname,
                                username: req.body.email,
                                gender: req.body.gender,
                                dob: req.body.dob,
                            },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    imgModel.create({
                                        _id: ctd._id,
                                        fname: 'd',
                                        img: {
                                            data: fs.readFileSync(
                                                path.join(
                                                    __dirname + '/uploads/' + 'image-1615047525141'
                                                )
                                            ),
                                            contentType: 'image/png',
                                        },
                                    });
                                    sendmail(pass, req.body.email)
                                    res.redirect('/index');
                                }
                            }
                        );
                    });
                } else if (Number(req.body.status == 2)) {
                    createteacherid().then((a) => {
                        trial = 'T' + String(a).padStart(3, '0');
                        Teacher.create(
                            {
                                _id: newid,
                                teacherid: trial,
                                department: req.body.dept,
                                firstname: req.body.fname,
                                lastname: req.body.lname,
                                username: req.body.email,
                                gender: req.body.gender,
                                dob: req.body.dob,
                            },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    imgModel.create({
                                        _id: ctd._id,
                                        fname: 'd',
                                        img: {
                                            data: fs.readFileSync(
                                                path.join(
                                                    __dirname + '/uploads/' + 'image-1615047525141'
                                                )
                                            ),
                                            contentType: 'image/png',
                                        },
                                    });
                                    sendmail(pass, req.body.email)
                                    res.redirect('/admin/newTeacher');
                                }
                            }
                        );
                    });
                } else if (Number(req.body.status == 3)) {
                    createstudentid().then((a) => {
                        console.log(String(a).padStart(3, '0'));
                        trial = 'S' + String(a).padStart(3, '0');
                        console.log(trial);
                        Student.create(
                            {
                                _id: newid,
                                studentid: trial,
                                firstname: req.body.fname,
                                semester: req.body.semester,
                                department: req.body.dept,
                                lastname: req.body.lname,
                                username: req.body.email,
                                gender: req.body.gender,
                                dob: req.body.dob,
                            },
                            function (err, ctd) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    imgModel.create({
                                        _id: ctd._id,
                                        fname: 'd',
                                        img: {
                                            data: fs.readFileSync(
                                                path.join(
                                                    __dirname + '/uploads/' + 'image-1615047525141'
                                                )
                                            ),
                                            contentType: 'image/png',
                                        },
                                    });
                                    sendmail(pass, req.body.email)
                                    res.redirect('/admin/newStudent');
                                }
                            }
                        );
                    });
                }
            }
        }
    );
});

app.post('/forgotpassword', function (req, res) {
    const uname = req.body.username;
    pass = generateString(8)
    sendmail(pass, req.body.username)
    User.findByUsername(uname).then(function (su) {
        if (su) {
            su.setPassword(pass, function () {
                
                su.save();
                
                res.redirect('/forgotpassword', {mes:" New  Password sent to registered emailid ! "});
            });
        }
        else {
            console.log("hey");
            res.render('exception_handlingpage', {mes:"User does not exist"} )
        }
    }).catch( err=>{
        
    });
});

app.post('/subjectregister', function (req, res) {
    if (req.isAuthenticated()) {
        Subject.create({
            subjectname: req.body.sname,
            _id: req.body.scode,
            department: req.body.dept,
            semester: req.body.sem,
        })
            .then(function (done) {
                if (done) {
                    res.redirect('/admin/addsubject');
                }
            })
            .catch(function (err) {
                res.redirect('/register');
            });
    }
});

app.post('/login', function (req, res) {
    console.log(req.body);
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.redirect('/index');
        } else {
            passport.authenticate('local', { failureRedirect: '/errorlogin' })(
                req,
                res,
                function () {
                    User.findOne({ username: req.body.username })
                        .then((users) => {
                            req.session.uniqueid = users._id;
                            if (Number(users.status) == 1) {
                                res.redirect('/admin');
                            }
                            if (Number(users.status) == 2) {
                                res.redirect('/teacherHomePage');
                            }
                            if (Number(users.status) == 3) {
                                res.redirect('/studentHomePage');
                            }
                        })
                        .catch((e) => {
                            res.redirect('/login');
                            console.log(e);
                        });
                }
            );
        }
    });
});

app.get('/errorlogin', function (req, res) {
    res.render('index', { err: 'WRONG USERNAME OR PASSWORD' });
});
app.get('/admin', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    counts = [];
                    Teacher.estimatedDocumentCount()
                        .exec()
                        .then((ans) => {
                            counts.push(ans);
                            Student.estimatedDocumentCount()
                                .exec()
                                .then((sc) => {
                                    counts.push(sc);
                                    Subject.estimatedDocumentCount()
                                        .exec()
                                        .then((subc) => {
                                            counts.push(subc);
                                            res.render('admin', { counts: counts });
                                        });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});

app.get('/admin/TeacherProfiles', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Teacher.find(
                        {},
                        { firstname: 1, lastname: 1, department: 1, teacherid: 1 }
                    )
                        .exec()
                        .then((tlist) => {
                            teacherlist = tlist;
                            res.render('teacherlist_adminview', { students: tlist });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/teachersassigned/:sid', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Subject_teacher_mapping.find({ subjectid: req.params.sid })
                        .exec()
                        .then((list) => {
                            for (var i = 0; i < list.length; i++) {
                                list[i] = list[i].teacherid;
                            }
                            Teacher.find(
                                { teacherid: { $in: list } },
                                { firstname: 1, lastname: 1, department: 1, teacherid: 1 }
                            )
                                .exec()
                                .then((tlist) => {
                                    teacherlist = tlist;
                                    res.render('teachersassignedlist', { students: tlist });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/studentsenrolled/:sid', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Subject_student_mapping.find({ subjectid: req.params.sid })
                        .exec()
                        .then((list) => {
                            console.log(list);
                            for (var i = 0; i < list.length; i++) {
                                list[i] = list[i].studentid;
                            }
                            console.log(list);
                            Student.find(
                                { studentid: { $in: list } },
                                {
                                    firstname: 1,
                                    lastname: 1,
                                    department: 1,
                                    studentid: 1,
                                    semester: 1,
                                }
                            )
                                .exec()
                                .then((tlist) => {
                                    console.log(tlist);
                                    teacherlist = tlist;
                                    res.render('studentsenrolledlist', { students: tlist });
                                });

                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/admin/StudentProfiles', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Student.find(
                        {},
                        {
                            firstname: 1,
                            lastname: 1,
                            department: 1,
                            studentid: 1,
                            semester: 1,
                        }
                    )
                        .exec()
                        .then((slist) => {
                            studentlist = slist;

                            res.render('studentlist_adminview', { students: slist });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/admin/viewsubjects', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Subject.find(
                        {},
                        { subjectname: 1, department: 1, subjectid: 1, semester: 1 }
                    )
                        .exec()
                        .then((sublist) => {
                            studentlist = sublist;
                            res.render('subjectlist_adminview', { subject: sublist });
                        });
                }
            });
    }
});
app.post('/viewsubjects/subjectdetial/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        var scode = req.params.scode;
        Subject.findOne({ _id: scode })
            .exec()
            .then((sub) => {
                console.log(sub);
                res.render('subjectprofile', { detail: [sub] });
            });
    }
});

app.get('/admin/assignsubjects', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Teacher.find({}, { firstname: 1, lastname: 1, teacherid: 1 })
                        .exec()
                        .then((tlist) => {
                            teacherlist = tlist;
                            Subject.find({}, { subjectname: 1, _id: 1 })
                                .exec()
                                .then((sublist) => {
                                    subjectlist = sublist;
                                    res.render('assignsubjects', {
                                        subject: sublist,
                                        teacher: tlist,
                                    });
                                    //res.render("teacherlist_adminview", { students: tlist })
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});

app.get('/teacherlogin', function (req, res) {
    console.log(req.session.uniqueid);
    if (req.isAuthenticated()) {
        res.send('Tsuccess');
    } else {
        res.redirect('/index');
    }
});

app.get('/admin/addsubject', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an admin');
                } else {
                    res.render('registersubjects');
                }
            });
    }
});
app.post("/changepassword", function (req, res) {
    User.findOne({ _id: req.session.uniqueid }).then(user => {
        user.changePassword(req.body.oldpassword, req.body.newpassword).then(p => {
            res.redirect("/")
        })
    })
})

app.get('/studentHomePage', function (req, res) {
    if (req.isAuthenticated()) {
        console.log(req.session.uniqueid);
        Student.findOne({ _id: req.session.uniqueid }, { studentid: 1 })
            .exec()
            .then((stud) => {
                Subject_student_mapping.find({ studentid: stud.studentid })
                    .exec()
                    .then((ans) => {
                        subsenrolled = [];
                        for (var i = 0; i < ans.length; i++) {
                            subsenrolled.push(ans[i].subjectid);
                        }
                        console.log(subsenrolled);
                        Subject.find({ _id: { $in: subsenrolled } })
                            .exec()
                            .then((ans2) => {
                                console.log(ans2);
                                colNotifs = [
                                    {
                                        message:
                                            'College fest starts from 7th march along with shhf;adjfaldjfha;jdhfajsdfh',
                                    },
                                ];
                                teacherNotifs = [
                                    {
                                        message: 'Assignment postponed to adhfhaljfdhsl;ajfdsha',
                                    },
                                ];
                                res.render('studentHomePage', {
                                    subject: ans2,
                                    colNotif: colNotifs,
                                    teacherNotifs: teacherNotifs,
                                });
                            });
                    });
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/teacherHomePage', function (req, res) {
    if (req.isAuthenticated()) {
        console.log(req.session.uniqueid);
        Teacher.findOne({ _id: req.session.uniqueid }, { teacherid: 1 })
            .exec()
            .then((teach) => {
                Subject_teacher_mapping.find({ teacherid: teach.teacherid })
                    .exec()
                    .then((ans) => {
                        subsassigned = [];
                        for (var i = 0; i < ans.length; i++) {
                            subsassigned.push(ans[i].subjectid);
                        }
                        console.log(subsassigned);
                        Subject.find({ _id: { $in: subsassigned } })
                            .exec()
                            .then((ans2) => {
                                console.log(ans2);
                                colNotifs = [
                                    {
                                        message:
                                            'College fest starts from 7th march along with shhf;adjfaldjfha;jdhfajsdfh',
                                    },
                                ];
                                teacherNotifs = [
                                    {
                                        message: 'Assignment postponed to adhfhaljfdhsl;ajfdsha',
                                    },
                                ];
                                res.render('teacherHomePage', {
                                    subject: ans2,
                                    colNotif: colNotifs,
                                    teacherNotifs: teacherNotifs,
                                });
                            });
                    });
            });
    } else {
        res.redirect('/index');
    }
});

app.get('/testroute2', function (req, res) {
    console.log(req.body);
});
app.post('/testroute2', function (req, res) {
    console.log(req.body);
});
app.post('/assignsubjects', function (req, res) {
    console.log(req.body);
    Subject_teacher_mapping.create({
        _id: { teacherid: req.body.tid, subjectid: req.body.scode },
        teacherid: req.body.tid,
        subjectid: req.body.scode,
    })
        .then(res.redirect('/admin/assignsubjects'))
        .catch((err) => {
            console.log(err);
        });
});

app.post('/enrollsubject', function (req, res) {
    Subject_student_mapping.create({
        _id: { studentid: req.body.studid, subjectid: req.body.subcode },
        studentid: req.body.studid,
        subjectid: req.body.subcode,
    });
});

app.get('/enrollsubject', function (req, res) {
    Student.findOne({ _id: req.session.uniqueid }, { semester: 1, studentid: 1 })
        .exec()
        .then((sem) => {
            Subject.find({ semester: sem.semester }, {})
                .exec()
                .then((subjects) => {
                    console.log(sem.studentid);
                    res.render('subjectenroll', {
                        subject: subjects,
                        studid: sem.studentid,
                    });
                });
        });
});
app.post('/uploadimage', upload.single('image'), (req, res) => {
    imgModel.findOne({ _id: req.session.uniqueid }).then((a) => {
        var imgname = a.fname;
        console.log(imgname);
        console.log(imgname.length);
        if (imgname.length < 3) {
            console.log('reacher till here');
            console.log(req.file);
            imgModel
                .findOneAndUpdate(
                    { _id: req.session.uniqueid },
                    {
                        fname: req.file.filename,
                        img: {
                            data: fs.readFileSync(
                                path.join(__dirname + '/uploads/' + req.file.filename)
                            ),
                            contentType: 'image/png',
                        },
                    }
                )
                .then((p) => {
                    //console.log(p)
                    User.findOne({ _id: req.session.uniqueid }).then((use) => {
                        console.log(use);
                        if (use.status == 1) {
                            console.log('Aaaa');
                            console.log(use);
                            res.redirect('/admin/userProfile');
                        } else if (use.status == 2) {
                            res.redirect('/teacher/userProfile');
                        } else if (use.status == 3) {
                            res.redirect('/student/userProfile');
                        }
                    });
                });
        } else {
            console.log('reacher here');
            console.log(imgname);
            fs.unlinkSync(__dirname + '/uploads' + '/' + imgname);
            console.log(a);
            imgModel
                .findOneAndUpdate(
                    { _id: req.session.uniqueid },
                    {
                        fname: req.file.filename,
                        img: {
                            data: fs.readFileSync(
                                path.join(__dirname + '/uploads/' + req.file.filename)
                            ),
                            contentType: 'image/png',
                        },
                    }
                )
                .then((v) => {
                    User.findOne({ _id: req.session.uniqueid }).then((use) => {
                        console.log(use);
                        if (use.status == 1) {
                            console.log('Aaaa');
                            console.log(use);
                            res.redirect('/admin/userProfile');
                        } else if (use.status == 2) {
                            res.redirect('/teacher/userProfile');
                        } else if (use.status == 3) {
                            res.redirect('/student/userProfile');
                        }
                    });
                    console.log(v);
                })
                .catch((cat) => {
                    console.log(cat);
                });
        }
    });
});
app.get('/admin/userProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Admin.findOne(
                        { _id: req.session.uniqueid },
                        { firstname: 1, lastname: 1, gender: 1, dob: 1, adminid: 1 }
                    )
                        .exec()
                        .then((arr) => {
                            ar = [arr];
                            imgModel
                                .findOne({ _id: req.session.uniqueid })
                                .exec()
                                .then((mg) => {
                                    res.render('userProfile', { detail: ar, image: mg });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/viewdetails/student/:sid', function (req, res) {
    if (req.isAuthenticated()) {
        Student.findOne(
            { studentid: req.params.sid },
            { firstname: 1, lastname: 1, gender: 1, dob: 1, studentid: 1 }
        )
            .exec()
            .then((arr) => {
                ar = [arr];
                res.render('viewdetailsstudent', { detail: ar });
            });
    } else {
        res.redirect('/index');
    }
});
app.post('/admin/viewdetails/teacher/:tid', function (req, res) {
    if (req.isAuthenticated()) {
        Teacher.findOne(
            { teacherid: req.params.tid },
            { firstname: 1, lastname: 1, gender: 1, dob: 1, teacherid: 1 }
        )
            .exec()
            .then((arr) => {
                ar = [arr];
                res.render('viewdetailsteacher', { detail: ar });
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/admin/editUserProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status != 1) {
                    res.send('Not an Admin');
                } else {
                    Admin.findOne(
                        { _id: req.session.uniqueid },
                        { firstname: 1, lastname: 1, gender: 1, dob: 1, adminid: 1 }
                    )
                        .exec()
                        .then((arr) => {
                            ar = [arr];
                            imgModel
                                .findOne({ _id: req.session.uniqueid })
                                .exec()
                                .then((mg) => {
                                    res.render('editUserProfile', { student: ar, image: mg });
                                });
                        });
                }
            });
    } else {
        res.redirect('/index');
    }
});
app.get('/student/editUserProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 3) {
                    Student.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('editStudentProfile', { student: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.post('/studenteditUserProfile', function (req, res) {
    console.log(req.body)
    if (req.isAuthenticated()) {
        Student.findOneAndUpdate({ _id: req.session.uniqueid }, {
            phonenumber: req.body.phonenumber,
            dob: req.body.dob
        }).then(stud => {
            console.log(stud)
            res.redirect("/student/userProfile")
        })
    }
});
app.post('/admineditUserProfile', function (req, res) {
    console.log(req.body)
    if (req.isAuthenticated()) {
        Admin.findOneAndUpdate({ _id: req.session.uniqueid }, {
            phonenumber: req.body.phonenumber,
            dob: req.body.dob
        }).then(admin => {
            console.log(admin)
            res.redirect("/admin/userProfile")
        })
    }
});
app.post('/teachereditUserProfile', function (req, res) {
    console.log(req.body)
    if (req.isAuthenticated()) {
        Teacher.findOneAndUpdate({ _id: req.session.uniqueid }, {
            phonenumber: req.body.phonenumber,
            dob: req.body.dob
        }).then(teacher => {
            console.log(teacher)
            res.redirect("/teacher/userProfile")
        })
    }
});

app.get('/teacher/editUserProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Teacher.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('editTeacherProfile', { teacher: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.get('/student/userProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 3) {
                    Student.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('studentviewprofile', { detail: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.get('/teacher/userProfile', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Teacher.findOne({ _id: user._id }).then((p) => {
                        imgModel.findOne({ _id: req.session.uniqueid }).then((ig) => {
                            res.render('teacheruserProfile', { detail: [p], image: ig });
                        });
                    });
                }
            });
    }
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/index');
});


//*********** */
// SPRINT-2 
//********** */
app.get('/teacher/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Subject.findOne({ _id: req.params.scode }, { assignments: 1 }).then(asslist => {
                        console.log(asslist)
                    })
                }
            });
    }
});
app.get('/teacher/:scode/:acode', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Subject.findOne({ _id: req.params.scode }, { "assignments": { $elemMatch: { assignment_file_code: req.params.acode } } }).then(asslist => {
                        console.log(asslist.assignments[0].submissions)
                    })
                }
            });
    }
});
app.get('/teacher/createassignment/:scode', function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    res.render("pagename", req.params.scode)
                }
            });
    }
});
//, { "assignments": { $elemMatch: { $elemMatch: { "submissions.studentid": "S097" } } } }
app.get("/fck", function (req, res) {
    console.log("A")
    Subject.findOne({ _id: "TEST101" }, { "assignments": { $elemMatch: { "submissions.studentid": "S097" } } }).then(asslist => {
        console.log(asslist)
    })
})
app.get('/teacher/performance', function (req, res) {
    console.log("Abcdefg")
    /*
    if (req.isAuthenticated()) {
        User.findOne({ _id: req.session.uniqueid })
            .exec()
            .then((user) => {
                if (user.status == 2) {
                    Subject.findOne({ _id: "TEST101" }).then(asslist => {
                        console.log(asslist)
                    })
                }
            });
    }
    */
});

app.post("/assignmentupload", upload.single('file'), (req, res) => {
    console.log("called")
    createfileid().then(filecode => {
        var obj = {
            filecode: filecode,
            file: fs.readFileSync(
                path.join(__dirname + '/uploads/' + req.file.filename)
            )
        };
        Uploadfile.create(obj).then(uploaded => {
            var obj2 = {
                assignment_file_code: filecode
            }
            subid = "TEST101" //req.body.subjectid
            Subjects.findOneAndUpdate({ _id: subid }, {
                $push: { assignments: obj2 }
            }).then(uploaded_ass => {
                res.redirect("/filetest")
            })
        })
    })
})
app.post("/submitassignment", upload.single('file'), (req, res) => {
    console.log("called")
    createfileid().then(filecode => {
        var obj = {
            filecode: filecode,
            file: fs.readFileSync(
                path.join(__dirname + '/uploads/' + req.file.filename)
            )
        };
        Uploadfile.create(obj).then(uploaded => {
            var obj2 = {
                answer_file_code: filecode,
                evaluated: false,
                studentid: "S097"
            }
            subid = "TEST101" //req.body.subjectid
            assignmentcode = 5   //req.body.assignmentcode
            jsonobj = {}
            jsonobj["assignments.$.submissions"] = obj2
            Subjects.findOneAndUpdate({ "assignments.assignment_file_code": assignmentcode }, {
                $push: jsonobj
            }).then(submitted_ass => {
                res.redirect("/filetest")
            })
        })
    })
})

































app.listen(3000, function () {
    console.log('Server is running');
});
