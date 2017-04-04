var mongoose = require('mongoose');
var async = require('async');
var Promise = require('promise');
var promiseTimeout = require('promise-timeout');
var config = require('../config/config');
var dataConfig = require('../config/dataConfig');
var Procedures = require('./modules/procedures');
var logger = require('./modules/loggers');

var lists = dataConfig.categories;
var dbConnector = function (mongoose) {
    // if db not connected
    if(mongoose.connection.readyState === 0) {
        mongoose.Promise = Promise;
        mongoose.connect(config.database);
    }
};

var crawler = function (cfg) {
    dbConnector(mongoose);
    lists = lists.map(function (item) {
        return Object.assign(item, cfg);
    });
    var executeTime = logger.executeTime();
    var processor = function (item, callback) {
        var p = Procedures();
        promiseTimeout.timeout(p.runAPI(item), config.crawlerTimeout).then(function (count) {
            callback(null, count);
        }, function (error) {
            callback(null, 0);
        });
    };

    logger.c.log('info', 'Crawler: Start');

    async.map(lists, processor, function (err, results) {
        var newAddCounter = 0;
        if(err && err.length > 0) {
            err.forEach(function (er) {
                logger.c.error('Crawler: Error happened during a procedure', er);
            });
        }
        if(results && results.length > 0) {
            newAddCounter = results.reduce(function (init, current) {
                if(current) {
                    init += parseInt(current, 10);
                }
                return init;
            }, 0);
        }
        logger.c.log('info', 'Crawler: Finish', executeTime.end());
        logger.c.log('info', 'Crawler: Add ' + newAddCounter + ' items');
    });
};

module.exports = crawler;