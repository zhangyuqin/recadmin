from django.db import models

# Create your models here.

class Server (models.Model):
    name = models.CharField('名字', max_length=20,unique=True)
    address = models.GenericIPAddressField('IP',unique=True)
    order = models.PositiveSmallIntegerField('优先级')
    weight = models.PositiveSmallIntegerField('权重')
    note = models.CharField('备注', max_length=20)
    status = models.BooleanField('已启用', default=1, choices=((0, False), (1, True)))
    src_addr = models.GenericIPAddressField('源IP', blank=True, null=True)
    dtype = models.CharField('DNS类型',default='other', max_length=30, choices=(
        ('dist_unbound', '解析地址'),
        ('dnsdist', '管理地址（本机）'),
        ('other', '其他解析地址'),
    ))
    owner = models.ForeignKey('auth.User', related_name='server_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.name


class Policy (models.Model):
    name = models.CharField('名字', max_length=20)

    def __str__(self):
        return self.name


class CacheConfig (models.Model):
    name = models.CharField('名字(不能特殊字符或数字开头)', max_length=20)
    entries = models.PositiveIntegerField('缓存数量')
    minTTL = models.PositiveIntegerField('最小TTL')
    maxTTL = models.PositiveIntegerField('最大TTL')
    servfail = models.PositiveIntegerField('SERVFAIL')
    stale = models.PositiveIntegerField('过期时间')
    keepTTL = models.BooleanField('保持TTL', default=1, choices=((0, False), (1, True)))
    owner = models.ForeignKey('auth.User', related_name='cc_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Pool (models.Model):
    name = models.CharField('名字', max_length=20,unique=True)
    servers = models.ManyToManyField(Server,default=None,blank=True)
    policy = models.ForeignKey(Policy, on_delete=models.PROTECT, blank=True, null=True)
    cache = models.ForeignKey(CacheConfig,on_delete=models.PROTECT, blank=True, null=True)
    owner = models.ForeignKey('auth.User', related_name='pool_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.name


class RuleView (models.Model):
    name = models.CharField('名字', max_length=20,unique=True)
    distaddress = models.GenericIPAddressField('DNS服务地址')
    acl = models.CharField('ACL', max_length=215,unique=True)
    pool = models.ForeignKey(Pool, on_delete=models.PROTECT)
    order = models.PositiveSmallIntegerField('优先级')
    note = models.CharField('备注', max_length=20)
    status = models.BooleanField('已启用', default=1, choices=((0, False), (1, True)))
    owner = models.ForeignKey('auth.User', related_name='rv_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.name


class RuleTraffic (models.Model):
    name = models.CharField('名字', max_length=20,unique=True)
    source = models.CharField('来源', max_length=20)
    qname = models.ForeignKey('TopDomain', on_delete=models.PROTECT,default=None,blank=True,null=True)
    acl = models.CharField('ACL', max_length=215,unique=True)
    pool = models.ForeignKey(Pool, on_delete=models.PROTECT)
    order = models.PositiveSmallIntegerField('优先级')
    note = models.CharField('备注', max_length=20)
    status = models.BooleanField('已启用', default=1, choices=((0, False), (1, True)))
    owner = models.ForeignKey('auth.User', related_name='rt_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.name


class TopDomain (models.Model):
    name = models.CharField('名字', max_length=20,unique=True)
    domain = models.CharField('域名', max_length=255,unique=True)
    cdns = models.ForeignKey(Pool,on_delete=models.PROTECT,default=None,blank=True,null=True)
    note = models.CharField('备注', max_length=20)
    owner = models.ForeignKey('auth.User', related_name='td_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.domain