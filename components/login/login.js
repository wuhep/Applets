// components/login.js
var request = require('../../utils/util.js').request;
var domains = require('../../utils/domain').domains;
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isNewUser: {
      type: Boolean,
      value: true
    },
    defaultType: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    type: '',
    isNew: true,
    showPrompt: false
  },

  lifetimes: {
    attached() {
      let type = this.properties.isNewUser ? "" : this.properties.defaultType
      this.setData({
        type
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getPhoneNumber(e) {
      if (!this.data.type) {
        this.setData({
          showPrompt: true
        })
        return
      }
      if (!this.properties.isNewUser) {
        this.triggerEvent('success', {
          study_phase_enum: this.data.type
        })
        return
      }
      if (e.detail && e.detail.iv) {
        app.getLogin().then(info => {
          const {
            code
          } = info
          request({
            url: domains.api + '/socialiosvc/api/tpt/v1/social-library/decode-phone-number.json',
            data: {
              code,
              iv: e.detail.iv,
              encrypted_data: e.detail.encryptedData
            }
          }).then(res => {
            if (res.response && res.response.error_code === 0) {
              app.globalData.userInfo.phoneNumber = res.data;
              this.triggerEvent('success', {
                study_phase_enum: this.data.type,
                phone_number: res.data,
              })
            }
          })
        })

      }
    },
    select(e) {
      const {
        type
      } = e.target.dataset;
      this.setData({
        type
      })
    },
    close() {
      if (!this.properties.isNewUser) {
        this.triggerEvent('close')
      }
    },
    disable(e) {
      return false
    }
  }
})