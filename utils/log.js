var domains = require('./domain').domains;
var Base64 = require('./base64.min').Base64;
var is_development_mode = require('./env').isDevModel;
var apiLogURL = domains.log + (is_development_mode ? '/h5log.html?' : '/logdata/ets.html?eventType=3&msg='),
    isApp = false,
    encode = encodeURIComponent,
    decode = decodeURIComponent,
    MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000;
var logUrl = apiLogURL;
var commonparams = {
        appname: 'wx_xiaochengxu',
        guid: generateVVID(),
        uuid: generateVVID()
    },
    params = {};
var unique = (function() {
    var time = new Date().getTime() + '-',
        i = 0;
    return function() {
        return time + i++;
    };
})();
var SessionCookieTimeout = 1 / 24 * 2;
extend(params, commonparams);
var sendLog = function(RequestParams) {
    var user = getUser() || {};
    var uid = unique();
    var userid = user.qingqing_user_id || RequestParams.uid;
    var appname = commonparams.appname;
    var app = app ? app : getApp();
    extend(RequestParams, commonparams);
    if (appname) {
        RequestParams.appname = appname;
    }
    if (userid) {
        RequestParams.uid = userid;
        if (user.user_id) {
            RequestParams.user_id = user.user_id;
        }
        if (user.new_registered) {
            RequestParams.new_user = 1;
        } else {
            RequestParams.new_user = 0;
        }
    }
    if (!RequestParams.logtype) {
        RequestParams.logtype = 20000;
    }
    if (!RequestParams.appname || !RequestParams.logtype || !RequestParams.eventcode) {
        return false;
    }
    RequestParams.ts = +new Date();

    if (app && app.globalData) {
        RequestParams.router = objectToQuery(app.globalData.pagedata);
    }
    if (is_development_mode) {
        apiLogURL = logUrl + objectToQuery(RequestParams) + '&r=' + uid;
    } else {
        apiLogURL = logUrl + utoa(JSON.stringify(RequestParams)) + '&r=' + uid;
    }
    if (is_development_mode) {
        console.log('RequestParams=====>', apiLogURL, RequestParams);
    }

    wx.request({
        url: apiLogURL,
        method: 'GET',
        dataType: 'json',
        success: function(res) {
            console.info('wx-request', res);
        },
        fail: function(res) {
            console.warn(res);
        }
    });
    if (RequestParams.logtype === 50000) {
        wx.request({
            url: domains.api + '/webapi/api/pb/report.json?guid=' + RequestParams.guid + '&ts=' + RequestParams.ts,
            method: 'POST',
            dataType: 'JSON',
            data: RequestParams,
            complete: function(res) {
                console.error(res);
            }
        });
    }
};

function utoa(str) {
    return Base64.encode(str);
}

function atou(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function objectToQuery(obj, prefix) {
    var str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + '[' + p + ']' : p,
                v = obj[p];
            str.push(v !== null && typeof v === 'object' ? objectToQuery(v, k) : encode(k) + '=' + encode(v));
        }
    }
    return str.join('&');
}

function queryToObject(str) {
    if (!str || str == '') {
        return {};
    }
    var o = {},
        list = str.split('&'),
        i = 0,
        item;
    while (list[i]) {
        item = list[i].split('=');
        o[item[0]] = item[1];
        i++;
    }
    return o;
}

function addevent(el, eventName, callback) {
    if (el.addEventListener) {
        el.addEventListener(eventName, callback, false);
    } else {
        if (el.attachEvent) {
            el.attachEvent('on' + eventName, callback);
        }
    }
}

function getUser(key) {
    try {
        var user = getCookie('user') || '{}';
        return JSON.parse(decode(user)) || {};
    } catch (e) {
        return {};
    }
}

function clone(obj) {
    if (null == obj || 'object' != typeof obj) {
        return obj;
    }
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj && obj.hasOwnProperty && obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}

function extend(target, source) {
    for (var p in source) {
        if (source && source.hasOwnProperty && source.hasOwnProperty(p)) {
            target[p] = source[p];
        }
    }
    return target;
}

function generateVVID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = ((d + Math.random() * 16) % 16) | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 7) | 8).toString(16);
    });
    return uuid;
}

function deserialize(value) {
    if (typeof value != 'string') {
        return undefined;
    }
    try {
        return JSON.parse(value);
    } catch (e) {
        return value || undefined;
    }
}
module.exports = sendLog;
