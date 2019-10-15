// miniprogram/pages/camera/camera.js
Page({
  onLoad: function(option) {
    this.ctx = wx.createCameraContext(); // 相机
  },
  /**
   * 页面的初始数据
   */
  data: {

  },
  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(res);
        this.setData({
          src: res.tempImagePath
        })
      }
    })
  }
})