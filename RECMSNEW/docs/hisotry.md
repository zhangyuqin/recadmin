# 历史查询优化
---

## 需求
  * 时间：2018/2/2
  * 提出方： 河北工业大学
  * 解决大量数据情况下历史查询响应慢问题
  * 增加域名模糊查询需求

## 解决方案
  * 限制查询结果数量
  

## 实现方式
  * 前端增加两个字段
    * 模糊查询字段: 
      * name: fuzz
      * type: bool, 开关类型， 参考yes or no 的实现方式
      * value: 默认值false， 
    * 查询数量限制
      * name: qlimit
      * type: 整数
      * value: 默认值100， 可选择范围0-1000 , 0: 表示没有限制， 大于0表示限制 qlimit条数据
  * 后端实现
    * 限制QuerySet数量
    * 模糊搜索实现: done
    * 注意事项
