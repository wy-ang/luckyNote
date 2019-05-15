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
      db.collection('test').doc(id).update({
        data: {
          content
        },
        success(res) {
          console.log(res.data)
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
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '新增记录失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    }
  },

  goBack(event) {
    wx.navigateBack({
      delta: 1
    })
  }
})