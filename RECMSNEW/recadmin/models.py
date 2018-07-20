from django.db import models
from viewadmin.models import Pool,Server

# Create your models here.
class ACL (models.Model):
    name = models.CharField('名字', max_length=20,unique=True)
    acl = models.CharField('ACL', max_length=200,unique=True)
    status = models.BooleanField('已启用', default=0, choices=((0, False), (1, True)))
    owner = models.ForeignKey('auth.User', related_name='acl_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.name
    def get_fields(self):
        return [self.name, self.acl, self.status]

    def get_cmd(self):
        return None

    def get_remove_cmd(self):
        return None


class FowarDomain (models.Model):
    domain = models.CharField('转发域名', max_length=250,unique=True)
    server = models.CharField('NS', max_length=160)
    only = models.BooleanField('只转发', default=0, choices=((0, False), (1, True)))
    status = models.BooleanField('已启用', default=0, choices=((0, False), (1, True)))
    pool = models.ForeignKey(Pool,on_delete=models.PROTECT,default=None,blank=True,null=True)
    owner = models.ForeignKey('auth.User', related_name='fd_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.domain
    def get_fields(self):
        return [self.domain, self.server, self.only, self.status,self.pool]

    def get_cmd(self):
        return 'forward_add ' + self.domain + ' ' + self.server.replace(',', ' ')

    def get_remove_cmd(self):
        return 'forward_remove ' + self.domain


class SecurityDomain (models.Model):
    dgroup = models.ForeignKey('DomainGroup', on_delete=models.PROTECT, db_column='domaingrpid', blank=True, null=True)
    domain = models.CharField('防污染域名', max_length=255,unique=True)
    status = models.BooleanField('已启用', default=0, choices=((0, False), (1, True)))
    note = models.CharField('备注', default='security domain', max_length=50)
    pool = models.ForeignKey(Pool,on_delete=models.PROTECT,default=None, blank=True,null=True)
    ns = models.CharField('默认转发地址',max_length=255,default='240c:F:1:22::105,240c:F:1:22::103')
    owner = models.ForeignKey('auth.User', related_name='sd_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.domain
    def get_fields(self):
        return [self.domain, self.status]

    def get_cmd(self):
        return 'forward_add ' + str(self.domain) +' '+ str(self.ns)

    def get_remove_cmd(self):
        return 'forward_remove ' + str(self.domain)


class LocalZone (models.Model):
    zone = models.CharField('本地区域名', max_length=250,unique=True)
    rtype = models.CharField('响应类型', max_length=20, choices=(
        ('deny', '丢弃'),
        ('refuse', '拒绝'),
        ('static', '仅本地'),
        ('redirect', '重定向'),
        ('typetransparent', '穿透'),
        ))
    '''
    ('transparent', 'transparent'),
    ('nodefault', 'nodefault'), 
    ('inform', 'inform'),
        ('inform_deny', 'inform_deny'),
        ('always_transparent', 'always_transparent'),
        ('always_refuse', 'always_refuse'),
        ('always_nxdomain', 'always_nxdomain')'''
    status = models.BooleanField('已启用', default=0, choices=((0, False), (1, True)))
    pool = models.ForeignKey(Pool,on_delete=models.PROTECT,default=None, blank=True,null=True)
    owner = models.ForeignKey('auth.User', related_name='lz_user', default=1, on_delete=models.CASCADE)
    def get_fields(self):
        return [self.zone, self.rtype, self.status,self.pool]
    def __str__(self):
        return self.zone

    def get_cmd(self):
        return 'local_zone ' + self.zone + ' ' + self.rtype

    def get_remove_cmd(self):
        return 'local_zone_remove ' + self.zone

class LocalData (models.Model):
    domain = models.CharField('域名', max_length=250,unique=True)
    rr = models.CharField('资源类型', max_length=30)
    address = models.CharField('IP地址', max_length=200)
    pool = models.ForeignKey(Pool,on_delete=models.PROTECT,default=None, blank=True,null=True)
    owner = models.ForeignKey('auth.User', related_name='ld_user', default=1, on_delete=models.CASCADE)
    def get_fields(self):
        return [self.domain, self.rr, self.address,self.pool]
    def __str__(self):
        return self.domain

    def get_cmd(self):
        return 'local_data ' + self.domain + ' ' + self.rr + ' ' + self.address

    def get_remove_cmd(self):
        return 'local_data_remove ' + self.domain


class DomainGroup(models.Model):
    name = models.CharField('名字', max_length=20,unique=True)
    tag = models.CharField('标签', max_length=20)
    owner = models.ForeignKey('auth.User', related_name='dg_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class SecDomainACL(models.Model):
    acl = models.CharField('ACL', max_length=200,unique=True)
    domaingroups = models.ManyToManyField(DomainGroup,default=None,blank=True)
    status = models.BooleanField('已启用', default=1, choices=((0, False), (1, True)))
    note = models.CharField('备注', default='security domain acl', max_length=50)
    owner = models.ForeignKey('auth.User', related_name='sda_user', default=1, on_delete=models.CASCADE)
    def __str__(self):
        return self.acl


class ServerProfile(models.Model):
    server = models.ForeignKey(Server)
    port = models.IntegerField('端口',default=53)
    path = models.CharField('目录', max_length=100, default="/usr/local/etc/unbound")
    conf = models.CharField('配置文件', default="unbound.conf", max_length=40)
    dtype = models.CharField('DNS类型', max_length=30,default='dnsdist', choices=(
        ('unbound', '后端'),
        ('dnsdist', '前端')
    ))
    controlkey = models.CharField('控制认证',default='MXNeLFWHUe4363BBKrY06cAsH8NWNb+Se2eXU5+Bb74=',max_length=128)
    statskey = models.CharField('内建服务认证',default='UG93ZXJETlM6Z2VoZWltMg==',max_length=128)
    owner = models.ForeignKey('auth.User', related_name='sp_user',default=1, on_delete=models.CASCADE)

    class Meta:
        unique_together = (("server", "port"),)

    def __str__(self):
        if ':' in self.server.address:
            return '['+self.server.address+']:' + str(self.port)
        else:
            return self.server.address + ':' + str(self.port)

class Test(models.Model):
    server = models.ForeignKey(Server,default=None,null=True,blank=True)
    port = models.IntegerField('端口',default=53)
    path = models.CharField('目录', max_length=100, default="/usr/local/etc/unbound")
    conf = models.CharField('配置文件', default="unbound.conf", max_length=40)
    dtype = models.CharField('DNS类型', max_length=30,default='dnsdist', choices=(
        ('unbound', '后端'),
        ('dnsdist', '前端')
    ))
    controlkey = models.CharField('控制认证',default='MXNeLFWHUe4363BBKrY06cAsH8NWNb+Se2eXU5+Bb74=',max_length=128)
    statskey = models.CharField('内建服务认证',default='UG93ZXJETlM6Z2VoZWltMg==',max_length=128)
    owner = models.ForeignKey('auth.User', related_name='owner_user',default=1, on_delete=models.CASCADE)

    class Meta:
        unique_together = (("server", "port"),)

    def __str__(self):
        if ':' in self.server.address:
            return '['+self.server.address+']:' + str(self.port)
        else:
            return self.server.address + ':' + str(self.port)
