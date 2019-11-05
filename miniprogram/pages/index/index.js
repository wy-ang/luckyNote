import Notify from 'vant-weapp/notify/notify';
const db = wx.cloud.database();
const notes = db.collection('notes');
const app = getApp();
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
    id: '', //当前选中的item id
    itemIndex: '',
    time: null,
    value: '',
    show: false,
    actions: [{
      name: '删除',
      color: '07c160'
    }]
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      id: ''
    })
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
      // this.pageData.skip = 0;
    });
  },

  /**
   * 给editor页面传递当前被点击项的索引及id
   */
  setIndex: function(e) {
    this.setData({
      id: e.currentTarget.id,
      itemIndex: e.currentTarget.dataset.index
    })
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
      console.log(res)
      const oldList = this.data.list;
      // 将旧数据和新数据进行合并,避免刷新后新数据覆盖旧数据
      this.setData({
        list: oldList.concat(res.data),
      }, res => {
        // 每次加载20条数据
        this.pageData.skip = this.pageData.skip + 20;
        wx.hideLoading();
        callback();
      })
    })
  },
  /**
   * 搜索便签
   * event.detail 为当前输入的值
   */
  onChange(event) {
    const _ = db.command
    notes.where({
        // gt 方法用于指定一个 "大于" 条件，此处 _.gt(30) 是一个 "大于 30" 的条件
        content: {
          $regex: '.*' + event.detail,
          $options: 'i'
        }
      })
      .get({
        success: res => {
          this.setData({
            list: res.data,
          })
        }
      })
  },

  onCancel() {
    this.setData({
      show: false
    });
  },

  onSelect(event) {
    const id = this.data.id;
    notes.doc(id).remove({
      success: res => {
        notes.get().then(res => {
          this.setData({
            list: res.data,
            show: false
          }, res => {
            Notify({
              type: 'success',
              message: '删除成功',
              duration: 2000,
            });
          })
        })
      }
    })
  },

  longpress(event) {
    this.setData({
      show: true,
      id: event.currentTarget.id
    });
  }
})