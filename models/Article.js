var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('promise');

var articleSchema = new Schema({
    org: {
        type: String,
        default: ''
    },
    categoryId: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        default: ''
    },
    articleId: {
        type: Number,
        require: true
    },
    title: {
        type: String,
        default: ''
    },
    publish_date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    }
});

articleSchema.statics.findByArticleId = function (id, cb) {
    return this.find({articleId: id}, cb);
};

articleSchema.statics.findById = function (id, cb) {
    var self = this;
    var processor = function (resolve, reject) {
        self.find({_id: id}, function (err, doc) {
            if(err) {
                reject(err);
            }
            else {
                resolve(doc);
            }
        });
    };
    return new Promise(processor);
};

articleSchema.statics.findLimit = function (start, count, categoryId) {
    categoryId = categoryId || 0;
    start = Number.isInteger(start) ? start : 0;
    count = Number.isInteger(count) ? count: 20;
    var condition = categoryId ? {categoryId: categoryId} : {};
    var getNumber = this.find(condition).count().exec();
    var getData = this.find(condition).sort({publish_date: -1}).skip(start).limit(count)
            .select('_id imageUrl title category publish_date').exec();
    var processor = function (resolve, reject) {
        Promise.all([getNumber, getData]).then(function (results) {
            resolve({
                entryNum: results[0],
                list: results[1]
            });
        }, function (err) {
            reject(err);
        });
    };
    return new Promise(processor);
};

articleSchema.statics.saveNoDuplicate = function (article) {
    var self = this;
    var processor = function (resolve, reject) {
        if(!article) {
            resolve(0);
        }
        self.findByArticleId(article.articleId, function (err, doc) {
            if(err || (doc && doc.length > 0)) {
                resolve(0);
            }
            else {
                self.create(article, function (err, doc) {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(1);
                    }
                });
            }
        });
    };
    return new Promise(processor);
};

articleSchema.statics.findSummary = function (counts) {
    counts = Object.assign({}, counts, {
        120: 10,
        122: 4,
        335: 5
    });
    var self = this,
        requests = [];
    var processor = function (resolve, reject) {
        requests.push(self.findLimit(0, counts[120], 120));
        requests.push(self.findLimit(0, counts[122], 122));
        requests.push(self.findLimit(0, counts[335], 335));
        Promise.all(requests).then(function (results) {
            resolve({
                120: results[0].list,
                122: results[1].list,
                335: results[2].list
            });
        }).catch(function (error) {
            reject(error);
        });
    };
    return new Promise(processor);
};

module.exports = mongoose.model('Article', articleSchema);