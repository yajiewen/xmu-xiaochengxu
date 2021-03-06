let tools = require('../../tools/tools')
// 获取应用实例
const app = getApp()

Page({
    data: {
        // 下拉刷新状态
        refstate: false,
        selectindex: 0, // 导航下标
        // 店铺列表
        storeList: [],
        // 店铺信息批次
        storeBatch: 0,
        // 店铺信息获取完
        storeGetted : false,
        // 商品列表
        thingList: [
            [],
            [],
            [],
            [],
            [],
            []
        ],
        // 店铺信息批次
        thingBatch: [0, 0, 0, 0, 0, 0],
        // 对应类别是否已经获取完
        thingGetted: [false, false, false, false, false, false],
        // 商品类别
        leibie: ["学习类", "生活类", "数码类", "化妆品", "衣品类", "其他"],
    },
        // 展示加载
        showLoad() {
            wx.showLoading({
                title: '加载中',
            })
        },
        // 关闭加载
        closeLoad() {
            wx.hideLoading({
                success: (res) => {},
            })
        },
    gotoStoreDetail(event){
        let info = this.data.storeList[event.currentTarget.dataset.index]
        // 把当前商品信息转化为字符串传递到另外一个页面
        let data = JSON.stringify(info)
        wx.navigateTo({
          url: "/pages/storedetail/storedetail?info=" + data,
        })
    },
    gotoThingDetail(event){
        let info = this.data.thingList[this.data.selectindex - 1][event.currentTarget.dataset.index]
        // 把当前商品信息转化为字符串传递到另外一个页面
        let data = JSON.stringify(info)
        wx.navigateTo({
          url: "/pages/thingdetail/thingdetail?info=" + data,
        })
    },
    // 上拉添加
    addInfoList(event) {
        if (this.data.selectindex == 0 ) { //当前市商家列表
            if(this.storeGetted == false){
                this.getStoreList()
            }else{
                console.log("店铺获取完")
            }
            
        } else { // 否则刷新商品列表
            if(this.data.thingGetted[this.data.selectindex - 1] == false){
                this.getThingList()
            }else{
                console.log("获取完")
            }
        }
    },
    getThingList(event) {
        // 开启load
        this.showLoad()
        console.log(this.data.leibie[this.data.selectindex - 1])
        // 云函数获取数据
        wx.cloud.callFunction({
            name: "getThingInfoList",
            data: {
                index: this.data.thingBatch[this.data.selectindex - 1], // 获取对应商品类别的batch
                leibie: this.data.leibie[this.data.selectindex - 1] // 获取商品类别
            },
            success: res => {
                if (res.result.data.length != 0) {
                    // 获取到数据 batch 才++
                    this.data.thingBatch[this.data.selectindex - 1] += 1
                    for (let i = 0; i < res.result.data.length; i++) {
                        // 把数据依次加入对应的商品类别的列表
                        this.data.thingList[this.data.selectindex - 1].push(res.result.data[i])
                    }
                    // 获取到才渲染使用setData渲染新数据
                    this.setData({
                        thingList: this.data.thingList,
                        thingBatch: this.data.thingBatch
                    })
                    // 关闭load
                    this.closeLoad()
                }else{ // 没获取到数据说明以获取完 不能再获取
                    this.data.thingGetted[this.data.selectindex - 1] = true;
                    this.setData({
                        thingGetted : this.data.thingGetted
                    })
                    // 关闭load
                    this.closeLoad()
                    console.log("已获取完")
                }
                console.log(this.data.thingList)
                console.log(this.data.thingBatch)
            },
            fail(res) {
                // 关闭load
                this.closeLoad()
                tools.showErrorToast("网络君开了小差...")
                console.log("请求失败", res)
            }
        })
    },
    getStoreList(event) {
        this.showLoad()
        wx.cloud.callFunction({
            name: "getStoreInfoList",
            data: {
                index: this.data.storeBatch
            },
            success: res => {
                if (res.result.data.length != 0) {
                    this.data.storeBatch += 1
                    for (let i = 0; i < res.result.data.length; i++) {
                        this.data.storeList.push(res.result.data[i])
                    }
                    this.setData({
                        storeList: this.data.storeList,
                        storeBatch: this.data.storeBatch
                    })
                    // 关闭load
                    this.closeLoad()
                }else{
                    // 关闭load
                    this.closeLoad()
                    this.data.storeGetted = true
                    console.log("店铺获取完成")
                }
                console.log(this.data.storeList)
                console.log(this.data.storeBatch)
            },
            fail(res) {
                // 关闭load
                this.closeLoad()
                tools.showErrorToast("网络君开了小差...")
                console.log("请求失败", res)
            }
        })
    },
    changeStyle(event) {
        this.data.selectindex = event.currentTarget.dataset.index
        console.log(this.data.selectindex)
        this.setData({
            selectindex: this.data.selectindex
        })
        if(this.data.selectindex == 0 && this.data.storeGetted == false) //选中美食商家
        {
            this.getStoreList()
        }
        // 个人物品对应类别若还没获取数据则获取数据
        if (this.data.selectindex != 0 && this.data.thingBatch[this.data.selectindex - 1] == 0 && this.data.thingGetted[this.data.selectindex - 1] != true) {
            this.getThingList()
        }
    },
    onLoad() {
        // 获取商家列表
        this.getStoreList()
    }
    ,
    // scrol view 下拉刷新
    refreshList(){
        console.log("刷新")
        // 刷新批次 为0
        this.data.storeBatch = 0
        this.data.thingBatch = [0, 0, 0, 0, 0, 0]
        // 刷新是否获取完 为false
        this.data.thingGetted = [false, false, false, false, false, false] 
        this.data.storeGetted = false
        // 刷新列表内容
        this.data.storeList = []
        this.data.thingList = [
            [],
            [],
            [],
            [],
            [],
            []
        ]
        // 刷新选中下标
        this.data.selectindex = 0
        // 渲染
        this.setData({
            storeBatch : this.data.storeBatch,
            thingBatch: this.data.thingBatch,
            storeList: this.data.storeList,
            thingList: this.data.thingList,
            thingGetted: this.data.thingGetted,
            storeGetted: this.data.storeGetted,
            selectindex: this.data.selectindex
        })
        this.getStoreList()
        setTimeout(res =>{
            this.setData({
                refstate : false
            })
        },200)
    }
})