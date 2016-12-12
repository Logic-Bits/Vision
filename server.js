require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));


var pjax 	= require('express-pjax');	//express pjax (partial reloads)
var hbs 	= require('express-hbs');	//express handlebars
var moment	= require('moment');		//moment date formatting lib

//pjax middleware for partials
app.use(pjax());

//send session info to handlebars, check OS used to send correct stylesheet
app.use(function(req, res, next){

	var ua = req.headers['user-agent'];
	req.session.isAndroid = false; // (ua.match(/Android/i) != null);
	req.session.isIos = false; // (ua.match(/iPhone|iPad|iPod/i) != null);
	req.session.isDev = (process.env.NODE_ENV !='production');
	req.session.test = (process.env.NODE_ENV);

	res.locals.session = req.session;

	next();
});

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate',
    '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.api.controller'));
app.use('/api/usecases', require('./controllers/api/usecases.api.controller'));

app.use('/app/js', express.static('./node_modules/ng-content-editable/dist'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

//helper to get the icon for a item type
hbs.registerHelper("getIconForType", function(type) {
	return bc.getIconForType(type);
});

//helper to get the stylesheet for the current user agent
hbs.registerHelper("getCSSforOS", function(session) {
	var bootCardsBase = "//cdnjs.cloudflare.com/ajax/libs/bootcards/1.1.2/css/";
	if (session.isAndroid) {
		return '<link href="' + bootCardsBase + 'bootcards-android.min.css" rel="stylesheet" type="text/css" />';
	} else if (session.isIos) {
		return '<link href="' + bootCardsBase + 'bootcards-ios.min.css" rel="stylesheet" type="text/css" />';
	} else {
		return '<link href="' + bootCardsBase + 'bootcards-desktop.min.css" rel="stylesheet" type="text/css" />';
	}
});

hbs.registerHelper("isMobile", function(session) {
	return '<script>var isDesktop = ' + (!session.isIos && !session.isAndroid) + ';</script>';
});

//helper to get the app version
hbs.registerHelper("getAppVersion", function() {
	return pjson.version;
});

// // development only
// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }

// start server
var server = app.listen(3000, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});
