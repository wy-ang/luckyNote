Page({
  onLoad: function(option) {
    //读取数据库
    const that = this;
    const content = option.content !== 'undefined' ? option.content : '';
    const type = option.type;
    const id = option.id;
    const db = wx.cloud.database();
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
    console.log(e)
    const type = e.detail.target.dataset.type;
    const id = e.detail.target.dataset.id;
    const content = e.detail.value.content;
    const db = wx.cloud.database();
    //编辑
    if (type === 'edit') {
      db.collection('test').doc(id).update({
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
      db.collection('test').add({
        data: {
          content
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
  selectPic(){
    const _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            user: 'test'
          },
          success(res) {
            wx.showLoading({
              title: '上传中',
            });
            const data = res.data
            // do something
          }
        })
      }
    })
  }
})