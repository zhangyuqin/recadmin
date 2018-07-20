from recadmin.models import ACL, FowarDomain, SecurityDomain, LocalZone, LocalData, DomainGroup, SecDomainACL,\
Test,ServerProfile
from viewadmin.models import Pool,Server
from rest_framework import viewsets
from rest_framework import serializers,status
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework import renderers
from recadmin.views import reload_unbound
import threading
from recadmin import remote
from recadmin.views import gen_conf
from rest_framework.utils.serializer_helpers import ReturnDict
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework import permissions
from recms.permissions import IsOwnerOrReadOnly

def gs():
    gen_conf()
    remote.sync()

class d_route(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly)
    filter_backends = (DjangoFilterBackend,SearchFilter)
    @detail_route(renderer_classes=[renderers.StaticHTMLRenderer])
    def highlight(self, request, *args, **kwargs):
        snippet = self.get_object()
        return Response(snippet.highlighted)

    def deal_ser_data(self,serializer,request):
        return serializer.data

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        ret = self.deal_ser_data(serializer,request)
        return Response(ret)

class FowarDomainSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = FowarDomain
        fields = ('id', 'domain', 'server', 'only', 'status', 'pool','owner')


class FowarDomainViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = FowarDomain.objects.all()
    serializer_class = FowarDomainSerializer
    filter_fields = ('domain', 'id','server','pool','pool__name')
    search_fields = ('domain', 'server','pool__name')
    def rcu(self,serializer):
        r = dict(serializer.data)
        try:
            r['pool'] = {'id': serializer.data['pool'],
                                        'name': Pool.objects.get(pk=serializer.data['pool']).name}
        except Exception as e:
            print(e,'{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def deal_ser_data(self, serializer,request):
        for i in serializer.data:
            try:
                i['pool'] = {'id': i['pool'], 'name': Pool.objects.get(pk=i['pool']).name}
            except:
                pass
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'FowarDomain': serializer.data,
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
        if ret.status:
            t = threading.Thread(target=reload_unbound, args=('add', ret))
            t.start()
            t2 = threading.Thread(target=gs,args=())
            t2.start()
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        ret = serializer.save()
        if ret.status:
            t = threading.Thread(target=reload_unbound, args=('add', ret))
            t.start()
        else:
            t = threading.Thread(target=reload_unbound, args=('del', ret))
            t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=reload_unbound, args=('del', instance))
        t.start()

        t2 = threading.Thread(target=gs, args=())
        t2.start()


class ACLSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = ACL
        fields = ('id', 'name', 'acl', 'status','owner')


class ACLViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = ACL.objects.all()
    serializer_class = ACLSerializer
    filter_fields = ('name', 'id', 'acl')
    search_fields = ('name', 'acl')
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        if serializer.data['status']:
            t = threading.Thread(target=remote.addacl, args=(serializer.data['acl'],))
            t.start()

    def perform_update(self, serializer):
        serializer.save()
        if serializer.data['status']:
            t = threading.Thread(target=remote.addacl, args=(serializer.data['acl'],))
            t.start()
        else:
            t = threading.Thread(target=remote.delacl, args=(serializer.data['acl'],))
            t.start()

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=remote.delacl, args=(instance.acl))
        t.start()

class SecurityDomainSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = SecurityDomain
        fields = ('id', 'dgroup', 'domain', 'status', 'note', 'pool','ns','owner')


class SecurityDomainViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = SecurityDomain.objects.all()
    serializer_class = SecurityDomainSerializer
    filter_fields = ('domain', 'id', 'dgroup','dgroup__name', 'pool','ns','pool__name')
    search_fields = ('domain', 'ns','note','pool__name','dgroup__name')
    def rcu(self,serializer):
        r = dict(serializer.data)
        try:
            r['pool'] = {'id': serializer.data['pool'],
                                        'name': Pool.objects.get(pk=serializer.data['pool']).name}
        except Exception as e:
            print(e,'{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['pool'] = {'id': i['pool'], 'name': Pool.objects.get(pk=i['pool']).name}
            except:
                pass
            try:
                i['dgroup'] = {'id': i['dgroup'], 'name': DomainGroup.objects.get(pk=i['dgroup']).name}
            except:
                pass
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'SecurityDomain': serializer.data,
             'Pool': [{'id': i['id'], 'name': i['name']} for i in Pool.objects.values('id', 'name')],
             'DomainGroup': [{'id': i['id'], 'name': i['name']} for i in DomainGroup.objects.values('id', 'name')],
             }
        return r


    def perform_create(self, serializer):
        ret = serializer.save(owner=self.request.user)
        if ret.status:
            t = threading.Thread(target=reload_unbound, args=('add', ret))
            t.start()
            t2 = threading.Thread(target=gs, args=())
            t2.start()
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        ret = serializer.save()
        if ret.status:
            t = threading.Thread(target=reload_unbound, args=('add', ret))
            t.start()
        else:
            t = threading.Thread(target=reload_unbound, args=('del', ret))
            t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=reload_unbound, args=('del', instance))
        t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()

class LocalZoneSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = LocalZone
        fields = ('id', 'zone', 'rtype', 'status', 'pool','owner')


class LocalZoneViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = LocalZone.objects.all()
    serializer_class = LocalZoneSerializer
    filter_fields = ('zone', 'id','pool','rtype','pool__name')
    search_fields = ('zone', 'rtype','pool__name')
    def rcu(self, serializer):
        r = dict(serializer.data)
        try:
            r['pool'] = {'id': serializer.data['pool'],
                         'name': Pool.objects.get(pk=serializer.data['pool']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['pool'] = {'id': i['pool'], 'name': Pool.objects.get(pk=i['pool']).name}
            except:
                pass
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'LocalZone': serializer.data,
             'Pool': [{'id': i['id'], 'name': i['name']} for i in Pool.objects.values('id', 'name')],
             }
        return r


    def perform_create(self, serializer):
        ret = serializer.save(owner=self.request.user)
        serializer.data.update({'pool_content':Pool.objects.get(pk=serializer.data['pool']).name})
        if ret.status:
            t = threading.Thread(target=reload_unbound, args=('add', ret))
            t.start()
            t2 = threading.Thread(target=gs, args=())
            t2.start()
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        ret = serializer.save()
        serializer.data.update({'pool_content':Pool.objects.get(pk=serializer.data['pool']).name})
        if ret.status:
            t = threading.Thread(target=reload_unbound, args=('add', ret))
            t.start()
        else:
            t = threading.Thread(target=reload_unbound, args=('del', ret))
            t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=reload_unbound, args=('del', instance))
        t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()

class LocalDataSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = LocalData
        fields = ('id', 'domain', 'rr', 'address', 'pool','owner')


class LocalDataViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = LocalData.objects.all()
    serializer_class = LocalDataSerializer
    filter_fields = ('domain', 'id', 'rr', 'pool', 'address','pool__name')
    search_fields = ('rr', 'domain','address','pool__name')
    def rcu(self, serializer):
        r = dict(serializer.data)
        try:
            r['pool'] = {'id': serializer.data['pool'],
                         'name': Pool.objects.get(pk=serializer.data['pool']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['pool'] = {'id': i['pool'], 'name': Pool.objects.get(pk=i['pool']).name}
            except:
                pass
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'LocalData': serializer.data,
             'Pool': [{'id': i['id'], 'name': i['name']} for i in Pool.objects.values('id', 'name')],
             }
        return r

    def perform_create(self, serializer):
        ret = serializer.save(owner=self.request.user)
        t = threading.Thread(target=reload_unbound, args=('add', ret))
        t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        ret = serializer.save()
        t0 = threading.Thread(target=reload_unbound, args=('del', ret))
        t0.start()
        t = threading.Thread(target=reload_unbound, args=('add', ret))
        t.start()
        t2 = threading.Thread(target=gs, args=())
        t2.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        instance.delete()
        t = threading.Thread(target=reload_unbound, args=('del', instance))
        t.start()
        
        t2 = threading.Thread(target=gs, args=())
        t2.start()

class DomainGroupSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = DomainGroup
        fields = ('id', 'name', 'tag','owner')


class DomainGroupViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = DomainGroup.objects.all()
    serializer_class = DomainGroupSerializer
    filter_fields = ('name', 'id')
    search_fields = ('name', 'tag')

class SecDomainACLSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = SecDomainACL
        fields = ('id', 'acl', 'domaingroups', 'status', 'note','owner')


class SecDomainACLViewSet(d_route):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = SecDomainACL.objects.all()
    serializer_class = SecDomainACLSerializer
    filter_fields = ('acl', 'id', 'domaingroups__name','domaingroups')
    search_fields = ('acl','note','domaingroups__name')
    def rcu(self, serializer):
        r = dict(serializer.data)
        try:
            r['domaingroups'] = [{'id':j,'name':DomainGroup.objects.get(pk=j).name} for j in r['domaingroups']]
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        r = self.rcu(serializer)
        return Response(r)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['domaingroups']= [{'id':j,'name':DomainGroup.objects.get(pk=j).name} for j in i['domaingroups']]
            except:
                pass
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'SecDomainACL':serializer.data,
            'DomainGroup':[{'id':i['id'],'name':i['name']} for i in DomainGroup.objects.values('id','name')],
             }
        return r


    def perform_create(self, serializer):
        newobj = serializer.save(owner=self.request.user)
        if newobj.status:
            sdomainobjs = SecurityDomain.objects.filter(dgroup__id__in=serializer.data['domaingroups'])
            sdomains = [obj.domain for obj in sdomainobjs]
            t = threading.Thread(target=remote.add_domain_acl, args=(newobj.acl, sdomains))
            t.start()
        headers = self.get_success_headers(serializer.data)
        r = self.rcu(serializer)
        return Response(r, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        s = self.queryset.filter(pk=self.kwargs['pk']).values_list('domaingroups')
        old_objs = SecurityDomain.objects.filter(dgroup__id__in=[i[0] for i in s])
        old_domains = [obj.domain for obj in old_objs]
        old_status = self.queryset.get(pk=self.kwargs['pk']).status
        old_acl = self.queryset.get(pk=self.kwargs['pk']).acl
        ret = serializer.save()
        sdomainobjs = SecurityDomain.objects.filter(dgroup__id__in=serializer.data['domaingroups'])
        sdomains = [obj.domain for obj in sdomainobjs]
        if old_status:
            if ret.status:
                t0 = threading.Thread(target=remote.dgroup_del_domain,
                                      args=([old_acl],old_domains))
                t0.start()
                t = threading.Thread(target=remote.dgroup_add_domain,
                                     args=([ret.acl], sdomains))
            else:
                t = threading.Thread(target=remote.dgroup_del_domain,args=([old_acl],old_domains))
        else:
            if ret.status:
                t = threading.Thread(target=remote.dgroup_add_domain,args=([ret.acl],sdomains))
            else:
                return
        t.start()
        r = self.rcu(serializer)
        return Response(r)

    def perform_destroy(self, instance):
        s = self.queryset.filter(pk=self.kwargs['pk']).values_list('domaingroups')
        sdomainobjs = SecurityDomain.objects.filter(dgroup__id__in=[i[0] for i in s])
        sdomains = [obj.domain for obj in sdomainobjs]
        instance.delete()
        t = threading.Thread(target=remote.del_domain_acl, args=(instance.acl, sdomains))
        t.start()


class ServerProfileSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = ServerProfile
        fields = ('id','server','port','path','conf','dtype','controlkey','statskey','owner')

class ServerProfileViewSet(d_route):
    
    #删改方法总会调用generics.GenericAPIView(views.APIView)下的get_object方法，该方法会调用restframewok下
    #的views.APIView(View)的check_object_permissions方法，如果权限不足抛出异常,同时配置
    #permission_classes = api_settings.DEFAULT_PERMISSION_CLASSES的全局属性，单一视图需要可重写该属性

    queryset = ServerProfile.objects.all()
    serializer_class = ServerProfileSerializer
    filter_fields = ('path', 'id','dtype',)
    search_fields = ('conf','path',)

    def rcu(self, serializer):
        r = dict(serializer.data)
        try:
            r['server'] = {'id': serializer.data['server'],
                         'name': Server.objects.get(pk=serializer.data['server']).name}
        except Exception as e:
            print(e, '{0} error'.format(self.__class__.__name__))
        return ReturnDict(r, serializer=self)

    def deal_ser_data(self, serializer, request):
        for i in serializer.data:
            try:
                i['server'] = {'id': i['server'], 'name': Server.objects.get(pk=i['server']).name}
            except Exception as e:
                print(e, '{0} error'.format(self.__class__.__name__))
        keyword = request.GET.get('original')  # 获取参数
        if keyword is not None:  # 如果参数不为空
            return serializer.data
        r = {'Master': serializer.data,
             'Server': [{'id': i['id'], 'name': i['name']} for i in Server.objects.values('id', 'name')],
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


class TestSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Test
        fields = ('id', 'server', 'port', 'path', 'conf', 'dtype', 'controlkey', 'statskey', 'owner')


class TestViewSet(d_route):
    # 删改方法总会调用generics.GenericAPIView(views.APIView)下的get_object方法，该方法会调用restframewok下
    # 的views.APIView(View)的check_object_permissions方法，如果权限不足抛出异常,同时配置
    # permission_classes = api_settings.DEFAULT_PERMISSION_CLASSES的全局属性，单一视图需要可重写该属性
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    filter_fields = ('path', 'id', 'dtype',)
    search_fields = ('conf', 'path',)