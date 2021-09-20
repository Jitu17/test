const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const ejs = require("ejs");
const flash = require("connect-flash");
const session = require("express-session");
const bcrypt = require('bcryptjs');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;
const {
  ensureAuthenticated
} = require("./auth");


const app = express();

//ejs
// app.set("view engine", "ejs");

//bodyParser
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());


// express session
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

// global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
  //connect to mongodb
mongoose.connect("mongodb://localhost:27017/appDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  //users collection
const userSchema = new mongoose.Schema({
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: Number,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
  });


  userSchema.plugin(passportLocalMongoose);

 const User = new mongoose.model("User", userSchema);

// const Complain = new mongoose.model("Complain", complainSchema);

// const Notice = new mongoose.model("Notice", noticeSchema);

passport.use(
  new LocalStrategy({
    usernameField: "username"
  }, (username, password, done) => {
    //match user
    User.findOne({
        username: username
      })
      .then(user => {
        if (!user) {
          return done(null, false, {
            message: "That email is not registered"
          });
        }
        //match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Password incorrect"
            });
          }
        });
      })
      .catch(err => console.log(err));
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

  //register page
app.get("/", function(req, res) {
    res.render("register");
  });

  //register handle
app.post("/", function(req, res) {
    const {
      firstname,
      lastname,
      email,
      phone,
      password
    } = req.body;
    let errors = [];
  
    //check required fields
    if (!firstname || !lastname || !username || !jdate || !cname || !phone || !age || !password) {
      errors.push({
        msg: "Please fill in all the fields"
      });
    }
  
    //check phone number
    if(phone.length != 10){
      errors.push({
        msg: "phone number is not valid"
      });
    }
  
    //check password length
    if (password.length < 6) {
      errors.push({
        msg: "Password should be atleast 6 characters"
      });
    }
    if (errors.length > 0) {
      res.render("register", {
        errors,
        firstname,
        lastname,
        email,
        phone,
        password
      });
    } else {
      //validation passed
      User.findOne({
          username: username
        })
        .then(user => {
          if (user) {
            //user exists
            errors.push({
              msg: "Email is already registered"
            });
            res.render("register", {
              errors,
              firstname,
              lastname,
              email,
              phone,
              password
            });
          } else {
            const newUser = new User({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email,
              phone: req.body.phone,
              password: req.body.password
            });
            //hash password
            bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                //set password to hash
                newUser.password = hash;
                // save user
                newUser.save()
                  .then(user => {
                    res.render("success");
                  })
                  .catch(err => console.log(err));
              }));
          }
        });
    }
  });

  //port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("server has started successfull on port :", port);
});
