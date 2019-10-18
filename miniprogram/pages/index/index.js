const db = wx.cloud.database();
const notes = db.collection('notes');
const app = getApp()
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

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    time: null,
  },

  /**
   * 分页--页面上拉触底时加载新数据
   */
  pageData: {
    skip: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.getData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getData(res => {
      wx.stopPullDownRefresh();
      //将每次加载的条数置为0,避免下拉刷新后数据展示条数错乱
      this.pageData.skip = 0;
    });
  },

  /**
   * 获取数据
   */
  getData: function(callback) {
    // 进行callback 函数为空判断,避免初次加载和底部加载新数据时报错
    if (!callback) callback = res => {};
    wx.showLoading({
      title: '数据加载中...',
    })
    notes.skip(this.pageData.skip).get().then(res => {
      // data中存储的旧数据
      const {
        list: oldList
      } = this.data;
      // 将旧数据和新数据进行合并,避免刷新后新数据覆盖旧数据
      const list = [...oldList, ...res.data];
      this.setData({
        list,
      }, res => {
        // 每次加载20条数据
        this.pageData.skip = this.pageData.skip + 20;
        wx.hideLoading();
        callback();
      })
    })
  }
})