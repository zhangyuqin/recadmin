## 模型&字段(默认字段类型string)
* LinkType
  * name: 名称
* Pool: 运营商链路
  * name: 名字
  * servers (ManyToManyField Server): 后端DNS服务器
  * policy (ForeignKey Policy): 负载均衡策略
  * cache (OneToOneField CacheConf): 缓存
* Policy： 负载均衡策略
  * name: 名字
* Server: 后端DNS服务器
  * name: 名字
  * address: 地址(ReadOnly)
  * src_addr: 源地址(ReadOnly)
  * isp (ManyToManyField LinkType): 运营商
  * order (int): 优先级
  * weight (int): 权重
  * note: 备注
  * status (bool): 状态
* RuleView: DNS视图
  * name: 名称
  * distaddress: DNS地址
  * acl (CSV): 用户网段
  * pool (ForeignKey Pool): 运营商链路
  * order (int): 优先级
  * note: 
  * status (bool)
* RuleTraffic: 流量调度
  * name: 名称
  * source: 源运营商
  * qname:  域名
  * acl (CSV): 用户网段
  * poolrt (ForeignKey Pool): 运营商链路
  * order (int)
  * note
  * status (bool)
* CacheConfig (int): 缓存配置
  * name: 名称
  * entries: 缓存总数量
  * minTTL: 进入缓存下限
  * maxTTL: 最大缓存时间
  * servfail: 故障域名缓存时间
  * stale: 过期保留时间
  * keepTTL (bool): 缓存时间自减
* TopDomain: 热门域名
  * name: 名称
  * domain: 域名
  * cdns (ManyToManyField LinkType): 运营商接入
  * note: 备注

```
字段类型覆盖优先级：总标题<标题<字段
ManyToManyField：可包含多个值，并且所有值来自另一个模型
ForeignKey：仅包含一个值，并且值来自另一个模型
CSV：后端以逗号分隔的方式存储，建议前端以可动态添加删除输入框的方式展示
OneToOneField：仅包含一个值，并且值来自另一个模型中未被占用的值
```
