let app = getApp()
let dbthinglist = wx.cloud.database().collection("thinglist")
let tools = require('../../tools/tools')
Page({
    data: {
        thingList:[],
        thingBath:0,
        gettedAll: false,
    },
    // 删除商品
    delThing(event){
        dbthinglist.doc(this.data.thingList[event.currentTarget.dataset.index]._id).remove({
            success: res =>{
                tools.showRightToast("下架成功!")
                this.data.thingList.splice(event.currentTarget.dataset.index,1)
                this.setData({
                    thingList: this.data.thingList
                })
            },
            fail: res =>{
                tools.showErrorToast("开了小差..")
            }
        })
    },
    // 去详情页面
    gotoThingDetail(event) {
        let info = this.data.thingList[event.currentTarget.dataset.index]
        // 把当前商品信息转化为字符串传递到另外一个页面
        let data = JSON.stringify(info)
        wx.navigateTo({
            url: "/pages/thingdetail/thingdetail?info=" + data,
        })
    },
    // 获取我的发布商品列表
    getThingList(){
        wx.cloud.callFunction({
            name:"getMythings",
            data:{
                index: this.data.thingBath,
                openid: app.globaldata.openid,
            },
            success: res => {
                console.log(res)
                if(res.result.data.length != 0){
                    for(let i = 0; i < res.result.data.length; i++){
                        this.data.thingList.push(res.result.data[i]);
                    }
                    this.data.thingBath += 1
                    this.setData({
                        thingList: this.data.thingList,
                    })
                }else{
                    this.data.gettedAll = true
                    console.log("获取完")
                }
            }
        })
    },
    onLoad: function (options) {
        this.getThingList()
    },

    onReachBottom: function () {
        if(!this.data.gettedAll){
            this.getThingList()
        }else{
            console.log("已经获取完")
        }
    },
})