var Article = require('../models/Article');

var allRoutesHandler = function (req, res, next) {
    var page = req.page || 1,
        count = req.count || 10,
        start;
    count = parseInt(count, 10);
    start = (page === 1) ? 0 : (page - 1) * count;
    Article.findLimit(start, count).then(function (data) {
        req.data = data;
        next();
    }, function (error) {
        req.data = false;
        next();
    });
};

var categoryRouteHandler = function (req, res, next) {
    var page = req.page || 1,
        count = req.count || 10,
        categoryId = req.categoryId || 120,
        start;
    start = (page === 1) ? 0 : (page - 1) * count;
    Article.findLimit(start, count, categoryId).then(function (data) {
        req.data = data;
        next();
    }, function (error) {
        req.data = false;
        next();
    });
};

var summaryDataHandler = function (req, res, next) {
    Article.findSummary().then(function (data) {
        req.data = data;
        next();
    }, function (error) {
        req.data = false;
        next();
    });
};

var perArticleRouteHandler = function (req, res, next) {
    Article.findById(req.articleId).then(function (doc) {
        req.data = doc;
        next();
    }, function (err) {
        req.data = false;
        next();
    });
};

module.exports = {
    allRoutesHandler: allRoutesHandler,
    categoryRouteHandler: categoryRouteHandler,
    summaryDataHandler: summaryDataHandler,
    perArticleRouteHandler: perArticleRouteHandler
};