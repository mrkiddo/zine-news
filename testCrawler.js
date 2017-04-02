var mongoose = require('mongoose');
var Promise = require('promise');
var Article = require('./models/Article');
var crawler = require('./crawler/crawler');

var helpers = require('./crawler/modules/helpers');

crawler({
    pageLimit: 1
});
