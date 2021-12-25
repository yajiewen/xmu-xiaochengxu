let app = getApp()
let dbthinglist = wx.cloud.database().collection("thinglist")
let tools = require('../../tools/tools')
Page({

    data: {
        thingList: [],
        thingInfoList: [],
        thingBath: 0,
        gettedAll: false
    },
    gotoThingDetail(event) {
        let info = this.data.thingInfoList[event.currentTarget.dataset.index]
        // 把当前商品信息转化为字符串传递到另外一个页面
        let data = JSON.stringify(info)
        wx.navigateTo({
            url: "/pages/thingdetail/thingdetail?info=" + data,
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.cloud.callFunction({
            name: "getMyCollect",
            data: {
                index: this.data.thingBath,
                openid: app.globaldata.openid
            },
            success: res => {
                console.log(res.result.data.length)
                console.log(res)
                console.log(this.data.thingList)
                if (res.result.data.length != 0) {
                    this.data.thingBath += 1
                    for (let i = 0; i < res.result.data.length; i++) {
                        this.data.thingList.push(res.result.data[i])
                        // 获取商品信息
                        dbthinglist.where({
                            _id:  res.result.data[i].thingid,
                        }).get({
                            success: res => {
                                console.log(res)
                                this.data.thingInfoList.push(res.data[0])
                                this.setData({
                                    thingInfoList: this.data.thingInfoList
                                })
                            },
                            fail: res => {
                                tools.showErrorToast("开了小差...")
                            }
                        })
                    }
                    this.setData({
                        thingList: this.data.thingList,
                    })
                } else {
                    this.data.gettedAll = true
                }
                console.log(this.data.thingList)
                console.log(this.data.thingInfoList)
            }
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (!this.data.gettedAll) {
            wx.cloud.callFunction({
                name: "getMyCollect",
                data: {
                    index: this.data.thingBath,
                    openid: app.globaldata.openid
                },
                success: res => {
                    console.log(res.result.data.length)
                    console.log(res)
                    console.log(this.data.thingList)
                    if (res.result.data.length != 0) {
                        this.data.thingBath += 1
                        for (let i = 0; i < res.result.data.length; i++) {
                            this.data.thingList.push(res.result.data[i])
                            // 获取商品信息
                            dbthinglist.where({
                                _id:  res.result.data[i].thingid,
                            }).get({
                                success: res => {
                                    console.log(res)
                                    this.data.thingInfoList.push(res.data[0])
                                    this.setData({
                                        thingInfoList: this.data.thingInfoList
                                    })
                                },
                                fail: res => {
                                    tools.showErrorToast("开了小差...")
                                }
                            })
                        }
                        this.setData({
                            thingList: this.data.thingList,
                        })
                    } else {
                        this.data.gettedAll = true
                    }
                    console.log(this.data.thingList)
                    console.log(this.data.thingInfoList)
                }
            })
        }else{
            console.log("已获取完")
        }
    },
})