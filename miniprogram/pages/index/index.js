//index.js
const app = getApp()
var WxParse = require('../wxParse/wxParse.js');
var util = require('../../utils/util.js');

Page({
  // 获取用户信息
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  onLoad: function() {
    //读取数据库
    const that = this;
    var time = util.formatTime(new Date());
    const db = wx.cloud.database();
    db.collection('notes').get().then(res => {
      const list = res.data;
      this.setData({
        list: list,
        time: time,
      })
      // for (let i = 0; i < list.length; i++){
      //   WxParse.wxParse('reply' + i, 'html', list[i].content, this);
      //   if (i === list.length - 1) {
      //     WxParse.wxParseTemArray("listArr", 'reply', list.length, this)
      //   }
      // }
    })

    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scroll_height: res.windowHeight - res.windowWidth / 750
        })
      },
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  toAdd(event) {
    const touchTime = this.data.touch_end - this.data.touch_start;
    const dataset = Object.keys(event.currentTarget.dataset).length > 0 ? event.currentTarget.dataset : false;
    const id = dataset ? event.currentTarget.dataset.id : '';
    const modalName = dataset ? event.currentTarget.dataset.target : '';
    const content = dataset ? event.currentTarget.dataset.content : '';
    const type = id ? 'edit' : null;
    if (touchTime > 350) {
      this.data.touch_start = 0;
      this.data.touch_end = 0;
      this.setData({
        modalName,
        id,
      })
    } else {
      wx.navigateTo({
        url: '../add/add?content=' + content + '&id=' + id + '&type=' + type
      });
    }
  },
  //按下事件开始  
  touchStart: function(e) {
    this.setData({
      touch_start: e.timeStamp
    })
  },
  //按下事件结束  
  touchEnd: function(e) {
    this.setData({
      touch_end: e.timeStamp
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  enterModal(e) {
    var that = this;
    const db = wx.cloud.database()
    db.collection('notes').doc(e.currentTarget.dataset.id).remove({
      success(res) {
        that.onLoad();
      }
    })
    this.setData({
      modalName: null
    })
  },
})