// pages/webview/transfer.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstShow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.qingqing_material_id) {
      wx.navigateTo({
        url: `/pages/fileDetails/fileDetails?qingqing_material_id=${options.qingqing_material_id }`,
      })
    } else {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${options.url}&id=${options.id}&title=${options.title}&type=${options.title}`,
      })
    }
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
    if (!this.data.firstShow) {
      wx.redirectTo({
        url: '/pages/index/index',
      })
    }
    this.setData({
      firstShow: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})