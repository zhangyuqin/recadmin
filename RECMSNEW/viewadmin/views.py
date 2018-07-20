import json
from django.shortcuts import HttpResponse, render, redirect, Http404, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from recms.settings import  ITEMS_PER_PAGE

from .models import (CacheConfig, Policy, Pool,
                    RuleTraffic, RuleView, Server, TopDomain)
from . import remote
from . import service


RECIPIENT = {
    'cacheconfig': CacheConfig,
    'policy': Policy,
    'pool': Pool,
    'ruletraffic': RuleTraffic,
    'ruleview': RuleView,
    'server': Server,
    'topdomain': TopDomain,
}

@login_required(login_url="/login")
def index(request):
    return render(request, "viewadmin/index.html")

@login_required(login_url="/login")
def update(request, recipient, id):
    if request.method == 'POST':
        if recipient not in RECIPIENT.keys():
            raise Http404

        obj = get_object_or_404(RECIPIENT[recipient], pk=id)
        if recipient in ('linktype', 'policy'):
            querydict = request.POST.dict()
            service.SERVICE['recipient'](obj).update(querydict['name'])

        elif recipient == 'pool':
            querydict = request.POST.dict()
            update_flag = {'name': 0, 'servers': 0, 'policy': 0, 'cache': 0}

            if obj.name != querydict['name']:
                obj.name = querydict['name']
                update_flag['name'] = 1

            # 处理server 变更
            server_ids_before = set([server.id for server in obj.servers.all()])
            server_ids_after = set([int(i) for i in request.POST.get('servers').split(',')])
            if server_ids_before != server_ids_after:
                servers_del = Server.objects.filter(id__in=(server_ids_before-server_ids_after))
                for s in servers_del:
                    service.SERVICE['server'](s).delete()

                obj.servers.clear()
                obj.servers.add(*server_ids_after)

                servers_new = Server.objects.filter(id__in=(server_ids_after-server_ids_before))
                for s in servers_new:
                    service.SERVICE['server'](s).add()

            if obj.policy_id != request.POST.get('policy', None):
                obj.policy_id = request.POST.get('policy', None)
                update_flag['policy'] = 1

            # Pool 和 CacheConfig 一对一，在 show Pool 的时候应该把
            # 未占用的 CacheConfig 传给前端。用浏览器正常情况下访问，
            # 不会提交不可用的 CacheConfig id，但用非正常方法（如 curl
            # 、postman）post 一个 已占用的 CacheConfig id，此时应该
            # 验证从而避免 IntegrityError 异常
            posted_cache_id = request.POST.get('cache', None)
            if posted_cache_id != None:
                cc = CacheConfig.objects.get(pk=posted_cache_id)
                if hasattr(cc, 'pool'):
                    # 使用了非正常方法提交数据，并且提交了已占用的 cache
                    return JsonResponse({'msg':'请使用浏览器正常访问本系统！'})
            if obj.cache_id != posted_cache_id:
                obj.cache_id = posted_cache_id
                update_flag['cache'] = 1

            if update_flag != {'name': 0, 'servers': 0, 'policy': 0, 'cache': 0}:
                # 有字段内容发生了变化
                obj.save()
                remote.updatepool(obj.name, 'server', obj.policy.name, obj.cache.name)


        elif recipient == 'server':
            querydict = request.POST.dict()
            update_flag = {'name': 0, 'isp': 0, 'status': 0, 'order': 0, 'weight': 0, 'note': 0}

            if obj.name != querydict['name']:
                name = obj.name
                obj.name = int(querydict['name'])
                update_flag['name'] = 1

            if obj.status != int(querydict['status']):
                obj.status = int(querydict['status'])
                update_flag['status'] = 1

            if obj.order != int(querydict['order']):
                obj.order = int(querydict['order'])
                update_flag['order'] = 1

            if obj.weight != int(querydict['weight']):
                obj.weight = int(querydict['weight'])
                update_flag['weight'] = 1

            if obj.note != querydict['note']:
                obj.note = querydict['note']
                update_flag['note'] = 1

            isp_ids_before = set([lt.id for lt in obj.isp.all()])
            isp_idss_after = request.POST.get('isp').split(',')
            isp_ids_after = set([int(i) for i in isp_idss_after if i != ''])
            if isp_ids_before != isp_ids_after:
                obj.isp.clear()
                obj.isp.add(*isp_ids_after)
                update_flag['isp'] = 1

            if update_flag != {'name': 0, 'isp': 0, 'status': 0, 'order': 0, 'weight': 0, 'note': 0}:
                if update_flag['status'] == 1: # status 发生了变化
                    if querydict['status'] == 1: # 未启用到启用（启用该server）
                        # 处理逻辑
                        remote.addserver(obj.name, obj.address, obj.weight, obj.order, obj.src_addr)
                    else: # 启用到未启用（禁用该server）
                        remote.delserver(obj.name)
                else: # status 没有发生变化
                    if obj.status == 1: # status 一直处于启用状态
                        # 发生变化的可是 name，note，isp，order，weight
                         remote.updateserver(obj.name,querydict['name'], obj.weight, obj.order, obj.src_addr)
                obj.save() # 有字段内容发生了变化
                messages.success(request, "配置生成完毕！")


        elif recipient == 'cacheconfig':
            querydict = request.POST.dict()
            update_flag = {'name': 0, 'entries': 0, 'minTTL': 0, 'maxTTL': 0, 'servfail': 0, 'stale': 0, 'keepTTL': 0}

            if obj.name != querydict['name']:
                oldname = obj.name
                obj.name = querydict['name']
                update_flag['name'] = 1

            if obj.entries != int(querydict['entries']):
                obj.entries = int(querydict['entries'])
                update_flag['entries'] = 1

            if obj.minTTL != int(querydict['minTTL']):
                obj.minTTL = int(querydict['minTTL'])
                update_flag['minTTL'] = 1

            if obj.maxTTL != int(querydict['maxTTL']):
                obj.maxTTL = int(querydict['maxTTL'])
                update_flag['maxTTL'] = 1

            if obj.servfail != int(querydict['servfail']):
                obj.servfail = int(querydict['servfail'])
                update_flag['servfail'] = 1

            if obj.stale != int(querydict['stale']):
                obj.stale = int(querydict['stale'])
                update_flag['stale'] = 1

            if obj.keepTTL != int(querydict['keepTTL']):
                obj.keepTTL = int(querydict['keepTTL'])
                update_flag['keepTTL'] = 1

            if update_flag != {'name': 0, 'entries': 0, 'minTTL': 0, 'maxTTL': 0, 'servfail': 0, 'stale': 0, 'keepTTL': 0}:
                if update_flag['name'] == 1:
                    remote.updatecache(obj.name, obj.entries, maxttl=obj.maxTTL, minttl=obj.minTTL,
                                   servfail = obj.servfail,stale = obj.stale,keepttl= obj.keepTTL,oldname = oldname)
                else:
                    remote.updatecache(obj.name, obj.entries, maxttl=obj.maxTTL, minttl=obj.minTTL,
                                       servfail=obj.servfail, stale=obj.stale, keepttl=obj.keepTTL)
                obj.save()


        elif recipient == 'ruleview':
            querydict = request.POST.dict()
            update_db_flag = {'name': 0, 'distaddress': 0, 'note': 0}
            update_dist_flag = {'acl': 0, 'pool': 0, 'order': 0, 'status': 0}
            acl_new = False
            acl_del = False

            if obj.name != querydict['name']:
                obj.name = querydict['name']
                update_db_flag['name'] = 1

            if obj.distaddress != querydict['distaddress']:
                obj.distaddress = querydict['distaddress']
                update_db_flag['distaddress'] = 1

            if obj.acl != querydict['acl']:
                acl_new = set(querydict['acl'].split(",")) - set(obj.acl.split(","))
                acl_del = set(obj.acl.split(",")) - set(querydict['acl'].split(","))
                obj.acl = querydict['acl']
                update_dist_flag['acl'] = 1

            if obj.order != querydict['order']:
                obj.order = querydict['order']
                update_dist_flag['order'] = 1

            if obj.note != querydict['note']:
                obj.note = querydict['note']
                update_db_flag['note'] = 1

            if obj.status != int(querydict['status']):
                obj.status = int(querydict['status'])
                update_dist_flag['status'] = 1

            if obj.pool_id != int(querydict['pool']):
                old_pool = obj.pool.name
                obj.pool_id = int(querydict['pool'])
                update_dist_flag['pool'] = 1

            if update_db_flag != {'name': 0, 'distaddress': 0, 'note': 0}:
                # 有字段内容发生了变化
                obj.save()
            if update_dist_flag != {'acl': 0, 'pool': 0, 'order': 0, 'status': 0}: 
               if update_dist_flag['status'] == 1:
                   # status 发生了变化
                   if int(querydict['status']):
                       # 未启用到启用（启用该ruleview）
                       if acl_new:
                           remote.addruleview(",".join(acl_new), obj.pool.name)

                       if acl_del:
                           remote.delruleview(",".join(acl_del), obj.pool.name)

                       remote.addruleview(obj.acl, obj.pool.name)

                       if update_dist_flag['pool']:
                           # pool 发生变化
                           if acl_del:
                               remote.delruleview(",".join(acl_del), old_pool)
                           remote.delruleview(obj.acl, old_pool)
                   else: # 启用到未启用（禁用该ruleview）
                       if acl_del:
                           remote.delruleview(",".join(acl_del), obj.pool.name)
                       remote.delruleview(obj.acl, obj.pool.name)
               else: 
                   # status 没有发生变化, 属性发生了变化
                   if int(querydict['status']) == 1:
                       if acl_new:
                           remote.addruleview(",".join(acl_new), obj.pool.name)

                       if acl_del:
                           remote.delruleview(",".join(acl_del), obj.pool.name)
               obj.save()

        elif recipient == 'ruletraffic':
            querydict = request.POST.dict()
            update_db_flag = {'name': 0, 'source': 0, 'note': 0}
            update_dist_flag = {'qname': 0, 'acl': 0, 'pool': 0, 'order': 0, 'status': 0}
            acl_new = False
            acl_del = False
            old_qname = obj.qname.domain
            old_acl = obj.acl
            old_pool = obj.pool.name

            if obj.name != querydict['name']:
                obj.name = querydict['name']
                update_db_flag['name'] = 1

            if obj.source != querydict['source']:
                obj.source = querydict['source']
                update_db_flag['source'] = 1

            if obj.qname_id != int(querydict['qname']):
                obj.qname_id = int(querydict['qname'])
                update_dist_flag['qname'] = 1

            if obj.acl != querydict['acl']:
                acl_new = set(querydict['acl'].split(",")) - set(obj.acl.split(","))
                acl_del = set(obj.acl.split(",")) - set(querydict['acl'].split(","))
                obj.acl = querydict['acl']
                update_dist_flag['acl'] = 1

            if obj.order != querydict['order']:
                obj.order = querydict['order']
                update_dist_flag['order'] = 1

            if obj.note != querydict['note']:
                obj.note = querydict['note']
                update_db_flag['note'] = 1

            if obj.status != int(querydict['status']):
                obj.status = int(querydict['status'])
                update_dist_flag['status'] = 1

            if obj.pool_id != int(querydict['poolrt']):
                obj.pool_id = int(querydict['poolrt'])
                update_dist_flag['pool'] = 1

            if update_db_flag != {'name': 0, 'source': 0, 'note': 0}:
                # 有字段内容发生了变化
                obj.save()
           
            if update_dist_flag != {'qname': 0, 'acl': 0, 'pools': 0, 'order': 0, 'status': 0}:
                qname = obj.qname.domain
                if update_dist_flag['status'] == 1:
                    # status 发生了变化
                    if int(querydict['status']) == 1:
                        # 未启用到启用（启用该ruletraffic）
                        if acl_new:
                            remote.addruletraffic(",".join(acl_new), qname, obj.pool.name)
                        if acl_del:
                            remote.delruletraffic(",".join(acl_del), old_qname, old_pool)

                        remote.addruletraffic(obj.acl, qname, obj.pool.name)

                        if update_dist_flag['qname'] or update_dist_flag['pool']:
                            # qname 或者pool 发生变化, 删除之前的规则
                            remote.delruletraffic(old_acl, old_qname, old_pool)
                    else:
                        # 启用到未启用（禁用该ruletraffic）
                        # 暂不考虑qname变化，pool变化
                        if acl_del:
                            remote.delruletraffic(",".join(acl_del), qname, obj.pool.name)
                        remote.delruletraffic(obj.acl, qname, obj.pool.name)
                else:
                    # status 没有发生变化
                    if obj.status == 1:
                       # status 一直处于启用状态
                       if acl_new:
                           remote.addruletraffic(",".join(acl_new), qname, obj.pool.name)
                       if acl_del:
                           remote.delruletraffic(",".join(acl_del), qname, obj.pool.name)

                       if update_dist_flag['qname'] or update_dist_flag['pool']:
                           # qname 或者pool 发生变化, 删除之前的规则
                           remote.delruletraffic(old_acl, old_qname, old_pool)
                obj.save()
           
        elif recipient == 'topdomain':
            querydict = request.POST.dict()
            update_flag = {'name': 0, 'domain': 0, 'cdns': 0, 'note': 0}

            if obj.name != querydict['name']:
                obj.name = querydict['name']
                update_flag['name'] = 1

            if obj.domain != querydict['domain']:
                obj.domain = querydict['domain']
                update_flag['domain'] = 1

            if obj.note != querydict['note']:
                obj.note = querydict['note']
                update_flag['note'] = 1

            # lt LinkType
            lt_ids_before = set([lt.id for lt in obj.cdns.all()])
            lt_ids_after = set([int(i) for i in request.POST.get('cdns').split(',')])
            if lt_ids_before != lt_ids_after:
                obj.cdns.clear()
                obj.cdns.add(*lt_ids_after)
                update_flag['cdns'] = 1

            if update_flag != {'name': 0, 'domain': 0, 'cdns': 0, 'note': 0}:
                # 有字段内容发生了变化，此对象只需入库
                obj.save()

        return redirect('/viewadmin/'+recipient)
    else:
        return JsonResponse({'msg':'不支持的方法'})

@login_required(login_url="/login")
def delete_multi(request, recipient):
    to_del = request.POST['data'].split(',')
    delobjs = RECIPIENT[recipient].objects.filter(id__in=to_del)
    for obj in delobjs:
        service.SERVICE[recipient](obj).delete()
        obj.delete()
    return redirect('/viewadmin/'+recipient)

@login_required(login_url="/login")
def operate_multi(request, recipient):
    if recipient  not in service.BATCH:
        messages.info(request, "不支持此操作")
        return redirect('/viewadmin/'+recipient)

    to_op = [int(i) for i in request.POST['data'].split(',')]
    if request.GET.get('status') == '1':
        opcode = 1
        opobjs = RECIPIENT[recipient].objects.filter(id__in=to_op, status=0)
        for obj in opobjs:
            obj.status = 1
            service.SERVICE[recipient](obj).add()
            obj.save()
        updated_counts = len(opobjs)
    else:
        opcode = 0
        opobjs = RECIPIENT[recipient].objects.filter(id__in=to_op, status=1)
        for obj in opobjs:
            obj.status = 0
            service.SERVICE[recipient](obj).delete()
            obj.save()
    return HttpResponse(1)

@login_required(login_url="/login")
def show(request, href):
    if href == 'cacheconfig':
        query_str = request.GET.get('q')
        if query_str:
            contents = CacheConfig.objects.filter(name__icontains=query_str)
        else:    
            contents = CacheConfig.objects.all()
            # print(contents.only)
        paginator = Paginator(contents, ITEMS_PER_PAGE) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)   
        return  render(request, 'viewadmin/cacheconfig.html',{'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})
    elif href == 'policy':
        query_str = request.GET.get('q')
        if query_str:
            contents = Policy.objects.filter(name__icontains=query_str)
        else:    
            contents = Policy.objects.all()
            # print(contents.only) 
        paginator = Paginator(contents, ITEMS_PER_PAGE) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)   
        return  render(request, 'viewadmin/policy.html',{'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'pool':
        query_str = request.GET.get('q')
        if query_str:
            contents = Pool.objects.filter(name__icontains=query_str)
        else:    
            contents = Pool.objects.all()
            # print(contents.only)

        servers = Server.objects.all()
        servers_list = [{'id':server.id,'name':server.name} for server in servers]
        policys = Policy.objects.all()
        # policies = ['leastOutstanding','firstAvailable','wrandom','whashed','roundrobin']
        policies = ['leastOutstanding', 'roundrobin']
        policys_list = [{'id':policy.id,'name':policy.name} for policy in policys]
        if len(policys) == 0: #负载均衡策略初始化
            for i in policies:
                p = Policy(name=i)
                p.save()
                policys_list.append({'id': p.id, 'name': i})
        cc = CacheConfig.objects.all()
        caches = []
        for c in cc:
            if not hasattr(c, 'pool'):
                caches.append(c)
        caches_list = [{'id':cache.id,'name':cache.name} for cache in caches]
        paginator = Paginator(contents, ITEMS_PER_PAGE) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)   
        return  render(request, 'viewadmin/pool.html',{'caches_list':json.dumps(caches_list),'policys_list':json.dumps(policys_list),'servers_list':json.dumps(servers_list),'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'ruletraffic':
        query_str = request.GET.get('q')
        if query_str:
            contents = RuleTraffic.objects.filter(name__icontains=query_str)
        else:    
            contents = RuleTraffic.objects.all()
            # print(contents.only)

        pools = Pool.objects.all()
        pools_list = [{'id':pool.id,'name':pool.name} for pool in pools]
        qnames = TopDomain.objects.all()
        qnames_list = [{'id':qname.id,'name':qname.domain} for qname in qnames]

        paginator = Paginator(contents, ITEMS_PER_PAGE) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)   
        return  render(request, 'viewadmin/ruletraffic.html',{'qnames_list':json.dumps(qnames_list),'pools_list':json.dumps(pools_list),'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'ruleview':
        query_str = request.GET.get('q')
        if query_str:
            contents = RuleView.objects.filter(name__icontains=query_str)
        else:    
            contents = RuleView.objects.all()
            # print(contents.only)

        pools = Pool.objects.all()
        pools_list = [{'id':pool.id,'name':pool.name} for pool in pools]

        paginator = Paginator(contents, ITEMS_PER_PAGE) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)   
        return  render(request, 'viewadmin/ruleview.html',{'pools_list':json.dumps(pools_list),'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'server':
        query_str = request.GET.get('q')
        if query_str:
            contents = Server.objects.filter(name__icontains=query_str)
        else:    
            contents = Server.objects.all()
            # print(contents.only)
        isps = Pool.objects.all()
        isps_list = [{'id': isp.id, 'name': isp.name} for isp in isps]
        paginator = Paginator(contents, ITEMS_PER_PAGE) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)   
        return  render(request, 'viewadmin/server.html',{'isps_list':json.dumps(isps_list),'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'topdomain':
        query_str = request.GET.get('q')
        if query_str:
            contents = TopDomain.objects.filter(name__icontains=query_str)
        else:    
            contents = TopDomain.objects.all()
            # print(contents.only)

        lts = Pool.objects.all()
        lts_list = [{'id':lt.id,'name':lt.name} for lt in lts]

        paginator = Paginator(contents, ITEMS_PER_PAGE) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)   
        return  render(request, 'viewadmin/topdomain.html',{'cdns_list':json.dumps(lts_list),'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})
    else:
        raise Http404

@login_required(login_url="/login")
def delete(request, recipient, id):
    if recipient in RECIPIENT:
        delobj = get_object_or_404(RECIPIENT[recipient], pk=id)
        service.SERVICE[recipient](delobj).delete()
        delobj.delete()
        messages.success(request, "删除成功！")
    else:
        raise Http404

    return  redirect('/viewadmin/'+recipient)

@login_required(login_url="/login")
def add(request, recipient):

    if recipient == 'cacheconfig':
        # 入库
        newobj = CacheConfig()
        querydict = request.POST.dict()
        newobj.name = querydict['name']
        if CacheConfig.objects.filter(name=querydict['name']):
            messages.error(request, "cache exist!!!")
            return  redirect('/viewadmin/'+recipient)
        newobj.entries = int(querydict['entries'])
        newobj.minTTL = int(querydict['minTTL'])
        newobj.maxTTL = int(querydict['maxTTL'])
        newobj.servfail = int(querydict['servfail'])
        newobj.stale = int(querydict['stale'])
        newobj.keepTTL = int(querydict['keepTTL'])

        remote.addcache(newobj.name, newobj.entries, newobj.maxTTL, newobj.minTTL, newobj.servfail, newobj.stale, newobj.keepTTL)
        newobj.save()
        messages.success(request, "添加成功！")
    elif recipient in ('linktype', 'policy'):
        # 入库
        newobj = RECIPIENT[recipient]()
        querydict = request.POST.dict()
        newobj.name = querydict['name']
        if  RECIPIENT[recipient].objects.filter(name=querydict['name']):
            messages.error(request, "linktype exist!!!")
            return  redirect('/viewadmin/'+recipient)
        newobj.save()
    elif recipient == 'pool':
        # 入库
        newobj = Pool()
        querydict = request.POST.dict()
        serveridss = request.POST.get('servers').split(',')
        serverids = [int(i) for i in serveridss]
        policyid = int(request.POST.get('policy'))
        policy = Policy.objects.get(pk=policyid)
        newobj.name = querydict['name']
        if Pool.objects.filter(name=querydict['name']):
            messages.error(request, "pool exist!!!")
            return  redirect('/viewadmin/'+recipient)
        newobj.policy = policy
        ccid = int(request.POST.get('cache'))
        cacheconfig = CacheConfig.objects.get(pk=ccid)
        newobj.cache = cacheconfig

        # 处理逻辑
       
        servers = ','.join([s.name for s in Server.objects.filter(id__in=serverids)])
        remote.addpool(newobj.name, servers, policy.name, cacheconfig.name)
        newobj.save()
        newobj.servers.add(*serverids)
    elif recipient == 'ruletraffic':
        # 入库
        newobj = RuleTraffic()
        querydict = request.POST.dict()
        newobj.name = querydict['name']
        if RuleTraffic.objects.filter(name=querydict['name']):
            messages.error(request, "ruletraffic exist!!!")
            return  redirect('/viewadmin/'+recipient)
        newobj.source = querydict['source']
        newobj.qname_id = int(querydict['qname'])
        newobj.pool_id = int(querydict['poolrt'])
        newobj.acl = querydict['acl']
        newobj.order = querydict['order']
        newobj.note = querydict['note']
        newobj.status = int(querydict['status'])
        # 处理逻辑

        acls = list(newobj.acl)
        for i in acls:
            if ' ' == i:
                acls.remove(i)
        strip_acls = ''.join(acls) 
        if newobj.status:
            remote.addruletraffic(newobj.acl, newobj.qname.domain, newobj.pool.name)
            newobj.save()
    elif recipient == 'ruleview':
        # 入库
        newobj = RuleView()
        querydict = request.POST.dict()
        newobj.name = querydict['name']
        if RuleView.objects.filter(name=querydict['name']):
            messages.error(request, "ruleview exist!!!")
            return  redirect('/viewadmin/'+recipient)
        newobj.distaddress = querydict['distaddress']
        newobj.acl = querydict['acl']
        poolid = int(request.POST.get('pool'))
        pool = Pool.objects.get(pk=poolid)
        newobj.pool = pool
        newobj.order = int(querydict['order'])
        newobj.status = int(querydict['status'])
        newobj.note = querydict['note']

        # 处理逻辑
        
        acls = list(newobj.acl)
        for i in acls:
            if ' ' == i:
                acls.remove(i)
        strip_acls = ''.join(acls) 
        if newobj.status:
            remote.addruleview(strip_acls, pool.name)
            newobj.save()
    elif recipient == 'server':
        # 入库
        newobj = Server()
        linktypeidss = request.POST.get('isp').split(',')
        linktypeids = [int(i) for i in linktypeidss if i != '']
        querydict = request.POST.dict()
        newobj.name = querydict['name']
        if Server.objects.filter(name=querydict['name']):
            messages.error(request, "server exist!!!")
            return  redirect('/viewadmin/'+recipient)
        newobj.address = querydict['address']
        newobj.order = int(querydict['order'])
        newobj.weight = int(querydict['weight'])
        newobj.note = querydict['note']
        newobj.status = int(querydict['status'])
        newobj.src_addr = querydict['src_addr']

        # 处理逻辑
        if newobj.status:
            remote.addserver(newobj.name, newobj.address, newobj.weight, newobj.order, newobj.src_addr)
            newobj.save()
            newobj.isp.add(*linktypeids)
    elif recipient == 'topdomain':
        # 入库
        newobj = TopDomain()
        linktypeidss = request.POST.get('cdns').split(',')
        linktypeids = [int(i) for i in linktypeidss]
        querydict = request.POST.dict()
        newobj.name = querydict['name']
        newobj.domain = querydict['domain']
        newobj.note = querydict['note']
        newobj.save()
        newobj.cdns.add(*linktypeids)
    else:
        raise Http404

    return  redirect('/viewadmin/'+recipient)


# 实例表单
# def add(request, recipient):
#     # if this is a POST request we need to process the form data
#     if request.method == 'POST':
#         # create a form instance and populate it with data from the request:
#         form = LinkTypeForm(request.POST)
#         # check whether it's valid:
#         if form.is_valid():
#             data = form.clean()
#             print(data)
#             # redirect to a new URL:
#             return redirect('/viewadmin/linktype/')
#         else:
#             error = form.errors
#             print(error)
#             return render(request, 'viewadmin/add.html',{'form': form,'error':error})
#     # if a GET (or any other method) we'll create a blank form
#     else:
#         form = LinkTypeForm()
#     return render(request, 'viewadmin/add.html', {'form': form})