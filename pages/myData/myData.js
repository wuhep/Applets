const request = require('../../utils/util.js').request;
const domains = require('../../utils/domain').domains;
const sendLog = require('../../utils/util.js').log;
const app = getApp()
const ICON_MASCOT_EMPTY = '../../images/icon/icon-mascot-empty.png';
const DISPLAY_TYPE_MAP = { // 展示类型
  'unkown_display_type': '未知',
  'file_display_type': '文件',
  'wx_article_display_type': '公众号文章',
  'public_class_display_type': '公开课',
  'other_display_type': '其他'
}
// 公开课映射二级路由名称
const PUBLIC_CLASS_REFLECT_VALUE = {
  unkown_public_class_type: {
    name: '',
    text: ''
  },
  lecture_public_class_type: {
    name: 'lecture_detail',
    text: '讲座'
  },
  series_public_class_type: {
    name: 'lecture_series_detail',
    text: '系列课'
  },
  special_public_class_type: {
    name: 'lecture_subject_detail',
    text: '专题'
  },
  assemble_public_class_type: {
    name: 'group_detail',
    text: '拼团'
  },
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0, // 当前显示 tab
    // tab 属性对象 - collect
    collect: {
      key: 0,
      name: 'collect',
      value: '已收藏',
      nextTag: '', // 瀑布流编码
      info: [], // 数据
      eventlog: 1, // 埋点数据
    },
    // tab 属性对象 - download
    download: {
      key: 1,
      name: 'download',
      value: '已下载',
      nextTag: '', // 瀑布流编码
      info: [], // 数据
      eventlog: 2, // 埋点数据
    },
    // 空态图数据
    emptyObj: {
      collect: {
        imgUrl: ICON_MASCOT_EMPTY,
        desc: '暂无收藏的资料'
      },
      download: {
        imgUrl: ICON_MASCOT_EMPTY,
        desc: '暂无下载的资料'
      }
    },
    userInfo: '', // 当前用户信息
    startTime: '', // 开始时间戳
  },
  // 滑动切换
  swiperTab (e) {
    const tabKey = e.detail.current
    this.setData({
      currentTab: tabKey
    });
    this.handleSendLog(tabKey) // 埋点
  },
  // 点击切换
  clickTab (e) {
    const tabKey = e.target.dataset.current
    if (this.data.currentTab === tabKey) {
      return false;
    } else {
      this.setData({
        currentTab: tabKey
      })
    }
  },
  // tab 切换埋点
  handleSendLog(tabKey) {
    let log = {
      logtype: 20001,
      actioncode: 'c_screen',
      eventcode: 'library_my',
      e_courseware_filters: ''
    }
    switch(Number(tabKey)) {
      case 0: // 已收藏
        log.e_courseware_filters = this.data.collect.eventlog
        break;
      case 1: // 已下载
        log.e_courseware_filters = this.data.download.eventlog
        break;
    }

    sendLog(log)
  },
  // 媒体对象点击事件
  handleEmitMediaClick(data) {
    const { detail } = data; // 获取当前点击的媒体对象数据
    if(detail) {
      const { qingqing_material_id } = detail.detail
      sendLog({
        logtype: 20001,
        actioncode: 'c_infor_detail',
        eventcode: 'library_my',
        e_banner_id: qingqing_material_id
      })
    }
    app.itemNavigateTo(detail);
  },
  // 监听 mydatacont 组件滚动 
  handleScrolltolower(emitData) {
    const detail = emitData.detail || {}
    let { nextTag, key } = detail
    console.log('handleScrolltolower nextTag', nextTag)
    if(!nextTag) return false
    switch(key) {
      case 0:
        this.fetchCollectedMaterial()
        break;
      case 1:
        this.fetchDownloadedMaterial()
        break;
    }
  },
  // 获取【已收藏】数据
  fetchCollectedMaterial () {
    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/collected-material.json',
      data: {
        data: this.data.collect.nextTag
      }
    }).then(res => {
      this.handleMaterData(res, this.data.collect)
    }).catch(err => {
      console.log(err)
    })
  },
  // 获取【已下载】数据
  fetchDownloadedMaterial () {
    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/downloaded-material.json',
      data: {
        data: this.data.download.nextTag
      }
    }).then(res => {
      this.handleMaterData(res, this.data.download)
    }).catch(err => {
      console.log(err)
    })
  },
  // 返回的数据处理
  /**
   * 
   * @param {Object} res 接口返回值 
   * @param {Object} tabObj tab 属性对象
   */
  handleMaterData(res, tabObj) {
    const { response, next_tag, material_info_items } = res
    if(response && !response.error_code && tabObj) {
      tabObj.nextTag = next_tag
      tabObj.info = tabObj.info.concat(material_info_items)
      const tabName = tabObj.name
      if(this.hasList(material_info_items)) {
        this.setData({
          [tabName]: tabObj,
        })
      }
    }
  },
  hasList (arr) {
    return arr && Array.isArray(arr) && arr.length > 0
  },
  showToast(type, title) {
    this.toast.showToast({
      type: type,
      title: title,
      compelete: function() {
        console.log('toast框隐藏之后，会调用该函数')
      }
    })
  },
  initData() {
    this.fetchCollectedMaterial() // 获取已收藏数据
    this.fetchDownloadedMaterial() // 获取已下载数据
    this.setData({
      userInfo: (app.globalData && app.globalData.userInfo) || {}
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    console.log('myData onLoad')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    console.log('myData onShow')
    this.resetData() // 重置数据
    this.initData() // 初始化数据
    this.setData({
      startTime: +Date.now(),
    })
    sendLog({
      logtype: 20000,
      eventcode: 'library_my',
      xcx_phone: this.data.userInfo.phoneNumber,
      open_id: this.data.userInfo.openId
    })
  },
  // 重置数据
  resetData () {
    let collect = this.data.collect
    collect.nextTag = '';
    collect.info = [];
    let download = this.data.download
    download.nextTag = '';
    download.info = [];
    this.setData({
      collect,
      download
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    this.toast = this.selectComponent("#toast");
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {
    console.log('myData onHide')
    this.sendDurationLog()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    console.log('myData onUnload')
    this.sendDurationLog()
  },
  // 页面停留时长log
  sendDurationLog() {
    const now = +Date.now()
    const duration = now - this.data.startTime
    sendLog({
      logtype: 20004,
      eventcode: 'o_library_my',
      stay_time: duration
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage () {
  //   console.log('onShareAppMessage')
  // }
})