// 上文下一图
// 常量
const ICON_DOWNLOAD = '../../../images/icon/icon-download.png'; // 下载图标
const ICON_REVIEW = '../../../images/icon/icon-review.png'; // 查看图标
const ICON_APPLY = '../../../images/icon/icon-apply.png'; // 播放图标
const DISPLAY_TYPE_REFLECT_ICON_URL = { // 展示类型映射图标样式
  'file_display_type': ICON_DOWNLOAD,
  'wx_article_display_type': ICON_REVIEW,
  'public_class_display_type': ICON_APPLY
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 媒体数据对象
    mediaInfo: {
      type: Object
    }
  },

  data: {
    // renderInfo: '',
    displayTypeReflectIcon: DISPLAY_TYPE_REFLECT_ICON_URL,
  },

  // observers: {
  //   'mediaInfo' (data) {
  //     if(this.isObject(data)) {
  //       // 根据展示类型，添加icon的显示图标
  //       data.iconStyl = DISPLAY_TYPE_REFLECT_ICON_URL[data.display_type];
  //       this.setData({
  //         renderInfo: data
  //       })
  //     }
  //   }
  // },

  methods: {
    handleItemClick(e) {
      this.triggerEvent("mediaClick", this.data.mediaInfo)
    },
    isObject(param) {
      return param && (param instanceof Object) && !Array.isArray(param)
    }
  }
})
