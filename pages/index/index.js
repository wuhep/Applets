//index.js
//获取应用实例
const app = getApp()
const request = require('../../utils/util.js').request;
const domains = require('../../utils/domain').domains;
const Util = require('../../utils/util.js');
const type2Index = {
  to_junior_high_study_phase: 1,
  to_senior_high_study_phase: 2
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
  data: {
    userInfo: {},
    code: '未获取',
    showLogin: false,
    type: 'to_junior_high_study_phase',
    typeMap: {
      to_junior_high_study_phase: '小学',
      to_senior_high_study_phase: '初中'
    },
    tag: '',
    tabList: [{
      theme_name: '轻轻精选'
    }],
    curTagIdx: 0,
    info: [],
    isNewUser: false,
    hasCollectOrDownload: false,
    scrollLeft: 0
  },
  onLoad: function() {
    app.getLogin().then(res => {
      if (!res.phoneNumber) {
        this.setData({
          showLogin: true,
          isNewUser: true
        })
      }

      Util.log({
        logtype: 20000,
        eventcode: 'library_home',
        open_id: res.openId,
        xcx_phone: res.phoneNumber
      })

      this.setData({
        type: res.studyPhase || this.data.type,
        userInfo: res || {}
      }, () => {
        this.getBaseInfo()
        this.getRecommend()
      })
      this.hasCollectOrDownload()
    }).catch(e => {
      console.log(e)
    })

  },

  onReady() {
    this.toast = this.selectComponent("#toast");
  },

  handleContact(e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  },

  onShow() {
    if (app.globalData.userInfo) {
      this.hasCollectOrDownload()
    }

    this.setData({
      startTime: +Date.now()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    const now = +Date.now()
    const duration = now - this.data.startTime
    this.sendDurationLog(duration)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    const now = +Date.now()
    const duration = now - this.data.startTime
    this.sendDurationLog(duration)
  },

  // 页面停留时长log
  sendDurationLog(duration) {
    if (!duration) return false
    Util.log({
      logtype: 20004,
      eventcode: 'o_library_home',
      stay_time: duration,
      open_id: this.data.userInfo.openId,
      xcx_phone: this.data.userInfo.phoneNumber
    })
  },

  // 选择年纪及绑定手机
  modify(e) {
    const {
      phone_number,
      study_phase_enum
    } = e.detail

    Util.log({
      logtype: 20001,
      actioncode: 'c_sure',
      eventcode: 'library_home',
      e_grade_id_s: type2Index[this.data.type],
      open_id: this.data.userInfo.openId,
      xcx_phone: this.data.userInfo.phoneNumber
    })

    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/modify-user-info.json',
      data: {
        study_phase_enum,
        phone_number
      }
    }).then(res => {
      if (res.response && res.response.error_code === 0) {
        this.setData({
          showLogin: false,
          isNewUser: false
        })
        if (this.data.type !== study_phase_enum) {
          this.setData({
            type: study_phase_enum,
            curTagIdx: 0,
            info: [],
            tag: '',
            scrollLeft: 0
          }, () => {
            this.getBaseInfo()
            this.getRecommend()
          })
        }
      }
    })
  },

  // 获取基本列表栏目
  getBaseInfo() {
    request({
      url: domains.api + '/socialiosvc/api/cpb/v1/social-library/base-info.json',
    }).then(res => {
      if (res.response && res.response.error_code === 0) {
        console.log(res)
        let tabList = (res.monthly_theme_items || []).filter(item => item.study_phase_enum === this.data.type)

        this.setData({
          tabList: [this.data.tabList[0], ...tabList]
        })
      }
    })
  },

  testClick: function () {
    console.log("调用登录接口获取code")
    var _this = this;
    wx.login({
      success(res) {
        if (res.code) {
          console.log("code : " + res.code);
          _this.setData({
            code: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  // 查询是否有收藏或下下载
  hasCollectOrDownload() {
    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/has-collect-download.json',
    }).then(res => {
      if (res.response && res.response.error_code === 0) {
        this.setData({
          hasCollectOrDownload: res.data
        })
      }
    })
  },

  // 获取推荐栏目
  getRecommend() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    request({
      url: domains.api + '/socialiosvc/api/pb/v1/social-library/material-info-recommend.json',
      data: {
        next_tag: this.data.tag || '',
        study_phase: type2Index[this.data.type]
      }
    }).then(res => {
      if (res.response && res.response.error_code === 0) {
        let info = []
        if (!this.data.tag) {
          info = res.material_info_items
        } else {
          info = [...this.data.info, ...(res.material_info_items || [])]
        }
        this.setData({
          info,
          tag: res.next_tag || ''
        })
      }
    })
  },

  // 获取栏目列表
  getFilterList(index) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    request({
      url: domains.api + '/socialiosvc/api/cpb/v1/social-library/material-info-filter.json',
      data: {
        next_tag: this.data.tag || '',
        study_phase: type2Index[this.data.type],
        theme_id: this.data.tabList[index].id
      }
    }).then(res => {
      if (res.response && res.response.error_code === 0) {
        let info = []
        if (!this.data.tag) {
          info = res.material_info_items
        } else {
          info = [...this.data.info, ...(res.material_info_items || [])]
        }
        this.setData({
          info,
          tag: res.next_tag || ''
        })
      }
    })
  },

  // 切换栏目
  switchTab(e) {
    const currentTarget = e.currentTarget
    const {
      index
    } = currentTarget.dataset

    if (index === this.data.curTagIdx) return false

    Util.log({
      logtype: 20001,
      actioncode: 'c_screen',
      eventcode: 'library_home',
      e_courseware_filters: this.data.tabList[index].theme_name,
      open_id: this.data.userInfo.openId,
      xcx_phone: this.data.userInfo.phoneNumber
    })

    this.setData({
      tag: '',
      info: []
    }, () => {
      if (index !== 0 && index !== this.data.curTagIdx) {
        this.getFilterList(index)
      }

      if (index === 0 && index !== this.data.curTagIdx) {
        this.getRecommend()
      }
      this.setData({
        curTagIdx: index
      })
    })
  },

  // 切换学部
  switType() {
    this.setData({
      showLogin: true
    })
  },

  // 列表项点击
  handleMediaClick(e) {
    const {
      detail
    } = e;
    const {
      index
    } = e.currentTarget.dataset

    const pictureLst = {
      unkown_tile_mode: -1, //未知
      next_one_picture_content_type: 1, // 上文下一图
      next_three_picture_content_type: 2, //上文下三图
      left_right_picture_content_type: 3, //左文右图
    }
    const typeList = {
      file_display_type: 1,
      wx_article_display_type: 2,
      public_class_display_type: 3
    };
    app.itemNavigateTo(e);

    Util.log({
      logtype: 20001,
      actioncode: 'c_infor_detail',
      eventcode: 'library_home',
      e_banner_id: detail.qingqing_material_id,
      e_picture_id: pictureLst[detail.tile_mode],
      e_order: index + 1,
      e_type: typeList[detail.display_type],
      open_id: this.data.userInfo.openId,
      xcx_phone: this.data.userInfo.phoneNumber
    })
  },

  // 触及底部刷新
  onReachBottom(e) {
    if (this.data.tag) {
      if (this.data.curTagIdx !== 0) {
        this.getFilterList(this.data.curTagIdx)
      } else {
        this.getRecommend()
      }
    }
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

  // 切换城市
  switchLocal() {
    Util.log({
      logtype: 20001,
      actioncode: 'c_modify_city',
      eventcode: 'library_home',
      open_id: this.data.userInfo.openId,
      xcx_phone: this.data.userInfo.phoneNumber
    })
    this.showToast('wrong', '当前仅提供上海的学习资料')
  },

  closeLogin() {
    this.setData({
      showLogin: false
    })
  },

  goMyData() {
    Util.log({
      logtype: 20001,
      actioncode: 'c_file',
      eventcode: 'library_home',
      open_id: this.data.userInfo.openId,
      xcx_phone: this.data.userInfo.phoneNumber
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '来【轻轻图书馆】，资料免费领，本地升学抢先看',
      path: `/pages/index/index`,
      imageUrl: '/images/index_share.png'
    }
  },

})