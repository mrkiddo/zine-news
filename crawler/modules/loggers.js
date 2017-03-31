var winston = require('winston');

var loggers = {},
    transports = [];

if(process.env.NODE_ENV === 'development') {
    transports.push(new (winston.transports.Console)({
        prettyPrint: true,
        colorize: true
    }));
}

loggers.c = new (winston.Logger)({
    transports: transports
});

loggers.executeTime = function () {
    var unit = 'ms';
    return {
        flag: false,
        startTime: Date.now(),
        endTime: 0,
        end: function () {
            if(!this.flag) {
                this.flag = true;
                this.endTime = Date.now();
            }
            return (this.endTime - this.startTime) + unit;
        }
    };
};

module.exports = loggers;