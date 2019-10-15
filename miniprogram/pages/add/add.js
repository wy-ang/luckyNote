Page({
  data: {
    formats: {},
    placeholder: '开始输入...',
  },
  onLoad: function(option) {
    //读取数据库
    const that = this;
    const content = option.content !== 'undefined' ? option.content : '';
    console.log(content)
    const type = option.type;
    const id = option.id;
    const db = wx.cloud.database();
    this.ctx = wx.createCameraContext(); // 相机
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return;
    }

    this.setData({
      showView: true,
      content,
      type,
      id,
    })

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scroll_height: res.windowHeight - res.windowWidth / 750
        })
      },
    })
  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function(res) {
      that.editorCtx = res.context
      that.editorCtx.setContents({
        delta: that.data.content,
        success: (res) => {
          console.log(res)
        },
        fail: (res) => {
          console.log(res)
        }
      })
    }).exec();
  },
  // 修改样式
  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)
  },
  // 插入图片
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function(res) {
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
        })
      }
    })
  },
  // 编辑器失焦，同时收起键盘
  blur() {
    this.editorCtx.blur()
  },
  submit() {
    this.editorCtx.getContents({
      success: (res) => {
        const content = res.delta;
        const db = wx.cloud.database();
        db.collection('notes').add({
          data: {
            content,
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id
            this.setData({
              content
            })
            wx.showToast({
              title: '新增记录成功',
            })
            wx.redirectTo({
              url: '../index/index'
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '新增记录失败'
            })
          }
        })
      },
      fail: (res) => {
        console.log(res)
      },
    })
  },
  //操作数据库
  res: function(e) {
    const type = e.detail.target.dataset.type;
    const id = e.detail.target.dataset.id;
    const content = e.detail.value.content;
    const db = wx.cloud.database();
    //编辑
    if (type === 'edit') {
      db.collection('notes').doc(id).update({
        data: {
          content,
        },
        success(res) {
          wx.redirectTo({
            url: '../index/index'
          })
        }
      })
    } else {
      //新增
      db.collection('notes').add({
        data: {
          content,
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          this.setData({
            content
          })
          wx.showToast({
            title: '新增记录成功',
          })
          wx.redirectTo({
            url: '../index/index'
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '新增记录失败'
          })
        }
      })
    }
  },
  goBack(event) {
    wx.navigateBack({
      delta: 1
    })
  },
  // 拍照
  takePhoto() {
    wx.navigateTo({
      url: '../camera/camera'
    });
  },
})