// pages/search/search.js
const request = require('../../utils/util.js').request;
const domains = require('../../utils/domain').domains;
const Util = require('../../utils/util');
const app = getApp()

function debounce(fn, delay) {
  let timer = null;

  return function () {
      let args = arguments;
      let context = this;

      if (timer) {
          clearTimeout(timer);

          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
      } else {
          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
      }
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nextTag: '', 
    info: [], //搜索出来的结果
    keyword: '', //搜索内容
    lastSearchedKeyword: null, //上次搜索的内容
    isContentEmpty: false, //搜索内容为空
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: (app.globalData && app.globalData.userInfo) || {}
    },()=>{
      Util.log({
        logtype: 20000,
        eventcode: 'library_search',
        xcx_phone: this.data.userInfo.phoneNumber,
        open_id: this.data.userInfo.openId
      })
    })
    this.debouncedInputHandler = debounce(this.handleInput, 300)
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      startTime: +Date.now(),
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.sendDurationLog()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.sendDurationLog()
  },

  // 页面停留时长log
  sendDurationLog() {
    const now = +Date.now()
    const duration = now - this.data.startTime
    Util.log({
      logtype: 20004,
      eventcode: 'o_library_search',
      stay_time: duration,
      xcx_phone: this.data.userInfo.phoneNumber,
      open_id: this.data.userInfo.openId
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //如果nextTag为空，则无更多数据
    if(this.data.nextTag === '') return;

    this.getSearchResult(this.data.keyword).then(result => {
      if(result.response && result.response.error_code === 0) {
        this.setData({
          nextTag: result.next_tag
        })
        if(result.material_info_items) {
          
          // this.setData({
          //   info: [...MOCK, ...MOCK]
          // })

          this.setData({
            info: [this.data.info, ...result.material_info_items]
          })
        } else {
          //搜索后没有数据
          
        }
      }
    })
  },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // },
  
  inputHandler: function(event) {
    //做一个300ms的防抖
    this.debouncedInputHandler(event);
  },

  handleInput: function(event) {
    this.setData({
      keyword: event.detail.value
    })
  },

  confirmHandler(event) {
    if(event.detail.value === '') {
      this.setData({
        isContentEmpty: false
      })
      return;
    }
    this.setData({
      keyword: event.detail.value
    })

    //如果用户改变输入后与上次输入的搜索内容一致则不作任何改变
    if(this.data.keyword === this.data.lastSearchedKeyword) return;

    //如果输入内容发生变化则重置nextTag与数据info
    this.nextTag = '';
    this.setData({
      info: []
    })

    //设置上次的搜索内容
    this.setData({
      lastSearchedKeyword: this.data.keyword
    });

    //sendlog
    Util.log({
      logtype: 20001,
      eventcode: 'library_search',
      actioncode: 'c_search',
      e_search_terms: this.data.keyword,
      xcx_phone: this.data.userInfo.phoneNumber,
      open_id: this.data.userInfo.openId
    })

    this.getSearchResult(this.data.keyword).then(result => {
      if(result.response && result.response.error_code === 0) {
        this.setData({
          nextTag: result.next_tag
        })
        if(result.material_info_items) {
          // this.setData({
          //   info: MOCK,
          //   isContentEmpty: false
          // })
          this.setData({
            info: result.material_info_items,
            isContentEmpty: false
          })
        } else {
          //搜索后没有数据则显示空态页面
          this.setData({
            isContentEmpty: true
          })
        }
      }
    })
  },

  focusHandler() {
    console.log('focus')
  },

  getSearchResult: function(keyword) {
    return new Promise((resolve, reject) => {
      request({
        url: domains.api + '/socialiosvc/api/cpb/v1/social-library/material-info-search.json',
        data: {
          keyword,
          next_tag: this.nextTag
        }
      }).then(result => {
        resolve(result)
      }).catch(err => {
        reject(err)
      })
    })
  },

  emptyInput() {
    console.log('empty')
    this.setData({
      keyword: '',
      isContentEmpty: false,
      info: []
    })
  },

  // 列表项点击
  handleMediaClick(e) {
    app.itemNavigateTo(e)
  },
})