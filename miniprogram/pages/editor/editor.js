import Notify from 'vant-weapp/notify/notify';
const util = require('../../utils/util.js');
const db = wx.cloud.database();
const notes = db.collection('notes');
Page({
  data: {
    id: {},
    formats: {},
    readOnly: false,
    placeholder: '|',
    keyboardHeight: 0,
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  /**
   * {Number} -itemIndex [当前详情信息在列表页中的索引]
   * {Number} -id [当前详情信息在列表页中的id]
   */
  onEditorReady() {
    const that = this;
    const pages = getCurrentPages(); //getCurrentPages()获取当前页面栈
    const propsData = pages[pages.length - 2].data;
    wx.createSelectorQuery().select('#editor').context(function(res) {
      that.editorCtx = res.context
      if (propsData.id != '') {
        that.editorCtx.setContents({
          html: propsData.list[propsData.itemIndex].content,
          success: (res) => {
            console.log(res.errMsg)
          },
          fail: (res) => {
            console.log(res.errMsg)
          }
        })
      }
    }).exec()
    that.setData({
      id: propsData.id
    })
  },
  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function() {
        console.log('insert divider success')
      }
    })
  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: res => {
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            id: 'abcd',
            role: 'god'
          },
          width: '80%',
          success: function() {
            console.log('insert image success')
          }
        });
      }
    })
  },
  onSave: function() {
    const {
      id
    } = this.data;
    this.editorCtx.getContents({
      success: res => {
        if (id) {
          notes.doc(id).update({
            data: {
              content: res.html,
              time: util.formatTime(new Date()),
            }
          }).then(res => {
            Notify({
              type: 'success',
              message: '编辑成功',
              duration: 2000,
              onClose: () => {
                wx.redirectTo({
                  url: '../index/index',
                })
              }
            });
          });
          return;
        }
        notes.add({
          data: {
            content: res.html,
            time: util.formatTime(new Date()),
          }
        }).then(res => {
          Notify({
            type: 'success',
            message: '添加成功',
            duration: 1000,
            onClose: (res1) => {
              wx.redirectTo({
                url: '../index/index',
              })
            }
          });
        })
      }
    });
  }
})