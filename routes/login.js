var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let commonmark = require('commonmark');
let reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();

let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'BlogServer';
const client = new MongoClient(url, {useNewUrlParser: true});


router.get('/', function(req, res, next){
  let redirect = req.query.redirect;
  res.render('login', {
    redirect: redirect
  });
});

/* GET home page. */
router.post('/', function(req, res, next) {
  let username = req.body.username;
  let inputPassword = req.body.password;
  let redirect = req.body.redirect;
  client.connect(function(err) {
    assert.equal(null, err);
    db = client.db(dbName);
    console.log("Connected successfully to server");
    db.collection('Users').findOne({
      'username': username
    }).then(function(doc){
      assert.equal(err, null);
      console.log('find document');
      console.log(doc);
      if (doc != null) {
        let passwordToCheck = doc.password;
        bcrypt.compare(inputPassword, passwordToCheck, function (err, result) {
          if (result == true){
            let start = new Date();
            start.setHours(start.getHours() + 2);
            console.log(start);
            let payload = {
              "exp": start.getTime(),
              "usr": username
            };
            let secretKey = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";
            let options = { algorithm: "HS256"};
            let token = jwt.sign(payload, secretKey, options);
            console.log("assembled token as follows:")
            console.log(token);
            res.cookie('jwt', token);
            if (redirect != null) {
              res.redirect(redirect);
            } else {
              res.status(200);
              res.send('the authentication is successful.');
            }
          }else{
            res.status(401);
            res.render('login', {
              redirect: redirect
            });
          }
        });
      }else{
        res.status(401);
        res.render('login', {
          redirect: redirect
        });
      }
    });
  });
});


module.exports = router;

