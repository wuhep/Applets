// components/mydatacont/mydatacont.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 数据
    message: {
      type: Object
    },
  },

  data: {
  },

  methods: {
    // 媒体对象点击事件
    handleMediaClick(data) {
      this.triggerEvent("emitMediaClick", data)
    },
    // 监听是否滚动到底部
    watchCollectedMaterialScrolltolower() {
      this.triggerEvent("scrolltolower", this.data.message)
    },
  }
})
