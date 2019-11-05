import Notify from 'vant-weapp/notify/notify';
const util = require('../../utils/util.js');
const db = wx.cloud.database();
const notes = db.collection('notes');
Page({
  data: {
    id: {},
    formats: {},
    readOnly: false,
    placeholder: '',
    keyboardHeight: 0,
    image: null,
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
      // 有ID为编辑，然后进行塞值
      if (propsData.id != '') {
        notes.get().then(res => {
          that.editorCtx.setContents({
            html: res.data[propsData.itemIndex].content,
            success: (res) => {
              console.log(res.errMsg)
            },
            fail: (res) => {
              console.log(res.errMsg)
            }
          })
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
        wx.cloud.uploadFile({
          cloudPath: `${Math.floor(Math.random() * 1000000000)}.png`, // 上传至云端的路径
          filePath: res.tempFilePaths[0], // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            that.editorCtx.insertImage({
              src: res.fileID,
              width: '100%',
              success: function() {
                console.log('insert image success')
              }
            });
          },
          fail: console.error
        })

      }
    })
  },
  onSave: function() {
    const {
      id
    } = this.data;
    this.editorCtx.getContents({
      success: res => {
        // 解析html
        const ops = res.delta.ops;
        const deltas = [];
        const obj = {};
        let str = '';
        for (let i = 0; i < ops.length; i++) {
          const insert = ops[i].insert;
          const attributes = ops[i].attributes;
          if (typeof(insert) == 'string') {
            if (attributes) { // 是否是checkbox
              if (attributes.hasOwnProperty('list')) {
                str += insert;
              }
            }
            str += insert.replace(/\r|\n|\s|\r\n|\r\s|\n\s*/g, '') //替换空白符和换行符
          }
          if (typeof(insert) == 'object') {
            obj.image = insert.image;
          }
          if (str != '') {
            obj.title = str;
          }
          deltas.push(obj);
        }
        if (id) {
          notes.doc(id).update({
            data: {
              delta: Array.from(new Set(deltas)),
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
            delta: Array.from(new Set(deltas)),
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