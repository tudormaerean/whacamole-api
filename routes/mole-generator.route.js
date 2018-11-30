var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');

router.post('/', function (req, res) {
  var index = req.body.id;
  var color = null;

  function generateRGBValue (upperLimit) {
    return Math.floor(Math.random() * upperLimit);
  }

  color = 'rgb(' + generateRGBValue(255) + ',' + generateRGBValue(255) + ',' + generateRGBValue(255) + ')';

  var responseObj = {
    id: index,
    color: color
  };

  res.send(responseObj).end();
});

module.exports = router;