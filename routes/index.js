var express = require('express');
var router = express.Router();

var routeHandlers = require('../middlewares/routeHandlers');
var pageService = require('../services/pageService');

var summaryDataHandler = routeHandlers.summaryDataHandler;
var categoryRouteHandler = routeHandlers.categoryRouteHandler;

router.param('categoryId', function (req, res, next, categoryId) {
    categoryId = parseInt(categoryId, 10);
    categoryId = Number.isInteger(categoryId) ? categoryId : 120;
    req.categoryId = categoryId;
    next();
});

router.param('page', function (req, res, next, pageNum) {
    pageNum = parseInt(pageNum, 10);
    pageNum = Number.isInteger(pageNum) ? pageNum : 1;
    req.page = pageNum;
    next();
});

// define router methods
router.get('/', summaryDataHandler, function (req, res, next) {
    var page = pageService.setIndexPage(req.data);
    res.render('index', page);
});

router.get('/category/:categoryId', categoryRouteHandler, function (req, res, next) {
    var page = pageService.setCategoryPage(req.categoryId, req.data);
    res.render('category', page);
});

router.get('/category/:categoryId/page/:page', categoryRouteHandler, function (req, res, next) {

});

router.get('/article/:articleId', function (req, res, next) {});

module.exports = router;
