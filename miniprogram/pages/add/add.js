Page({
  onLoad: function(option) {
    //读取数据库
    const that = this;
    const content = option.content !== 'undefined' ? option.content : '';
    console.log(option)
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
          tempFilePaths,
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
  // 选择图片
  chooseImage() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function(res) {
        const tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '上传中',
        })
        // 上传图片
        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.cloud.uploadFile({
            cloudPath: 'images' + tempFilePaths[i].match(/\.[^.]+?$/)[0],
            filePath: tempFilePaths[i],
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
        }
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  // 拍照
  takePhoto() {
    wx.navigateTo({
      url: '../camera/camera'
    });
  },
})