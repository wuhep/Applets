// pages/webview/webview.js
const app = getApp()
const request = require('../../utils/util.js').request;
const domains = require('../../utils/domain').domains;
const Util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const title = decodeURIComponent(options.title)
    wx.setNavigationBarTitle({
      title
    })
    this.setData({
      url: decodeURIComponent(options.url),
      id: options.id,
      title,
      type: options.type
    }, () => {
      app.getLogin().then(res => {
        if (options.id) {
          this.recordView()
        }
      })
    })
  },

  recordView() {
    const isWxArticle = this.data.type === 'wx_article_display_type';
    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/material-operation.json',
      data: {
        qingqing_material_id: this.data.id,
        operation_type: isWxArticle ? 3 : 4
      }
    })
    Util.log({
      logtype: 20000,
      eventcode: isWxArticle ? 'library_article' : 'library_lecture_detail',
      article_id: this.data.id,
      open_id: app.globalData.userInfo.openId,
      xcx_phone: app.globalData.userInfo.phoneNumber
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      startTime: +Date.now()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    const now = +Date.now()
    const duration = now - this.data.startTime
    this.sendDurationLog(duration)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    const now = +Date.now()
    const duration = now - this.data.startTime
    this.sendDurationLog(duration)
  },

  // 页面停留时长log
  sendDurationLog(duration) {
    const isWxArticle = this.data.type === 'wx_article_display_type';
    if (!duration) return false
    Util.log({
      logtype: 20004,
      eventcode: isWxArticle ? 'o_library_article' : 'o_library_lecture_detail',
      stay_time: duration,
      article_id: this.data.id,
      open_id: app.globalData.userInfo.openId,
      xcx_phone: app.globalData.userInfo.phoneNumber
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const isWxArticle = this.data.type === 'wx_article_display_type';
    let obj = {
      title: this.data.title,
      path: `/pages/webview/transfer?url=${encodeURIComponent(this.data.url)}&id=${this.data.id}&title=${encodeURIComponent(this.data.title)}&type=${this.data.type}`,
    }
    if (isWxArticle) obj.imageUrl = '/images/article_share.png'
    return obj
  }
})