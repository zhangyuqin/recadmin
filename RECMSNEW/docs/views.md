# dns管理系统多链路管理
---

### 功能介绍
  当同时存在多个链路出口的时候, 配置view功能，针对不同用户，提供不同的解析

  存在两种模式：
    1. DHCP下发的是统一的DNS服务器地址
      * 从用户来源地址区分，不同的地址段，转发到不通的后端dns server上, 

    2. DHCP在不同的区域下发的是不同运营商链路下的DNS服务器地址
      * 根据不同区域，下发不同的DNS服务器地址，网络层做了策略路由

### 数据对象
* 运行模式:内部设置
  * 视图模式（view）：基于用户地址段
  * 独立模式（dest)： 基于目的地址

* 全局负载均衡算法：内部设置
  * algorithm

* 数据对象
  * pool:服务器分组
    * name
    * policy
    * cache
    
  * server
    * name
    * address
    * src_addr: 访问serve的源地址
    * note
    * status
    * isp
    * weight: 权重
    * order: 选择顺序
    
  * view功能：关联acl和pool， 链路管理, RuleView
    * name
    * distaddress
    * acl
    * pool
    * note
    * status
    * order: 规则顺序

  * cacheconf: 内部缓存参数
    * name: 
    * entries:int
    * minTTL:int
    * maxTTL: int
    * servfail: int
    * stale: int
    * keepttl： True、false
  
  * traffic schedule: 流量引导规则， RuleTraffic
    * name
    * source
    * qname
    * acl
    * pool
    * note
    * status
    * order: 规则顺序

  * TopDomain: top100 热门网站域名
    * name
    * domain
    * cdns: 关联链路
    * note

  * pool和server关系：多对多
  * view和cacheconf：一对一
  * view和pool：多对一, 多个ruleview规则可以对应于一个pool
  * ruletraffic和pool：多对一
  * view 和acl： 一对多
  

### 对象操作
  * cacheconf
  * pool
  * server
  * Link
  * ViewModel
  * RuleView
  * RuleTraffic
  

### 操作描述
* 链路管理模式1：统一DNS服务器地址
  * 实现view功能
    * 配置acl和对应的pool
    * 配置缓存
    * 链路故障监控
    * 链路冗余操作
  * 实现流量引导
    * 同时配置acl，qname和对应的pool
    
* 链路管理模式2：多链路DNS同时存在
    * 单个dnsdist定制基于目的策略
    * 链路流量调度实现

### 功能描述
  * 设置多链路模式：用户地址或者目的地址：ViewModel
  * 链路管理（pool 和 server）：Link
    * 展示
    * 增加
    * 修改
    * 删除
  * 规则管理：RuleView
    * 基于用户地址段选择链路
      * 关联acl
    * 基于目的地址选择链路
      * 关联目的地址，自定义负载均衡策略
    * 增加规则
       * 动态更新规则号
    * 删除规则
       * 动态更新规则号
    * 停用、启用规则
    * 规则顺序管理
       * 移动规则
         * 当前规则号
         * 目的规则号
       * 动态更新规则号
       
    * 更新规则
      * acl
      * note
  * 流量引导功能：RuleTraffic
    * 增加规则
      * 通过acl+qname方式，重定向查询到某个link中去
        * acl
        * qname
        * link
    * 删除规则
    * 更新规则：更新参数
      * acl
      * qname
    * 启用、停用规则

### view设计

### URL设计

### 其他变化部分
  * 默认针对所有view
  * cache管理
  * 每个view都有自己的管理域
      * 转发域名
      * 本地域名
      * 防污染域名
      * 禁止访问列表
      * cache 管理

### dnsdist 目的地址关联pool操作
```
eduNMG = newNMG()
eduNMG:addMask("240c:f:0:ffe7:1::11/128")
addAction(NetmaskGroupRule(eduNMG, false), PoolAction('rdns1'))
```

## 递归管理系统优化
### 增加版本信息及功能描述
### 增加初始化安装界面
  * 生成初始化配置
  * 处理节点添加的情况
  
### 增加help页面功能，显示版本特征


