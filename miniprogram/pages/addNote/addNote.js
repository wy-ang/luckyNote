const db = wx.cloud.database();
const notes = db.collection('notes');
var util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    editData: {},
    image: null,
    id: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (Object.keys(options).length !== 0) {
      notes.doc(options.id).get().then(res => {
        this.setData({
          editData: res.data,
          id: options.id,
          image: res.data.image
        })
      });
    }
  },
  /**
   * 上传图片
   */
  selectImage: function() {
    wx.chooseImage({
      success: (res) => {
        wx.cloud.uploadFile({
          cloudPath: `${Math.floor(Math.random() * 10000000000)}.png`,
          filePath: res.tempFilePaths[0],
        }).then(res => {
          console.log(res.fileID);
          this.setData({
            image: res.fileID
          })
        }).catch(err => {
          console.log(err);
        })
      },
    })
  },
  /**
   * 表单提交
   */
  onSubmit: function(event) {
    const {
      id
    } = this.data;
    const {
      detail: {
        value: {
          content
        }
      }
    } = event;
    if (id) {
      notes.doc(id).update({
        data: {
          content,
          time: util.formatTime(new Date()),
          image: this.data.image,
        }
      }).then(res => {
        wx.showToast({
          title: '添加成功',
          success: res => {
            wx.redirectTo({
              url: `../index/index?id=${res.id}`,
            })
          }
        })
      });
      return;
    }
    notes.add({
      data: {
        content,
        time: util.formatTime(new Date()),
        image: this.data.image,
      }
    }).then(res => {
      wx.showToast({
        title: '添加成功',
        success: res => {
          wx.redirectTo({
            url: `../index/index?id=${res.id}`,
          })
        }
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})