var express = require('express');
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

function getDocs(res, username, start_id, callback){
  let next_id = null;
  let posts = [];
  if (start_id == null){
    start_id = Number.NEGATIVE_INFINITY;
  }else{
    start_id = parseInt(start_id, 10);
  }
  client.connect(function(err) {
    assert.equal(null, err);
    db = client.db(dbName);
    console.log("Connected successfully to server");
    db.collection('Posts').find({
      'username': username,
      'postid' : {
        $gte: start_id
      }
    }).sort({
      'postid': 1
    }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log('find all document');
      console.log(docs);
      if (docs.length > 3) {
        next_id = docs[3].postid;
        docs = docs.slice(0, 3);
      }
      for (let doc of docs) {
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
      }
      res.render('blogServer', {
        username: username,
        posts: posts,
        next: next_id
      });
    });
  });
}

/* GET users listing. */
router.get('/:username', function(req, res, next) {
  console.log("get username.");
  let username = req.params.username;
  let start_id = req.query.start;
  if (start_id == null){
    getDocs(res, username, start_id);
  } else{
    getDocs(res, username, start_id);
  }
});

router.get('/:username/:postid', function(req, res, next) {
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
      }
      res.render('blogServer', {
        username: username,
        posts: posts,
        next: null
      });
    });
  });
});

module.exports = router;


