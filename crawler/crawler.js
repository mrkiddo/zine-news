var mongoose = require('mongoose');
var async = require('async');
var Promise = require('promise');
var config = require('../config/config');
var dataConfig = require('../config/dataConfig');
var Procedures = require('./modules/procedures');
var logger = require('./modules/loggers');

mongoose.Promise = Promise;
mongoose.connect(config.database);

var lists = dataConfig.categories;

var crawler = function () {
    var executeTime = logger.executeTime();
    var processor = function (item, callback) {
        var p = Procedures();
        p.run(item).then(function (count) {
            callback(null, count);
        }, function (error) {
            callback(error);
        });
    };

    logger.c.log('info', 'Crawler: Start');

    async.mapLimit(lists, 1, processor, function (err, results) {
        var newAddCounter = 0;
        if(err && err.length > 0) {
            err.forEach(function (er) {
                logger.c.error('Crawler: Error happened during a procedure', er);
            });
        }
        if(results && results.length > 0) {
            newAddCounter = results.reduce(function (init, current) {
                return init += current;
            }, 0);
        }
        logger.c.log('info', 'Crawler: Finish', executeTime.end());
        logger.c.log('info', 'Crawler: Add ' + newAddCounter + ' items');
    });
};

module.exports = crawler;