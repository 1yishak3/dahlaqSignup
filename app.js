var jsdom = require('jsdom');
require('amd-loader');
var window = jsdom.jsdom().defaultView;
var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
    cons = require('consolidate'),
  // dust = require('dustjs-helpers'),
    firebase = require('firebase'),
    fbs = require('./dist/firebase');


var config = {
    apiKey: "AIzaSyCYT5qaezgIxItyCT_idaM0rXNnKA9eBMY",
    authDomain: "dahlaq-c7e0f.firebaseapp.com",
    databaseURL: "https://dahlaq-c7e0f.firebaseio.com",
    projectId: "dahlaq-c7e0f",
    storageBucket: "dahlaq-c7e0f.appspot.com",
    messagingSenderId: "500593695235"
};
firebase.initializeApp(config);
// firebase.auth().languageCode = 'node';
app = express();

app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', function(req, res) {
    // $(html).find('#verify').setElementClass('orange');
    // console.log(fbs.emailify('0932323232'));

    res.render('index');
});

app.post('/captcha/', function (req, res) {
    // console.log("Hello");
   fbs.recaptcha('verify');
});

app.get('/sms/', function(req, res) {
    res.render('sms');
});


app.listen(3000, function() {
    console.log("Server started at port 3000.")
});
