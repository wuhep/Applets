//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello这只是一个测试的小程序',
    code: '未获取code', //微信登录凭证
    openId: '未获取openId', //微信登录凭证
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getCode: function() {
    console.log("调用登录接口获取code")
    var _this = this;
    wx.login({
      success(res) {
        if (res.code) {
          // 自定义登录接口
          // wx.request({
          //   url: 'https://test.com/onLogin',
          //   data: {
          //     code: res.code
          //   }
          // })
          _this.setData({
            code: res.code
          })
          console.log(res.code);
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  getOpenId: function() {
    console.log("调用wx接口获取openId")
    var _this = this;
    //根据code获取openid等信息
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wx3ac977de77eade1a&secret=' + '2d282bf88312027a4d030da0f69335e5' + '&js_code=' + _this.code + '&grant_type=authorization_code',
      data: {},
      header: {
        'content-type': 'json'
      },
      success: function(res) {
        var openid = res.data.openid //返回openid
        console.log('openid为' + openid);
      }
    })
  },
  getPhoneNumber(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  }
})