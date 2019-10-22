//app.js
const request = require('./utils/util.js').request;
const domains = require('./utils/domain').domains;
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

App({
  onLaunch: function() {},
  onShow: function() {
    let _self = this;
    wx.getSystemInfo({
          success: res =>{
          let modelmes = res.model;
          if(modelmes.search('iPhone X') != -1){
              _self.globalData.isIphoneX = true
          }
      }
    })
  },
  globalData: {
    userInfo: null,
    isIphonex:false,//是否是iphoneX
  },
  getLogin() {
    return new Promise((resolve, reject) => {
      // 登录
      if (this.globalData.userInfo) {
        console.log(JSON.stringify(this.globalData.userInfo))
        resolve(this.globalData.userInfo)
        return
      }
      wx.login({
        success: res => {
          const {
            code
          } = res;
          request({
            url: domains.api + '/socialiosvc/api/pb/v1/social-library/authorize-login.json',
            data: {
              data: code
            }
          }).then(res => {
            if (res.response && res.response.error_code === 0) {
              const userInfo = {
                si: res.session_id,
                tk: res.token,
                phoneNumber: res.phone_number,
                studyPhase: res.study_phase,
                code,
                openId: res.open_id
              }
              this.globalData.userInfo = userInfo
              resolve(userInfo)
            } else {
              reject(res)
            }
          }).catch(e => {
            reject(e)
          })
        }
      })
    })
  },

  // 列表点击跳转
  itemNavigateTo(data) {
    const media = data.detail; // 获取当前点击的媒体对象数据
    console.log(media)
    if (!media) return false
    const {
      qingqing_material_id,
      display_type,
      display_info,
      public_class_type,
      material_ordinary_name
    } = media
    let url;
    switch (display_type) {
      case 'file_display_type': // 文件类型
        url = `/pages/fileDetails/fileDetails?qingqing_material_id=${qingqing_material_id}`
        break;
      case 'wx_article_display_type': // 公众号文章
        url = `/pages/webview/webview?url=${encodeURIComponent(display_info)}&id=${qingqing_material_id}&title=${encodeURIComponent(material_ordinary_name)}&type=${display_type}`
        break;
      case 'public_class_display_type': // 公开课
        url = `/pages/webview/webview?url=${
            domains.front
          }/public_lecture_detail/${
            PUBLIC_CLASS_REFLECT_VALUE[public_class_type] && PUBLIC_CLASS_REFLECT_VALUE[public_class_type]['name']
          }/${
            display_info
          }&id=${
            qingqing_material_id
          }&title=${encodeURIComponent(material_ordinary_name)}&type=${display_type}`
        break;
      default:
        this.showToast('暂不支持此类型文件的查看');
        break;
    }
    if (url) {
      wx.navigateTo({
        url
      })
    }
  },
})