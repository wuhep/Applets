var domains = require('./domain').domains;
var isTest = require('./domain').isTest;
var log = require('./log');
var env = require('./env');
var app = getApp();
var uuid = generateVVID();

function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}



function extend(target, source) {
  for (var p in source) {
    if (source[p] && source.hasOwnProperty(p)) {
      target[p] = source[p];
    }
  }
  return target;
}


function request(params) {
  var request = extend({
      type: 'POST'
    },
    params
  );
  var data = params.data,
    callbaks = params.callbaks || {};
  var pathurl = request.url,
    type = request.type;
  request.appplatform = 'web';

  if (request.appplatform) {
    pathurl += (pathurl.indexOf('?') > 0 ? '&' : '?') + ('appplatform=' + request.appplatform) + '&uuid=' + uuid + '&guid=' + generateVVID();
  }
  let header = {
    'content-type': 'application/json',
    'X-Requested-With': 'xmlhttprequest',
    'auth-type':'mini-app'
  }
  if (/tpt/.test(pathurl)) {
    try {
      const app = getApp()
      const userInfo = app.globalData.userInfo;
      const tk = userInfo.tk;
      header.token = tk;

    } catch (error) {
      console.log(error)
    }
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: pathurl,
      data,
      header,
      method: request.type,
      responseType: request.responseType || '',
      success: function(res) {
        wx.hideLoading()
        var resp = res.data || {};
        if (resp && resp.response) {
          if (resp.response.error_code === 0) {
            resolve(resp)
          } else {
            console.warn('error message===> ', pathurl, data, resp, res, params);
            log({
              logtype: 50000,
              eventcode: 'xcx_request_warning',
              api: pathurl,
              request: data,
              message: resp
            });
            reject(resp)
          }
        } else {
          reject(resp)
        }
      },
      fail: function(res) {
        wx.hideLoading()
        console.error('request failed===> ', pathurl, res);
        reject(res);
        log({
          logtype: 50000,
          eventcode: 'xcx_request_error',
          api: pathurl,
          request: data,
          message: res.errMsg
        });

        if (res.errMsg && res.errMsg.indexOf('kCFErrorDomainCFNetwork') > 0) {
          wx.showModal({
            title: '请检查网络!',
            content: res.errMsg,
            complete: function(aaa) {}
          });
        } else {
          wx.showModal({
            title: '请检查代理或网络!',
            content: res.errMsg,
            complete: function(aaa) {}
          });
        }
      },
      complete: function(res) {
        console.log('request complete===> ', pathurl, res.statusCode, res);
        var resp = res.data || {};
        var hit_message = resp.response && (resp.response.hint_message || resp.response.error_message);
        if (!app) {
          app = getApp();
          app.toast_hit_message = hit_message;
        }

        if (res.statusCode === 401 || res.statusCode === 412) {
          var ctx = params;
          app.globalData.userInfo = null;
          app.globalData.hasLogined = false;
          app.globalData.union_id_data = null;
          try {
            wx.removeStorage({
              key: 'userInfo',
              success: function(res) {}
            });
          } catch (e) {
            console.log('clear filed');
          }
        } else if (res.statusCode >= 500) {
          console.log('service error===> ', pathurl, resp.response);
          var resp = resp.response || {};
          wx.showModal({
            title: 'code: ' + res.statusCode,
            content: resp.hint_message ? resp.hint_message + '，请稍后再试！' : '服务器错误，请稍后再试！',
            complete: function() {}
          });
        }
      }
    });
  })

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

module.exports = {
  formatTime: formatTime,
  domains: domains,
  request: request,
  log: log
};