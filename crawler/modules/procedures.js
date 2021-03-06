var async = require('async');
var $ = require('cheerio');
var Promise = require('promise');
var helpers = require('./helpers');
var logger = require('./loggers');
var Article = require('../../models/Article');

var defaultOptions = {
    org: 'ottawazine',
    categoryId: 120,
    category: 'Canada News',
    baseUrl: 'https://ottawazine.com/category/canada/',
    apiBaseUrl: 'http://www.ottawazine.com/api/core/get_category_posts?',
    pageLimit: 3,
    requestTimeout: 4 * 1000
};

var Procedures = {
    options: {},
    newCounter: 0
};

Procedures.extractOZLinks = function (body) {
    body = $.load(body);
    var links = [];
    body('article h2 a').each(function () {
        links.push($(this).attr('href'));
    });
    return links;
};

Procedures.getOZArticleLinks = function (callback) {
    var self = this;
    var page = 1, 
        pageLimit = self.options.pageLimit,
        baseUrl = self.options.baseUrl,
        linksList = [];
    var processor = function (cb) {
        helpers.getPageBody(baseUrl + '/page/' + page, self.options.requestTimeout).then(function (body) {
            var links = Procedures.extractOZLinks(body);
            linksList = linksList.concat(links);
            page++;
            cb();
        }, function (err) {
            cb(err);
        });
    };
    async.whilst(function () {
        return page <= pageLimit;
    }, processor, function (error) {
        if(error) {
            logger.c.log('error', 'Procedures: getOZArticleLinks ', error);
            logger.c.log('info', 'Procedures: getOZArticleLinks Finish');
            callback(error);
        }
        else {
            logger.c.log('info', 'Procedures: getOZArticleLinks Finish');
            callback(null, linksList);
        }
    });
};

Procedures.processOZPageContent = function (body) {
    var self = this;
    body = $.load(body);
    var date = body('article header .entry-date').text().trim();
    var paras = body('article section p');
    var result = {}, 
        content = '';
    result.org = self.options.org;
    result.categoryId = parseInt(self.options.categoryId, 10);
    result.category = self.options.category;
    result.articleId = body('article.post').attr('id') || '';
    result.articleId = result.articleId.match(/\b[0-9]+/g);
    result.articleId = result.articleId ? parseInt(result.articleId[0], 10) : 0;
    if(!result.articleId) {
        return false;
    }
    result.title = body('article header h1').text().trim();
    result.publish_date = helpers.dateFilter(date);
    paras.each(function () {
        if($(this).find('img').length > 0) {
            var imgs = $(this).find('img');
            result.imageUrl = imgs.eq(0).attr('src');
            imgs.each(function () {
                var src = $(this).attr('src');
                content += '<p><img src="' + src +'"></p>';
            });
        }
        else {
            content += '<p>' + $(this).text() + '</p>';
        }
    });
    result.content = content;
    return result;
};

Procedures.extractParas = function (paras) {
    var content = '';
    if(paras.length <= 0) {
        return content;
    }
    paras.each(function () {
        content += '<p>' + $(this).text() + '</p>';
    });
    return content;
};

Procedures.processOZApiContent = function (posts) {
    posts = posts || [];
    var self = this;
    var processor = function (post) {
        var o = {};
        var elements = $.load(post.content);
        var paras = elements('p');
        var images = elements('img');
        if(images.length > 0) {
            o.imageUrl = images.eq(0).attr('src');
            o.content = '<p><img src="' + o.imageUrl + '"></p>';
        }
        var content = self.extractParas(paras);
        o.org = self.options.org;
        o.categoryId = self.options.categoryId;
        o.category = self.options.category;
        o.articleId = parseInt(post.id, 10);
        o.title = post.title_plain;
        o.content += content;
        o.publish_date = new Date(post.date);
        return o;
    };
    return posts.map(processor);
};

Procedures.getOZArticleContent = function (links, callback) {
    var self = this;
    var processor = function (item, cb) {
        helpers.getPageBody(item, self.options.requestTimeout).then(function (body) {
            var result = self.processOZPageContent(body);
            if(!result || !result.articleId) {
                cb();
            }
            else {
                return Article.saveNoDuplicate(result);
            }
        }, function (err) {
            logger.c.log('error', 'Procedures: getOZArticleContent Request ', err.code);
            cb();
        }).then(function (state) {
            if(state === 1) {
                self.newCounter++;
                logger.c.log('info', 'newCounter: ' + newCounter);
            }
            cb();
        }, function (err) {
            logger.c.log('error', 'Procedures: getOZArticleContent DB ', err);
            cb();
        });
    };
    async.eachLimit(links, 10, processor, function (error) {
        logger.c.log('info', 'Procedures: getOZArticleContent Finish');
        callback();
    });
};

Procedures.run = function (options) {
    options = options || {};
    this.options = Object.assign({}, defaultOptions, options);
    var self = this;
    var taskList = [
        self.getOZArticleLinks.bind(this),
        self.getOZArticleContent.bind(this)
    ];
    var executeTime = logger.executeTime();
    logger.c.log('info' ,'Procedures: Start');
    return new Promise(function (resolve, reject) {
        async.waterfall(taskList, function (err, result) {
            if(err) {
                logger.c.log('error', 'Procedures: Fail due to Error ', err);
                logger.c.log('info', 'Procedures: Finish', executeTime.end());
                reject(err);
            }
            else {
                logger.c.log('info', 'Procedures: Finish', executeTime.end());
                resolve(self.newCounter);
            }
        });
    });
};

Procedures.runAPI = function (options) {
    options = options || {};
    this.options = Object.assign({}, defaultOptions, options);
    var self = this;
    var page = 1;
    var pageLimit = self.options.pageLimit;
    var apiBaseUrl = self.options.apiBaseUrl;
    var categoryId = self.options.categoryId;
    var successNum = 0;
    var processor = function (cb) {
        var url = apiBaseUrl + 'id=' + categoryId + '&page=' + page;
        page++;
        helpers.getPageBody(url, self.options.requestTimeout).then(function (body) {
            body = JSON.parse(body);
            var dataList = self.processOZApiContent(body.posts);
            return Article.saveList(dataList);
        }, function (err) {
            cb(err);
        }).then(function (num) {
            successNum += num;
            cb();
        }, function () {
            cb();
        });
    };
    var executeTime = logger.executeTime();
    logger.c.log('info' ,'Procedures: Start');
    return new Promise(function (resolve, reject) {
        async.whilst(function () {
            return page <= pageLimit;
        }, processor, function (err) {
            if(err) {
                logger.c.log('error', 'Procedures: Fail due to', err);
                logger.c.log('info', 'Procedures: Finish', executeTime.end());
                reject(err);
            }
            else {
                logger.c.log('info', 'Procedures: Finish', executeTime.end());
                resolve(successNum);
            }
        });
    });
};

module.exports = function () {
    return Object.assign({}, Procedures);
};