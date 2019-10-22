// components/login.js
var Util =require('../../utils/util');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    phone:{
      type:String
    },
    openId:{
      type:String
    },
    qingqingMaterialId:{
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showDialog:false,
    hintMsg:'',
    email:'',
    isLegalEmail:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show(){
      this.setData({
        showDialog:true,
      })
    },

    hide(){
      this.setData({
        showDialog:false
      })
    },

    _cancel(){
      // 触发取消回调
      this.triggerEvent("cancel")
    },

    _confirm(){
      // 触发确认回调
      this.triggerEvent("confirm")
    },
    
    emailInput(e){
      this.setData({
        email:e.detail.value
      })
    },

    // 聚焦
    inputFocus(e){
      this.changeHintMsg('');
      //sendlog
      Util.log({
        logtype: 20001,
        eventcode: 'library_filedetails',
        actioncode: 'c_write',
        xcx_phone: this.data.phone,
        open_id: this.data.openId,
        file_id: this.data.qingqingMaterialId
      })
    },

    // 失焦
    inputBlur(e){
      let email = e.detail.value;
      let reg = new RegExp('^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$');       
      let regEmail;
      if(email){
        regEmail = reg.test(email); 
        console.log('失去焦点',regEmail);
        this.setData({
          isLegalEmail:regEmail
        })
        if(!regEmail){
          this.changeHintMsg('请输入正确的邮箱地址，如xxx@xxx.com');
        }else{
          this.changeHintMsg('');
        }
      }else{
        this.changeHintMsg('');

      }
    },

    // 更改email的value值
    changeEmailVal(val){
      this.setData({email:val})
    },

    // 更改hint_msg值
    changeHintMsg(msg){
      this.setData({hintMsg:msg})
    }
  }
})