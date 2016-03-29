'use strict';

const bodyParser = require('body-parser'),
	  express = require('express'),
	  app = express(),
	  logger = require("log4js").getLogger("web"),
	  config = require('./config')
;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'ejs');
app.set("view options", { layout: true });

app.use(express.static('app/public'));
app.use('/bower',express.static('bower_components'));

app.get('/', function (req, res) {
	//res.render('index',{});
    res.redirect('/crud');
});

app.listen(config.port, function () {
	logger.trace('App started [port: %s]', config.port);
});

module.exports = {
	app : app
}
