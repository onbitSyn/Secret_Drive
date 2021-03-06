import dotenv = require("dotenv");
dotenv.config();


import express = require("express");
import session = require("express-session");
import path = require("path");
import bodyParser = require("body-parser")
import morgan = require("morgan");
import cookieParser = require("cookie-parser");
import flash = require("connect-flash");

import passport = require("passport");

import {router as memberController} from "./api/member"; 
import {router as dashboardController} from "./api/dashboard";
import * as passportConfig from "./services/passport";


const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/../views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge : 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passportConfig.configStrategy(passport);



app.use(express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "/views"));



app.use(function (req, res, next) {
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.error = req.flash("error");
  next();
});

/**
 * primary app routes
 */


app.use("/member", memberController);
app.use("/dashboard", passportConfig.isAuthenticated, dashboardController); 

// app.get("/signup",userController.getSignup);
// app.post("/signup",userController.postSignup);
// app.get("/login", userController.getLogin);
// app.post("/login",userController.postLogin);
// app.get("/logout",passportConfig.isAuthenticated,userController.getLogout);
// app.get("/thankyou", passportConfig.isAuthenticated, userController.getThankyou);

// app.get("/dashboard", passportConfig.isAuthenticated, dashboardController.getAccount);
// app.get("/createnewteam", passportConfig.isAuthenticated, dashboardController.getCreateNewTeam);
// app.post("/createnewteam", passportConfig.isAuthenticated, dashboardController.postCreateNewTeam);
// app.get("/notifications", passportConfig.isAuthenticated, dashboardController.getNotifications);
// app.post("/joinTeam",passportConfig.isAuthenticated, dashboardController.joinTeam);
// app.get("/myTeams", passportConfig.isAuthenticated, dashboardController.getMyTeams);


// app.post("/askfrommembers",passportConfig.isAuthenticated, driveController.postAskFromMembers);
// app.post("/allowMember",passportConfig.isAuthenticated, driveController.postAllowMember);
// app.post("/openDrive",passportConfig.isAuthenticated, driveController.postOpenDrive);
// app.get("/closedrive/:drivename",passportConfig.isAuthenticated, driveController.closeDrive);
// app.get("/opendrive", passportConfig.isAuthenticated, driveController.getOpenDrive);
// app.get("/drive/:drivename/:directory", passportConfig.isAuthenticated, driveController.getDrive);
// app.post("/newfolder/:drivename/:directory",passportConfig.isAuthenticated, driveController.postNewFolder);
// app.post("/newfile/:drivename/:directory", passportConfig.isAuthenticated, driveController.postNewFile);
// //app.post("/uploadfile/:drivename/:directory", passportConfig.isAuthenticated, driveController.fileUpload);
// app.post("/command",passportConfig.isAuthenticated, commandController.command);


export default app;