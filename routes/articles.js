var express = require('express');
var router = express.Router();

var Article = require('../models/Article');
var routerHandlers = require('../middlewares/routeHandlers');

var allRoutesHandler = routerHandlers.allRoutesHandler,
    categoryRouteHandler = routerHandlers.allRoutesHandler;

var resultHandler = function (req, res, next) {
    if(!req.data) {
        res.json({
            success: false
        });
    }
    else {
        res.json({
            success: true,
            data: req.data
        });
    }
};

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

router.param('count', function (req, res, next, count) {
    count = parseInt(count, 10);
    count = Number.isInteger(count) ? count : 10;
    req.count = count;
    next();
});

// define router methods
router.get('/all', allRoutesHandler, resultHandler);

router.get('/all/page/:page', allRoutesHandler, resultHandler);

router.get('/all/page/:page/count/:count', allRoutesHandler, resultHandler);

router.get('/category/:categoryId', categoryRouteHandler, resultHandler);

router.get('/category/:categoryId/page/:page', categoryRouteHandler, resultHandler);

router.get('/category/:categoryId/page/:page/count/:count', allRoutesHandler, resultHandler);

module.exports = router;
