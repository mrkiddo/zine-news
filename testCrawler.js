var mongoose = require('mongoose');
var Promise = require('promise');
var schedule = require('node-schedule');

var crawler = require('./crawler/crawler');

var rule = new schedule.RecurrenceRule();
rule.minute = [10, 20, 30, 40, 50, 60];

var j = schedule.scheduleJob(rule, function () {
    crawler({
        pageLimit: 1,
        requestTimeout: 10 * 1000
    });
});
