### 数据对象(除特别注明外，默认的字段类型为string)
  * SysConfig(项目级别的model)
    * viewmodel (bool)

  * LinkType:链路类型
    * name

  * Pool:服务器分组
    * name
    * servers (ManyToManyField Server)
    * policy (ForeignKey)
    * cache (OneToOneField CacheConf)
    
  * Policy
    * name

  * Server
    `一个server即一个unbound`
    * name
    * isp (ManyToManyField LinkType)
    * address (readonly)
    * src_addr（源地址）
    * note
    * status（bool）
    * order(int)
    * weight(int)

  * RuleView
    ` view功能：关联acl和pool， 链路管理，一条链路对应一个RuleView，统一下发模式被认为一条链路，区分下发模式被认为是多条链路`

    * name
    * distaddress
    * acl
    * pool (ForeignKey Pool)
    * note
    * status（bool）
    * order（规则顺序）（int）

  * CacheConfig: 内部缓存参数
    * entries:（int）
    * minTTL:（int）
    * maxTTL:（int）
    * servfail: （int）
    * stale: （int）
    * keepttl：（bool）
  
  * RuleTraffic (traffic schedule: 流量引导规则)
    * source
    * qname
    * acl
    * poolrt (ForeignKey Pool)
    * note
    * status（bool）
    * order（规则顺序）
  * TopDomain: top100 热门网站域名
    * name
    * domain
    * cdns: 关联链路(ManyToManyField LinkType)
    * note

  * Server和LinkType关系：多对多
  * Pool和Server关系：多对多
  * RuleView和CacheConf：一对一
  * RuleView和Pool：一对一
  * RuleTraffic和Pool 多对多
  * TopDomain和LinkType 多对多

### 对象模型
## project
  * SysConfig

## app
  * CacheConf
  * Pool
  * Server
  * LinkType
  * RuleView
  * RuleTraffic
  * TopDomain
  
