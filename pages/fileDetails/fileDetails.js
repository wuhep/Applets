// pages/fileDetails/fileDetails.js
const app = getApp();
var request = require('../../utils/util.js').request;
var domains = require('../../utils/domain').domains;
var Util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLogin: false,///是否显示登录弹框（选择年级）
    phoneNumber:'',//用户手机号
    openId:'',//用户open_id
    qingqing_material_id: '',//文件id
    material_ordinary_name: '',//标题
    custom_tag: [],//所有标签
    count: null,//下载次数
    thumbnail_url: '',//缩略图url
    source_file_url: '',//源文件url
    material_suffix: '',//资料格式
    is_downloaded: false,//是否已下载
    is_collected: false,//是否收藏
    is_deleted: true,//是否已删除
    startTime: '', // 开始时间戳
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX,
      qingqing_material_id: options.qingqing_material_id
    })
    app.getLogin().then(res => {
      if (!res.phoneNumber) {
        this.setData({
          showLogin: true
        })
      }
      this.setData({
        phoneNumber:res.phoneNumber,
        openId:res.openId
      });

      Util.log({
        logtype: 20000,
        eventcode: 'library_filedetails',
        xcx_phone: res.phoneNumber,
        open_id: res.openId,
        file_id: this.data.qingqing_material_id
      })
      this.fetchFileDetailData();
    }).catch(err => {
      console.log(err)
    });

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      startTime: +Date.now()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取dialog组件
    this.dialog = this.selectComponent("#dialog");
    this.toast = this.selectComponent("#toast");
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    const now = +Date.now();
    const duration = now - this.data.startTime;
    this.sendDurationLog(duration);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    const now = +Date.now();
    const duration = now - this.data.startTime;
    this.sendDurationLog(duration);
  },

  // 页面停留时长log
  sendDurationLog(duration) {
    if (!duration) return false;
    Util.log({
      logtype: 20004,
      eventcode: 'o_library_filedetails',
      stay_time: duration,
      xcx_phone: this.data.phoneNumber,
      open_id: this.data.openId,
      file_id: this.data.qingqing_material_id
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.material_ordinary_name,
      path: `/pages/webview/transfer?qingqing_material_id=${this.data.qingqing_material_id}`,
      imageUrl: '/images/file_share_img.png'
    }
  },

  login(e) {
    console.log(e)
    const { phone_number, study_phase_enum } = e.detail
    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/modify-user-info.json',
      data: {
        study_phase_enum,
        phone_number
      }
    }).then((res) => {
      if (res.response && res.response.error_code === 0) {
        this.setData({
          showLogin: false
        })
      }
    })
      .catch((err) => {
        console.log(err)
      })

  },

  // 获取文件详情
  fetchFileDetailData() {
    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/material-file-detail.json',
      data: {
        data: this.data.qingqing_material_id
      }
    }).then((res) => {
      console.log('res==>', res)
      if (res.response && res.response.error_code === 0) {
        if (res.is_deleted) {
          this.setData({
            is_deleted: res.is_deleted,
            material_ordinary_name: res.material_ordinary_name
          })
        } else {
          this.setData({
            material_ordinary_name: res.material_ordinary_name,
            custom_tag: res.custom_tag,
            count: res.count,
            is_downloaded: res.is_downloaded,
            is_collected: res.is_collected,
            is_deleted: res.is_deleted,
          })
          if (res.thumbnail_url) {
            this.setData({
              thumbnail_url: res.thumbnail_url,
              source_file_url: res.source_file_url,
              material_suffix: res.material_suffix
            })
            // if (res.material_suffix == 'doc' || res.material_suffix == 'docx') {
            //   this.setData({ material_suffix: 'docx' })
            // } else if (res.material_suffix == 'xls' || res.material_suffix == 'xlsx') {
            //   this.setData({ material_suffix: 'xlsx' })
            // } else if (res.material_suffix == 'ppt' || res.material_suffix == 'pptx') {
            //   this.setData({ material_suffix: 'pptx' })
            // } else {
            //   this.setData({ material_suffix: res.material_suffix })
            // }
          }
        }

        wx.setNavigationBarTitle({
          title: this.data.material_ordinary_name  //修改title
        })
      }
    })
      .catch((err) => {
        console.log('err', err)

      })
  },

  // 点击资料图片预览
  previewImg() {
    wx.previewImage({
      current: this.data.thumbnail_url, // 当前显示图片的http链接
      urls: [this.data.thumbnail_url]
    })
  },

  // 查看完整资料
  showFullProfile() {
    let self = this;
    console.log('文件类型=>',self.data.material_suffix)
    wx.showToast({ title: '加载中', icon: 'loading', duration: 10000 });
    wx.downloadFile({
      url: self.data.source_file_url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fileType: self.data.material_suffix,
          success: function (res) {
            console.log('打开文档成功', res)
            wx.hideToast();
          },
          fail: function (res) {
            console.log('打开文档失败=>', res)
            wx.hideToast();
          }
        })
      }
    })
  },

  // 点击收藏按钮
  collectionTap() {
    this.setData({
      is_collected: !this.data.is_collected
    });
    //sendlog
    Util.log({
      logtype: 20001,
      eventcode: 'library_filedetails',
      actioncode: 'c_collect',
      e_collect: this.data.is_collected ? 1 : 2,
      xcx_phone: this.data.phoneNumber,
      open_id: this.data.openId,
      file_id: this.data.qingqing_material_id
    })
    request({
      url: domains.api + '/socialiosvc/api/tpt/v1/social-library/material-collect.json',
      data: {
        qingqing_material_id: this.data.qingqing_material_id,
        is_collect: this.data.is_collected
      }
    }).then((res) => {
      console.log(res)
      if (this.data.is_collected) {
        this.showToast('success', '已收藏')
      } else {
        this.showToast('success', '已取消收藏')
      }
    })
      .catch((err) => {
        console.log(err)
      })

  },
  // 点击分享
  toShareTap() {
    //sendlog
    Util.log({
      logtype: 20001,
      eventcode: 'library_filedetails',
      actioncode: 'c_ta_share',
      xcx_phone: this.data.phoneNumber,
      open_id: this.data.openId,
      file_id: this.data.qingqing_material_id
    })
  },

  // 领取资料
  receiveInfo() {
    this.dialog.show();
    //sendlog
    Util.log({
      logtype: 20001,
      eventcode: 'library_filedetails',
      actioncode: 'c_go_get',
      xcx_phone: this.data.phoneNumber,
      open_id: this.data.openId,
      file_id: this.data.qingqing_material_id
    })
  },

  // 点击弹出框的取消
  handleCancelDialog() {
    this.dialog.hide();
    this.dialog.changeHintMsg('');
    this.dialog.changeEmailVal('');
    //sendlog
    Util.log({
      logtype: 20001,
      eventcode: 'library_filedetails',
      actioncode: 'c_cancel',
      xcx_phone: this.data.phoneNumber,
      open_id: this.data.openId,
      file_id: this.data.qingqing_material_id
    })
  },

  // 点击弹出框的确认
  handleConfirmlDialog() {
    //sendlog
    Util.log({
      logtype: 20001,
      eventcode: 'library_filedetails',
      actioncode: 'c_commit',
      xcx_phone: this.data.phoneNumber,
      open_id: this.data.openId,
      file_id: this.data.qingqing_material_id
    })
    let dialogData = this.dialog.data;
    if (dialogData.email == '') {
      this.dialog.changeHintMsg('请输入邮箱地址');
    }
    if (this.dialog.data.isLegalEmail) {
      request({
        url: domains.api + '/socialiosvc/api/tpt/v1/social-library/material-operation.json',
        data: {
          email: dialogData.email,
          qingqing_material_id: this.data.qingqing_material_id,
          operation_type: 2
        }
      }).then((res) => {
        console.log(res)
        this.setData({
          is_downloaded: true
        })
        this.dialog.hide();
        this.dialog.changeEmailVal('');
        this.showToast('success', '提交成功，1小时内资料将送达您邮箱')
      })
        .catch((err) => {
          console.log(err)
        })

    }
  },

  showToast(type, title) {
    this.toast.showToast({
      type: type,
      title: title,
      compelete: function () {
        console.log('toast框隐藏之后，会调用该函数')
      }
    })
  },
})