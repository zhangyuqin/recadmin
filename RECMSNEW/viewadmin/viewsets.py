from viewadmin.models import Pool,Server,CacheConfig,RuleView,TopDomain,RuleTraffic,Policy
from rest_framework import serializers,status
from rest_framework.response import Response
import threading
from viewadmin import remote
from recadmin.viewsets import gs
from rest_framework.utils.serializer_helpers import ReturnDict
from recadmin.viewsets import d_route


class PoolSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = Pool
        fields = ('id','name', 'servers', 'policy','cache','owner')


class PoolViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Pool.objects.all()
    serializer_class = PoolSerializer
    filter_fields = ('name', 'id','cache','cache__name','policy','policy__name','servers','servers__name')
    search_fields = ('name','servers__name','cache__name','policy__name')
    def rcu(self,serializer):
        r = dict(serializer.data)
        try:
            r.update({'servers': [{'id': j, 'name': Server.objects.get(pk=j).name} for j in serializer.data['servers']]})
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        try:
            r['policy'] = {'id': serializer.data['policy'],
                                         'name': Policy.objects.get(pk=serializer.data['policy']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        try:
            r['cache'] = {'id': serializer.data['cache'],
                                        'name': CacheConfig.objects.get(pk=serializer.data['cache']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))

        return ReturnDict(r, serializer=self)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['servers']= [{'id':j,'name':Server.objects.get(pk=j).name} for j in i['servers']]
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
            try:
                i['policy']= {'id':i['policy'],'name':Policy.objects.get(pk=i['policy']).name}
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
            try:
                i['cache']={'id':i['cache'],'name':CacheConfig.objects.get(pk=i['cache']).name}
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'Pool':serializer.data,
            'Servers':[{'id':i['id'],'name':i['name']} for i in Server.objects.values('id','name')],
            'Policy':[{'id':i['id'],'name':i['name']} for i in Policy.objects.values('id','name')],
            'Cache':[{'id':i['id'],'name':i['name']} for i in CacheConfig.objects.values('id','name')]
             }
        return r


    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def perform_create(self, serializer):
        ret = serializer.save(owner=self.request.user)
        servers = ','.join([s.name for s in Server.objects.filter(id__in=serializer.data['servers'])])
        t = threading.Thread(target=remote.addpool,args=(ret.name, servers, ret.policy, ret.cache))
        t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()
        r = self.rcu(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        ret = serializer.save()
        servers = ','.join([s.name for s in Server.objects.filter(id__in=serializer.data['servers'])])
        t = threading.Thread(target=remote.updatepool,args=(ret.name, servers, ret.policy, ret.cache))
        t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=remote.delpool,args=(instance.name,))
        t.start()

        t2 = threading.Thread(target=gs, args=())
        t2.start()

class ServerSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = Server
        fields = ('id','name','address','order','weight','note','status','src_addr','dtype','owner')

class ServerViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Server.objects.all()
    serializer_class = ServerSerializer
    filter_fields = ('name', 'id', 'address','src_addr')
    search_fields = ('name', 'address','note','src_addr')
    def perform_create(self, serializer):
        ret = serializer.save(owner=self.request.user)
        if ret.status:
            t = threading.Thread(target=remote.addserver, args=(ret.name, ret.address, ret.weight, ret.order, ret.src_addr))
            t.start()
            t2 = threading.Thread(target=gs, args=())
            t2.start()

    def perform_update(self, serializer):
        old_name = self.queryset.get(pk=self.kwargs['pk']).name
        old_status = self.queryset.get(pk=self.kwargs['pk']).status
        ret = serializer.save()
        if old_status:
            if ret.status:
                t = threading.Thread(target=remote.updateserver,
                                     args=(ret.name, old_name, ret.weight, ret.order, ret.src_addr))
            else:
                t = threading.Thread(target=remote.delserver,args=(ret.name,))
        else:
            if ret.status:
                t = threading.Thread(target=remote.addserver,
                                     args=(ret.name, ret.address, ret.weight, ret.order, ret.src_addr))
            else:
                return
        t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=remote.delserver,args=(instance.name,))
        t.start()

        t2 = threading.Thread(target=gs, args=())
        t2.start()


class CacheConfigSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = CacheConfig
        fields = ('id','name','entries','minTTL','maxTTL','servfail','stale','keepTTL','owner')

class CacheConfigViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = CacheConfig.objects.all()
    serializer_class = CacheConfigSerializer

    filter_fields = ('name', 'id')
    search_fields = ('name',)
    def perform_create(self, serializer):
        ret = serializer.save(owner=self.request.user)
        t = threading.Thread(
            target=remote.addcache,
            args=(ret.name, ret.entries, ret.maxTTL, ret.minTTL, ret.servfail, ret.stale, ret.keepTTL))
        t.start()

    def perform_update(self, serializer):
        old_name = self.queryset.get(pk=self.kwargs['pk']).name
        obj = serializer.save()
        t = threading.Thread(target=remote.updatecache, args=(obj.name, obj.entries), kwargs={'maxttl': obj.maxTTL,
                                                                                              'minttl': obj.minTTL,
                                                                                              'servfail': obj.servfail,
                                                                                              'stale': obj.stale,
                                                                                              'keepttl': obj.keepTTL,
                                                                                              'oldname': old_name})
        t.start()

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(
            target=remote.delcache,args=(instance.name,))
        t.start()


class RuleViewSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = RuleView
        fields = ('id','name','distaddress','acl','pool','order','note','status','owner')

class RuleViewViewSet(d_route):
    queryset = RuleView.objects.all()
    serializer_class = RuleViewSerializer
    filter_fields = ('name', 'id', 'distaddress', 'acl', 'pool','pool__name')
    search_fields = ('name','distaddress', 'acl','note','pool__name')
    def rcu(self,serializer):
        r = dict(serializer.data)
        try:
            r['pool'] = {'id': serializer.data['pool'],
                                        'name': Pool.objects.get(pk=serializer.data['pool']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['pool'] = {'id': i['pool'], 'name': Pool.objects.get(pk=i['pool']).name}
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'RuleView': serializer.data,
             'Pool': [{'id': i['id'], 'name': i['name']} for i in Pool.objects.values('id', 'name')],
             }
        return r

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def perform_create(self, serializer):
        ret = serializer.save(owner=self.request.user)
        acls = list(ret.acl)
        for i in acls:
            if ' ' == i:
                acls.remove(i)
        strip_acls = ''.join(acls)
        if ret.status:
            t = threading.Thread(target=remote.addruleview,args=(strip_acls, ret.pool))
            t.start()
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        old_status = self.queryset.get(pk=self.kwargs['pk']).status
        old_acl = self.queryset.get(pk=self.kwargs['pk']).acl
        old_pool = self.queryset.get(pk=self.kwargs['pk']).pool
        ret = serializer.save()
        acls = list(ret.acl)
        for i in acls:
            if ' ' == i:
                acls.remove(i)
        strip_acls = ''.join(acls)
        acl_del = set(old_acl.split(",")) - set(strip_acls.split(","))
        acl_new = set(strip_acls.split(",")) - set(old_acl.split(","))
        if old_status:
            if ret.status:
                #print(acl_new,acl_del,old_pool,ret.pool)
                if old_pool != ret.pool:
                    t0 = threading.Thread(target=remote.delruleview,
                                          args=(old_acl, old_pool))
                    t = threading.Thread(target=remote.addruleview,
                                         args=(strip_acls, ret.pool))
                else:
                    t = threading.Thread(target=remote.addruleview,
                                         args=(",".join(acl_new), ret.pool))
                    t0 = threading.Thread(target=remote.delruleview,
                                          args=(",".join(acl_del), ret.pool))
                t0.start()
            else:
                t = threading.Thread(target=remote.delruleview,args=(old_acl,old_pool))
        else:
            if ret.status:
                t = threading.Thread(target=remote.addruleview,args=(strip_acls,ret.pool))
            else:
                return
        t.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target= remote.delruleview, args=(instance.acl, instance.pool))
        t.start()


class TopDomainSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = TopDomain
        fields = ('id','name','domain','cdns','note','owner')

class TopDomainViewSet(d_route):

    queryset = TopDomain.objects.all()
    serializer_class = TopDomainSerializer
    filter_fields = ('name', 'id', 'domain', 'cdns','cdns__name')
    search_fields = ('domain', 'name','cdns__name','note')
    def rcu(self,serializer):
        r = dict(serializer.data)
        try:
            r['cdns'] = {'id': serializer.data['cdns'],
                                        'name':Pool.objects.get(pk=serializer.data['cdns']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['cdns'] = {'id': i['cdns'], 'name': Pool.objects.get(pk=i['cdns']).name}
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'TopDomain': serializer.data,
             'Pool': [{'id': i['id'], 'name': i['name']} for i in Pool.objects.values('id', 'name')],
             }
        return r

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        serializer.save()
        r = self.rcu(serializer)
        return Response(r)


class RuleTrafficSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = RuleTraffic
        fields = ('id','name','source','qname','acl','pool','order','note','status','owner')

class RuleTrafficViewSet(d_route):

    queryset = RuleTraffic.objects.all()
    serializer_class = RuleTrafficSerializer
    filter_fields = ('name', 'id','source', 'qname','qname__domain', 'acl', 'pool','pool__name')
    search_fields = ('name', 'source','acl','pool__name','qname__domain')
    def rcu(self,serializer):
        r = dict(serializer.data)
        try:
            r['pool'] = {'id': serializer.data['pool'],
                                        'name':Pool.objects.get(pk=serializer.data['pool']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        try:
            r['qname'] = {'id': serializer.data['qname'],
                          'domain': TopDomain.objects.get(pk=serializer.data['qname']).domain}
        except:
            print(e, '{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['pool'] = {'id': i['pool'], 'name': Pool.objects.get(pk=i['pool']).name}
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
            try:
                i['qname'] = {'id': i['qname'], 'domain': TopDomain.objects.get(pk=i['qname']).domain}
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'RuleTraffic': serializer.data,
             'Pool': [{'id': i['id'], 'name': i['name']} for i in Pool.objects.values('id', 'name')],
             'TopDomain': [{'id': i['id'], 'domain': i['domain']} for i in TopDomain.objects.values('id', 'domain')],
             }
        return r


    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def perform_create(self, serializer):
        newobj = serializer.save(owner=self.request.user)
        if newobj.status:
            t = threading.Thread(target=remote.addruletraffic,args=(newobj.acl, newobj.qname, newobj.pool))
            t.start()
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        old_status = self.queryset.get(pk=self.kwargs['pk']).status
        old_acl = self.queryset.get(pk=self.kwargs['pk']).acl
        old_pool = self.queryset.get(pk=self.kwargs['pk']).pool
        old_qname = self.queryset.get(pk=self.kwargs['pk']).qname
        ret = serializer.save()
        acls = list(ret.acl)
        for i in acls:
            if ' ' == i:
                acls.remove(i)
        strip_acls = ''.join(acls)
        if old_status:
            if ret.status:
                t0 = threading.Thread(target=remote.delruletraffic,
                                      args=(old_acl,old_qname, old_pool))
                t0.start()
                t = threading.Thread(target=remote.addruletraffic,
                                     args=(strip_acls,ret.qname, ret.pool))
            else:
                t = threading.Thread(target=remote.delruletraffic,args=(old_acl,old_qname,old_pool))
        else:
            if ret.status:
                t = threading.Thread(target=remote.addruletraffic,args=(strip_acls,ret.qname,ret.pool))
            else:
                return
        t.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=remote.delruletraffic,args=(instance.acl, instance.qname, instance.pool))
        t.start()