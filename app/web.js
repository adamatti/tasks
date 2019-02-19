const bodyParser = require('body-parser'),
	  express = require('express'),
	  app = express(),
	  config = require('./config'),
      session = require('express-session'),
	  basicAuth = require('basic-auth-connect'),
	  logger = require("./log")("web")
;

logger.trace("loading web")

app.use(basicAuth(config.admin.user, config.admin.pass));
app.use(session({secret: config.expressSessionSecret}));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

////////////////////////////////////////////////////////////////////////////// Ejs config
app.set('view engine', 'ejs');
app.set("view options", { layout: true });

////////////////////////////////////////////////////////////////////////////// Public folders
app.use(express.static('app/public'));
app.use('/bower',express.static('bower_components'));

////////////////////////////////////////////////////////////////////////////// Global Routes
app.get("/health", (req,res) => {
	res.json({status:'ok'}).end()
})

app.get('/', function (req, res) {
	//res.render('index',{});
    res.redirect('/index.html');
});

module.exports = {
	app
}
