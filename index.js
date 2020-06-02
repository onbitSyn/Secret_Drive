const express = require('express');
const path = require('path');
const https = require('https');   
const fs = require('fs');
const promise = require('bluebird');
const db = promise.promisifyAll(require('./db'));
const logger = require('morgan');
const authentication = require('./routes/authentication');
const passport = require('passport');
const strategy = require('./strategy');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const config = require('./config');
const createNewTeam = require('./routes/createNewTeam');
const notifications = require('./routes/notifications').routes;
const myTeams  = require('./routes/myTeams');
const createFtpConnection = require('./routes/createFtpConnection');


const app = express();

const server = https.createServer({
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('public-cert.pem')
},app); 

const port = process.env.PORT || 3456;

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser(config.cookie.secret));

app.use(session({
	secret : config.session.secret,
    maxAge : 24 * 60 * 60 * 1000,
    resave : true,
    saveUninitialized : true,
    cookie:{secure:true}
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//setting the passport local strategy..

strategy.x(passport);

app.use(express.static(path.join(__dirname,'/public')));

app.use(function(req,res,next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
})

const checkAuthenticated  = function(req,res,next) {
    if(req.isAuthenticated()) {
        console.log(req.session.passport.user);
        res.set('Cache-control','no-cache, private, no-store, must-revalidate, post-check=0,pre-check=0');
        return next();
    }
    else {
        res.redirect('/login');
    }
}


app.get('/',authentication);
app.get('/login',authentication);
app.post('/register',authentication);
app.post('/login',authentication);
app.get('/home',checkAuthenticated,authentication);
app.get('/createNewTeam',checkAuthenticated,createNewTeam);
app.post('/createNewTeam',checkAuthenticated,createNewTeam);
app.get('/logout',checkAuthenticated,authentication);
app.get('/notifications',checkAuthenticated, notifications);
app.post('/joinTeam',checkAuthenticated,notifications);
app.post('/allowMember',checkAuthenticated,notifications);
app.get('/myTeams',checkAuthenticated,myTeams);
app.post('/askMembers',checkAuthenticated,notifications);
app.post('/openTeamDrive',checkAuthenticated,notifications);
app.get('/createFtpConnection',checkAuthenticated,createFtpConnection);

server.on('close', () => {
	console.log('Closed express server')

	db.pool.end(() => {
		console.log('Shut down connection pool')
	})
})

console.log(`Server started at https://localhost:${port}/`);
server.listen(port);
