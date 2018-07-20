# dnsagent 功能实现
---
## 多链路管理
   * linkType
        * 添加到数据库， dnsagent无操作

   * server: DNS递归服务器
     * add: 添加操作, 提供name, address, weight, order, srcaddr
        * newServer({address="", name="", weight=1, order=1})
         
     * del: 删除操作
         * 根据server 信息，查找到server的id, showServers() 模糊匹配(地址，pool)
         * rmServer(id)

     * update: 更新操作
         * 更新字段：name， weight， order， note， status
           * 找到server的id
           * getServer(id).name='xx'
           * getServer(id).weight=1
           * getServer(id).order=2

   * cacheconf
     * add: 添加操作, 提供, entries, maxTTL
         * pc = newPacketCache(5000000, 86400)
         * getPool("bii"):setCache(pc)
     *  update: 更新操作

   * pool
      * add: 添加操作, 提供name, servers, policy, src_addr(可选)
          * 查找到所有server的id
          * setPoolServerPolicy(policy, name)
          * getServer(id):addPool(name)
          * getPool(name):setCache(cachename)
      
      * update
         * policy
         * cache
      * del :删除操作
          * server
          * cache

   * ruleview
        * addAction(makeRule("240c:f:1:4000::/64"), PoolAction("114dns"))
        * addAction(makeRule({"240c:f:1:4000::/64", "240c:f:1:32::/64"}), PoolAction("114dns"))
   * rueltraffic
        * addAction(AndRule({makeRule({"240c:f:1:4000::/64", "240c:f:1:32::/64"}), makeRule("twblogger.com")}), PoolAction("114dns"))
   * topdomain
