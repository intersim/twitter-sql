'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var indexModel = require('../models');
var User = indexModel.User;
var Tweet = indexModel.Tweet;

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    Tweet.findOne()
    .then(function(allTweets) {
      console.log("This is the allTweets: ", allTweets);
      res.render('index', {
      title: 'Twitter.js',
      tweets: allTweets,
      username: allTweets,
      showForm: true
    })
  });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    Tweet.findAll({ 
      include: [{
        model: User,
        where: { name: req.params.username } 
        }]
  })
    .then(function (data) {      
      res.render('index', {
        title: 'Twitter.js',
        tweets: data,
        showForm: true,
        username: data[0].User.name,
        pictureUrl: data[0].User.pictureUrl
      })
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsWithThatId // an array of only one element ;-)
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var newTweet = tweetBank.add(req.body.name, req.body.text);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
