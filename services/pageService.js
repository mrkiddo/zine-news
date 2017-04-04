var Promise = require('promise');
var config = require('../config/config');
var dataConfig = require('../config/dataConfig');
var Article = require('../models/Article');
var Page = require('../models/Page');

var pageService = {};

pageService.getTitle = function () {
    return config.siteName;
};

pageService.setHeader = function (extraTitle) {
    var title = config.siteName;
    if(extraTitle) {
        title += ' - ' + extraTitle; 
    }
    return {
        content: {
            title: title
        }
    };
};

pageService.setFooter = function () {
    return {
        content: {
            lang: "en",
            switchName: 'mobile',
            owner: 'ottawazine',
            companyInfo: [
                {
                    detail: 'Data credit <a href="http://www.ottawazine.com/">Ottawazine Globe Inc</a>'
                },
                {
                    detail: 'Github <a href="https://github.com/mrkiddo/zine-news">zine-news</a>'
                }
            ]
        }
    };
};

pageService.setMoreButton = function (categoryId, currentPage, entryNum) {
    var data = {
        show: true,
        url: config.siteUrl + '/category/' + categoryId + '/page/' + (currentPage + 1)
    };
    if(currentPage >= (entryNum / 10)) {
        data.show = false;
    }
    return data;
};

pageService.setList = function (title, categoryId, list, showMore) {
    list = list || [];
    list = list.map(function (value) {
        return {
            title: value.title,
            link: config.siteUrl + '/article/' + value._id,
            date: value.publish_date.toLocaleDateString()
        };
    });
    return {
        content: {
            header: {
                title: title,
                link: config.siteUrl + '/category/' + categoryId,
                moreText: showMore ? null : 'more >>',
                morePosition: showMore ? null : 'bottom'
            },
            main: list
        }
    };
};

pageService.setListThumbImage = function (title, categoryId, list) {
    list = list.map(function (value) {
        return {
            title: value.title,
            link: config.siteUrl + '/article/' + value._id,
            date: value.publish_date.toLocaleDateString(),
            img: value.imageUrl
        };
    });
    return {
        options: {
            type: 'thumb',
            thumbPosition: 'left'
        },
        content: {
            header: {
                title: title,
                link: config.siteUrl + '/category/' + categoryId,
                moreText: 'more >>',
                morePosition: 'bottom'
            },
            main: list
        }
    };
};

pageService.setIndexPage = function (doc) {
    var categories = dataConfig.categories;
    var page = Page('index');
    var self = this;
    page.title = self.getTitle();
    page.header = self.setHeader();
    page.footer= self.setFooter();
    categories.forEach(function (value, index) {
        if(value.categoryId === 120) {
            var list = doc[value.categoryId];
            page.listCan =
                self.setList(value.category, value.categoryId, list);
        }
        else if(value.categoryId === 122) {
            var list = doc[value.categoryId];
            page.listFun =
                self.setListThumbImage(value.category, value.categoryId, list);
        }
        else if(value.categoryId === 335) {
            var list = doc[value.categoryId];
            page.listEnt =
                self.setList(value.category, value.categoryId, list);
        }
    });
    return page;
};

pageService.setCategoryPage = function (categoryId, data, currentPage) {
    currentPage = currentPage || 1;
    var self = this;
    var page = Page('index');
    var categories = dataConfig.categories;
    var count = data.entryNum;
    page.title = self.getTitle();
    page.header = self.setHeader();
    page.footer= self.setFooter();
    page.link = self.setMoreButton(categoryId, currentPage, count);
    categories.forEach(function (value) {
        if(value.categoryId === categoryId) {
            page.header = self.setHeader(value.category);
        }
    });
    page.list = self.setList(null, categoryId, data.list, true);
    return page;
};

pageService.setArticlePage = function (data) {
    if(Array.isArray(data)) {
        data = data[0];
    }
    var self = this;
    var page = Page('article');
    page.title = self.getTitle();
    page.header = self.setHeader(data.title);
    page.footer = self.setFooter();
    page.articleTitle = data.title;
    page.content = data.content;
    return page;
};

module.exports = pageService;