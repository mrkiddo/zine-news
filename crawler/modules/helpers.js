var fs = require('fs');
var request = require('request');
var Promise = require('promise');
var $ = require('cheerio');

var helpers = {};

helpers.randomNumber = function (m, n) {
    m = m || 1000;
    n = n || 9999;
    return Math.ceil(Math.random() * (n - m) + m);
};

helpers.toJSON = function (obj) {
    var json = '';
    try {
        json = JSON.stringify(obj);
    } catch(err) {};
    return json;
};

helpers.dateFilter = function (dateStr) {
	dateStr = dateStr || '';
	if(dateStr.length === 0) {
		return dateStr;
	}
	var reg = /(\b[0-9]*\b)+/g;
	var result  = dateStr.match(reg);
	if(!result || result.length === 3) {
		return dateStr;
	}
	return new Date(result.join('/'));
};

helpers.dateCompare = function (a, b) {
	a = new Date(a);
	b = new Date(b);
	if(a > b) {
		return 1;
	}
	else if ((a - b) == 0) {
		return 0;
	}
	else {
		return -1;
	}
};

helpers.saveToFile = function (fileName, data) {
    return new Promise(function (resolve, reject) {
        var writeFile = fs.createWriteStream(fileName);
        writeFile.write(data);
        writeFile.end();
        writeFile.on('finish', function () {
            this.close();
            resolve();
        });
        writeFile.on('error', function () {
            this.close();
            reject(new Error('write file error'));
        });
    });
};

helpers.readFromFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (error, data) {
            if(error) {
                reject(error);
            }
            else {
                resolve(data.toString());
            }
        });
    });
};

helpers.getPageBody = function (pageUrl, timeout) {
    timeout = timeout || 4 * 1000;
    var processor = function (resolve, reject) {
        request({
            url: pageUrl,
            method: 'GET',
            timeout: timeout
        }, function (error, response, body) {
            if(error) {
                reject(error);
            }
            else {
                resolve(body);
            }
        });
    };
    return new Promise(processor);
};

module.exports = helpers;