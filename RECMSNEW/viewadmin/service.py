from . import  remote
class ViewOps(object):
    def __init__(self, obj):
        self.obj = obj 

    def delete(self):
        pass

    def update(self, *args, **kargs):
        pass

    def delete_batch(self, *args, **kargs):
        pass

    def enable_batch(self, *args, **kargs):
        pass

    def disable_batch(self, *args, **kargs):
        pass

class CacheConfigOps(object):
    def __init__(self, obj):
        self.obj = obj

    def delete(self):
        remote.delcache(self.obj.name)


class PolicyOps(object):
    def __init__(self, obj):
        self.obj = obj 

    def delete(self):
        pass

    def update(self, name):
        if self.obj.name != name:
            self.obj.name = name
            self.obj.save()

class PoolOps(object):
    def __init__(self, obj):
        self.obj = obj 

    def delete(self):
        remote.delpool(self.obj.name)

class RuleTrafficOps(object):
    def __init__(self, obj):
        self.obj = obj 

    def add(self):
        remote.addruletraffic(self.obj.acl, self.obj.qname.domain, self.obj.pool.name)

    def delete(self):
        remote.delruletraffic(self.obj.acl, self.obj.qname.domain, self.obj.pool.name)

    @classmethod
    def enable_batch(cls, objs):
        for obj in objs:
            addobj = cls(obj)
            addobj.add()

    @classmethod
    def disable_batch(cls, objs):
        for obj in objs:
            delobj = cls(obj)
            delobj.delete()

class RuleViewOps(object):
    def __init__(self, obj):
        self.obj = obj 

    def add(self):
        remote.addruleview(self.obj.acl, self.obj.pool.name)

    def delete(self):
        remote.delruleview(self.obj.acl, self.obj.pool.name)

    @classmethod
    def enable_batch(cls, objs):
        for obj in objs:
            addobj = cls(obj)
            addobj.add()

    @classmethod
    def disable_batch(cls, objs):
        for obj in objs:
            delobj = cls(obj)
            delobj.delete()

class ServerOps(object):
    def __init__(self, obj):
        self.obj = obj

    def add(self):
        remote.addserver(self.obj.name, self.obj.address, self.obj.weight, self.obj.order, self.obj.src_addr)

    def delete(self):
        remote.delserver(self.obj.name)

    def update(self, *args, **kargs):
        pass

    def delete_batch(cls, objs):
        pass

    @classmethod
    def enable_batch(cls, objs):
        for obj in objs:
            addobj = cls(obj)
            addobj.add()

    @classmethod
    def disable_batch(cls, objs):
        for obj in objs:
            delobj = cls(obj)
            delobj.delete()

class TopDomainOps(object):
    def __init__(self, obj):
        self.obj = obj 

    def delete(self):
        pass

SERVICE = {
    'cacheconfig': CacheConfigOps,
    'policy': PolicyOps,
    'pool': PoolOps,
    'ruletraffic': RuleTrafficOps,
    'ruleview': RuleViewOps,
    'server': ServerOps,
    'topdomain': TopDomainOps,
}

BATCH = {
    'ruletraffic': RuleTrafficOps,
    'ruleview': RuleViewOps,
    'server': ServerOps,
}

