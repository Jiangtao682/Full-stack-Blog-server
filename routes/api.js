var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let commonmark = require('commonmark');
let reader = new commonmark.Parser();
let writer = new commonmark.HtmlRenderer();
let jwt = require('jsonwebtoken');

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'BlogServer';
const client = new MongoClient(url, {useNewUrlParser: true});


router.get('/:username', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token == null)
    res.status(401).send('Unauthorized!');
  else {
    var decoded = jwt.verify(token, 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c')
    if (decoded.usr != req.params.username || decoded.exp * 1000 <= Date.now()) {
      res.status(401).send('Unauthorized!');
    } else {
      console.log('received username');
      let username = req.params.username;
      client.connect(function(err) {
        assert.equal(null, err);
        db = client.db(dbName);
        console.log("Connected successfully to server");
        db.collection('Posts').find({
          'username': username,
        }).sort({
          'postid': 1
        }).toArray(function (err, docs) {
          assert.equal(null, err);
          console.log("Found the following records");
          console.log(docs);
          res.status(200);
          res.json(docs);
        });
      });
    }
  }
});


router.get('/:username/:postid', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token == null)
    res.status(401).send('Unauthorized!');
  else {
    var decoded = jwt.verify(token, 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c')
    if (decoded.usr != req.params.username || decoded.exp * 1000 <= Date.now()) {
      res.status(401).send('Unauthorized!');
    } else {
      console.log('received username');
      let username = req.params.username;
      let postid = req.params.postid;
      client.connect(function(err) {
        assert.equal(null, err);
        db = client.db(dbName);
        console.log("Connected successfully to server");
        db.collection('Posts').findOne({
          'username': username,
          'postid' : postid
        }).then(function (doc) {
          assert.equal(null, err);
          console.log("Found the following records");
          console.log(doc);
          if (doc != null) {
            res.status(200);
            res.json(doc);
          }else{
            next(createError(404));
          }
        });
      });
    }
  }
});

router.post('/:username/:postid', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token == null)
    res.status(401).send('Unauthorized!');
  else {
    var decoded = jwt.verify(token, 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c')
    if (decoded.usr != req.params.username || decoded.exp * 1000 <= Date.now()) {
      res.status(401).send('Unauthorized!');
    } else {
      console.log('received username');
      let username = req.params.username;
      let postid = parseInt(req.params.postid, 10);
      if (isNaN(postid) || req.body.title === undefined || req.body.body === undefined) {
        res.sendStatus(400);
        return
      }
      let post = {
        "username": username,
        "postid": postid,
        "title": req.body.title,
        "body": req.body.body,
        "created": Date.now(),
        "modified": Date.now()
      };
      let query = {
        'username': username,
        'postid': postid
      };
      let update = {
        $setOnInsert: post
      };
      client.connect(function(err) {
        assert.equal(null, err);
        db = client.db(dbName);
        console.log("Connected successfully to server");
        db.collection('Posts').updateOne(query, update, {
          upsert: true
        }, function (err,result) {
          if (err) throw err;
          if (result.matchedCount !== 0) {
            res.sendStatus(400);
            return;
          }
          console.log("One document inserted");
          res.sendStatus(201);
        });
      });
    }
  }
});

router.put('/:username/:postid', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token == null)
    res.status(401).send('Unauthorized!');
  else {
    var decoded = jwt.verify(token, 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c')
    if (decoded.usr != req.params.username || decoded.exp * 1000 <= Date.now()) {
      res.status(401).send('Unauthorized!');
    } else {
      console.log('received username');
      let username = req.params.username;
      let postid = parseInt(req.params.postid, 10);
      if (isNaN(postid) || req.body.title === undefined || req.body.body === undefined) {
        res.sendStatus(400);
        return
      }
      let update = {
        $set:{
          "title": req.body.title,
          "body": req.body.body,
          "modified": Date.now()
        }
      };
      let query = {
        'username': username,
        'postid': postid
      };
      client.connect(function(err) {
        assert.equal(null, err);
        db = client.db(dbName);
        console.log("Connected successfully to server");
        db.collection('Posts').updateOne(query, update, function (err, result) {
          if (err) throw err;
          if (result.matchedCount !== 0) {
            res.sendStatus(400);
            return;
          }
          console.log("One document updated");
          res.sendStatus(200);
        });
      });
    }
  }
});


router.delete('/:username/:postid', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token == null)
    res.status(401).send('Unauthorized!');
  else {
    var decoded = jwt.verify(token, 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c')
    if (decoded.usr != req.params.username || decoded.exp * 1000 <= Date.now()) {
      res.status(401).send('Unauthorized!');
    } else {
      console.log('received username');
      let username = req.params.username;
      let postid = parseInt(req.params.postid, 10);
      if (isNaN(postid)) {
        res.sendStatus(400);
        return
      }
      let query = {
        'username': username,
        'postid': postid
      };
      client.connect(function(err) {
        assert.equal(null, err);
        db = client.db(dbName);
        console.log("Connected successfully to server");
        db.collection('Posts').deleteOne(query, function (err, result) {
          if (err) throw err;
          if (result.matchedCount !== 0) {
            res.sendStatus(400);
            return;
          }
          console.log("One document deleted");
          res.sendStatus(200);
        });
      });
    }
  }
});


module.exports = router;
