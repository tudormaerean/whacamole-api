var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: "Eliza's Game" });
  res.json({error: 'No index file resides here...'});
});

module.exports = router;