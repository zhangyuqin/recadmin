# dns管理系统多链路管理 （Template）

### 模板对象（模块为多链路管理 form表单）

* SysConfig: 系统配置
	* view
		* show
		* add
		* update
	* url
		* show
		* add
		* update
		* delete
		* search
	* form
		* action
			* add
			* update
			* search
		* input
			* viewmodel
	* items to display（template其他元素）
		* model(模态框)
		* table(数据展示)
		* 分页
		* button
			* 更新
			* 删除
			* 搜索
			* 取消
			* 确定
	* js
		* 重复验证
		* form 组装
* LinkType: 运营商
	* url
		* show
		* add
		* update
		* delete
		* search
	* Template(linktype.html)
		* table
			* id
			* name
			* input(checkbox)
			* button (update)
			* a(delete)
		* modal
			* form
				* action
					* add
					* update
				* input
					* name=name;value=content.name
					* id=content.id
					* name=csrfmiddlewaretoken;value=window.csrf_token
				* button
					* cancle
					* submit
		* search 
			* form
				* action
					* search
				* input 
					* name=q
				* button
					* type=submit
		* button
			* add
		* 分页
			* {% include "recadmin/page.html" %}
		* linktyp.js(add和update dom和数据组装)
			* function
				* resubmit(防止重复提交)
				* $('.btn-linktype').on('click',function(){}),动态绑定，判断add和update
				* $('#modal-linktype').html() 模态框添加dom

* Pool: 运营商链路
	* url
		* show
		* add
		* update
		* delete
		* search
	* form
		* action
			* add
			* update
			* search
		* input
			* name
			* server
			* policy
	* items to display（template其他元素）
		* model(模态框)
		* table(数据展示)
		* 分页
		* button
			* 更新
			* 删除
			* 搜索
			* 取消
			* 确定
	* js
		* 重复验证
		* form 组装
* Server: DNS递归服务器
	* view
		* show
		* add
		* update
	* url
		* show
		* add
		* update
		* delete
		* search
	* form
		* action
			* add
			* update
			* search
		* input
			* name
			* isp
			* address
			* note
			* status
	* items to display（template其他元素）
		* model(模态框)
		* table(数据展示)
		* 分页
		* button
			* 更新
			* 删除
			* 搜索
			* 取消
			* 确定
	* js
		* 重复验证
		* form 组装
* RuleView:DNS视图
	* view
		* show
		* add
		* update
	* url
		* show
		* add
		* update
		* delete
		* search
	* form
		* action
			* add
			* update
			* search
		* input
			* distaddress
	    	* pool (OneToOneField Pool)
	    	* cache (OneToOneField CacheConf)
	    	* note
	    	* status
	* items to display（template其他元素）
		* model(模态框)
		* table(数据展示)
		* 分页
		* button
			* 更新
			* 删除
			* 搜索
			* 取消
			* 确定
	* js
		* 重复验证
		* form 组装
* CacheConfig: 缓存配置
	* view
		* show
		* add
		* update
	* url
		* show
		* add
		* update
		* delete
		* search
	* form
		* action
			* add
			* update
			* search
		* input
			* entries
		    * minTTL
		    * maxTTL
		    * servfail
		    * stale
		    * keepttl
	* items to display（template其他元素）
		* model(模态框)
		* table(数据展示)
		* 分页
		* button
			* 更新
			* 删除
			* 搜索
			* 取消
			* 确定
	* js
		* 重复验证
		* form 组装
* RuleTraffic: 流量调度
	* view
		* show
		* add
		* update
	* url
		* show
		* add
		* update
		* delete
		* search
	* form
		* action
			* add
			* update
			* search
		* input
			* source
		    * qname
		    * acls
		    * pools
		    * note
		    * status
	* items to display（template其他元素）
		* model(模态框)
		* table(数据展示)
		* 分页
		* button
			* 更新
			* 删除
			* 搜索
			* 取消
			* 确定
	* js
		* 重复验证
		* form 组装
* TopDomain(top100网站):热门网站
	* view
		* show
	* url
		* show
		* search
	* form
		* action
			* search
		* input
		    * name
		    * domain
		    * cdns
		    * note
	* items to display（template其他元素）
		* model(模态框)
		* table(数据展示)
		* 分页
		* 图表
		* button
			* 搜索
			
	* js
		* 图表插件
### TODO
    # view中各个子模块add update delete 实现方法、字段对应实现方法
    # form input各个字段获取方式及呈现方式
    # input name及字段对应，update时候只读属性
    # js 表单字段获取方式、字段对应关系，form组装方式

## 模块顺序
  1. LinkType 运营商
  2. Server: DNS递归服务器, 后端递归服务器信息
  3. CacheConf: 缓存配置
  4. Pool: 运营商链路, 配置server， 关联cache
  5. RuleView: DNS视图
  6. 热门域名: 提供DNS流量调度资源信息
  7. RuleTraffic: DNS流量调度
  
## 多链路配置流程
  规划多链路方案，准备运营商链路信息， 递归服务器信息， 热门域名资源, 设计默认DNS的负载均衡策略， 设计流量调度方案

  1. 首先配置支持的运营商
  2. 配置后端递归服务器， name, address, weight, order, source_address
  3. 配置缓存信息，为运营商链路配置做准备
  4. 配置运营商链路
  5. 配置基于源地址段的流量调度
  6. 配置热门域名为DNS流量调度准备资源
  7. 根据源IP地址，域名等进行DNS流量调度
