var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let commonmark = require('commonmark');
let reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'BlogServer';
const client = new MongoClient(url, {useNewUrlParser: true});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});



router.get('/sss', function(req, res, next) {
  console.log("get username.");
  let username = req.params.username;
  let postid = parseInt(req.params.postid, 10);
  let posts = [];
  client.connect(function(err) {
    assert.equal(null, err);
    db = client.db(dbName);
    console.log("Connected successfully to server");
    db.collection('Posts').findOne({
      'username': username,
      'postid': postid
    }).then(function(doc){
      assert.equal(err, null);
      console.log('find document');
      console.log(doc);
      if (doc != null) {
        let title = doc.title;
        let parsedTitle = reader.parse(title);
        let res_title = writer.render(parsedTitle);
        let body = doc.body;
        let parsedBody = reader.parse(body);
        let res_body = writer.render(parsedBody);
        let each_doc = {
          title: res_title,
          body: res_body
        };
        posts.push(each_doc);
        res.render('blogServer', {
          username: username,
          posts: posts,
          next: null
        });
      }else{
        next(createError(404));
      }
    });
  });
});

module.exports = router;

