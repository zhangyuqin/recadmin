
import subprocess
import csv
import io
import json
import datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib import messages
from django.shortcuts import render, HttpResponse, redirect, Http404
from django.http import JsonResponse
from functools import reduce
from .models import *
from django.contrib.auth.models import User
from .config.unbound import *
from .dnsdist import status, stats,stats_new,status_new
from recms.settings import BASE_DIR, CONF_OUTPUT_DIR, RECNAME, ITEMS_PER_PAGE
from . import mcache
from . import history
from . import remote



# Create your views here.
class CRUD:
    RECIPIENT = {
    'dcontrol':ACL,
    'dforward':FowarDomain,
    'dsecurity':SecurityDomain,
    'dlocal':LocalZone,
    'dlocaldata':LocalData,
    'domaingrp':DomainGroup,
    'secdomainacl':SecDomainACL,
    }

    @login_required(login_url="/login")
    def index(request):
        return render(request, "recadmin/index.html")


    @login_required(login_url="/login")
    def genconf(request):
        if gen_conf():
            messages.success(request, "配置生成完毕！")
            return HttpResponse('True')
        return HttpResponse('OOPS!Something goes wrong!')

    # @login_required(login_url="/login")
    # def ls(request, recipient):
    #     """list recipients"""
    #     print(recipient)
    #     if recipient in CRUD.RECIPIENT:
    #         objs = CRUD.RECIPIENT[recipient].objects.all()
    #         messages.success(request, "读取列表完毕！")
    #         return render(request, 'ls.html', {'objs':objs, 'recipient':recipient})
    #     raise Http404


    @login_required(login_url="/login")
    def detail(request, recipient, id):
        print(recipient)
        if recipient in CRUD.RECIPIENT:
            verbose_fields = (title.verbose_name for title in CRUD.RECIPIENT[recipient]._meta.fields[1:])
            fields = CRUD.RECIPIENT[recipient].objects.get(pk=id).get_fields()
            return render(request, 'detail.html', {'verbose_fields':verbose_fields, 'fields':fields, 'colnum':int(12/len(fields))})
        raise Http404


    @login_required(login_url="/login")
    def add(request, recipient):
        if recipient == 'dcontrol':
            newobj = ACL()
            querydict = request.POST.dict()
            newobj.name = querydict['name']
            newobj.acl = querydict['acl']
            newobj.status = int(querydict['status'])

            if gen_conf():
                messages.success(request, "配置生成完毕！")
                if querydict['status'] == '1':
                    remote.addacl(querydict['acl'])
                    newobj.save()
                    messages.success(request, "添加成功！")
                    remote.sync()
                messages.success(request, "配置已加载生效！")
            return redirect('/recadmin/'+recipient)
        elif recipient == 'dforward':
            newobj = FowarDomain()
            querydict = request.POST.dict()

            newobj.domain = querydict['domain']
            newobj.server = querydict['server']
            newobj.only = querydict['only']
            newobj.status = querydict['status']
            newobj.save()
            messages.success(request, "添加成功！")
            if gen_conf():
                messages.success(request, "配置生成完毕！")
                if querydict['status'] == '1':
                    reload_unbound('add', newobj)
                    remote.sync()
                    messages.success(request, "配置已加载生效！")
            return redirect('/recadmin/'+recipient)
        elif recipient == 'dsecurity':
            newobj = CRUD.RECIPIENT[recipient]()
            querydict = request.POST.dict()
            newobj.domain = querydict['domain']
            newobj.status = querydict['status']
            newobj.note = querydict['note']

            if gen_conf():
                if querydict['status'] == '1':
                    reload_unbound('add', newobj)
                    newobj.save()
                    remote.sync()
                    messages.success(request, "配置已加载生效！")
                    remote.sync()
            return redirect('/recadmin/'+recipient)
        elif recipient == 'dlocal':
            newobj = LocalZone()
            querydict = request.POST.dict()
            newobj.zone = querydict['zone']
            newobj.rtype = querydict['rtype']
            newobj.status = querydict['status']

            if gen_conf():
                if querydict['status'] == '1':
                    reload_unbound('add', newobj)
                    newobj.save()
                    messages.success(request, "添加成功！")
                    remote.sync()
                    messages.success(request, "配置已加载生效！")
                    remote.sync()
            return redirect('/recadmin/'+recipient)
        elif recipient == 'dlocaldata':
            newobj = LocalData()
            querydict = request.POST.dict()
            newobj.domain = querydict['domain']
            newobj.rr = querydict['rr']
            newobj.address = querydict['address']

            if gen_conf():
                remote.sync()
                reload_unbound('add', newobj)
                newobj.save()
                messages.success(request, "添加成功！")
                messages.success(request, "配置已加载生效！")
            return redirect('/recadmin/'+recipient)
        elif recipient == 'domaingrp':
            # 入库
            querydict = request.POST.dict()
            newobj = DomainGroup()
            newobj.name = querydict['name']
            newobj.tag = querydict['tag']
            newobj.save()

            sd_ids = querydict['secdomains'].split(',')
            sds = [SecurityDomain.objects.get(id=i) for i in sd_ids]
            newobj.securitydomain_set.add(*sds)
            return redirect('/recadmin/'+recipient)
        elif recipient == 'secdomainacl':
            # 入库
            dgidss = request.POST.get('domaingroups').split(',')
            dgids = [int(i) for i in dgidss]
            querydict = request.POST.dict()
            newobj = SecDomainACL()
            newobj.acl = querydict['acl']
            newobj.status = querydict['status']
            newobj.note = querydict['note']

            # 逻辑处理
            print('add: ', querydict['status'], type(querydict['status']), 'dgids: ', dgids)
            if querydict['status'] == '1':
                sdomainobjs = SecurityDomain.objects.filter(dgroup__id__in=dgids)
                sdomains = [ obj.domain for obj in sdomainobjs ]
                print('add sdomains: ', sdomains, SecurityDomain.objects.all())
                if sdomains:
                    remote.add_domain_acl(querydict['acl'], sdomains)
                    newobj.save()
                    newobj.domaingroups.add(*dgids)
            return redirect('/recadmin/'+recipient)
        raise Http404

    @login_required(login_url="/login")
    def impt(request, recipient):
        if recipient == 'dforward':
            querysetlist = []
            # print(request.FILES[recipient])
            for i in csv.reader(io.StringIO(request.FILES[recipient].read().decode('utf-8'))):
                print(i)
                domain = i[0]
                server = i[1]+','+i[2] if i[2] else i[1]
                only = 1 if i[-2] else 0
                status = 1 if i[-1] else 0
                querysetlist.append(FowarDomain(domain=domain,server=server,only=only,status=status))
            FowarDomain.objects.bulk_create(querysetlist)
            for obj in querysetlist:
                reload_unbound('add', obj)
            if gen_conf():
                remote.sync()
            return redirect('/recadmin/'+recipient)
        elif recipient == 'dlocal':
            querysetlist = []
            for i in csv.reader(io.StringIO(request.FILES[recipient].read().decode('utf-8'))):
                print(i)
                zone = i[0]
                rtype = i[1]
                status = 1 if i[-1] else 0
                querysetlist.append(LocalZone(zone=zone,rtype=rtype,status=status))
            LocalZone.objects.bulk_create(querysetlist)
            for obj in querysetlist:
                reload_unbound('add', obj)
            if gen_conf():
                remote.sync()
            return redirect('/recadmin/'+recipient)
        elif recipient == 'dlocaldata':
            querysetlist = []
            for i in csv.reader(io.StringIO(request.FILES[recipient].read().decode('utf-8'))):
                print(i)
                domain = i[0]
                rr = i[1]
                address = i[-1]
                querysetlist.append(LocalData(domain=domain,rr=rr,address=address))
            LocalData.objects.bulk_create(querysetlist)
            for obj in querysetlist:
                reload_unbound('add', obj)
            if gen_conf():
                remote.sync()
            return redirect('/recadmin/'+recipient)
        if recipient not in ['dforward', 'dlocal', 'dlocaldata']:
            return HttpResponse('该类型数据暂不支持导入，或者没有必要使用导入功能。')


    @login_required(login_url="/login")
    def delete(request, recipient, id):
        print(recipient)
        if recipient in CRUD.RECIPIENT:
            delobj = CRUD.RECIPIENT[recipient].objects.get(pk=id)
            if recipient == 'secdomainacl':
                dgs = delobj.domaingroups.all()
                dgids = [obj.id for obj in dgs ]
                sdomainobjs = SecurityDomain.objects.filter(dgroup__id__in=dgids)
                sdomains = [ obj.domain for obj in sdomainobjs ]
                if sdomains and delobj.status == 1:
                    remote.del_domain_acl(delobj.acl, sdomains)
            elif recipient == 'domaingrp':
                # 计算group关联的ACL和domains
                domainobjs = delobj.securitydomain_set.filter(status=1)
                domains = [obj.domain for obj in domainobjs ]
                aclobjs = delobj.secdomainacl_set.filter(status=1)
                acls = [ obj.acl for obj in aclobjs ]
                print(acls, domains)
                if domains and acls:
                    remote.dgroup_del_domain(acls, domains)
            else:
                if recipient == 'dcontrol':
                    remote.delacl(delobj.acl)
                    messages.success(request, "删除已生效！")
                else:
                    if reload_unbound('del', delobj):
                        messages.success(request, "删除已生效！")
                    remote.sync()
            delobj.delete()
            messages.success(request, "删除成功！")
            if gen_conf():
                messages.success(request, "配置生成完毕")
            return redirect('/recadmin/'+recipient)
        raise Http404

    @login_required(login_url="/login")
    def delete_multi(request, recipient):
        to_del = request.POST['data'].split(',')
        delobjs = CRUD.RECIPIENT[recipient].objects.filter(id__in=to_del)
        if recipient == 'dcontrol':
            for obj in delobjs:
                remote.delacl(obj.acl)
                obj.delete()
            messages.success(request, "删除已生效！")
        else:
            if recipient == 'domaingrp':
                for obj in delobjs:
                    # 计算group关联的ACL和domains
                    domainobjs = obj.securitydomain_set.filter(status=1)
                    domains = [d.domain for d in domainobjs ]
                    aclobjs = obj.secdomainacl_set.filter(status=1)
                    acls = [ i.acl for i in aclobjs ]
                    if domains and acls:
                        remote.dgroup_del_domain(acls, domains)
                    obj.delete()
                messages.success(request, "删除已生效！")
            elif recipient == 'secdomainacl':
                for obj in delobjs:
                    dgs = obj.domaingroups.all()
                    dgids = [dg.id for dg in dgs ]
                    sdomainobjs = SecurityDomain.objects.filter(dgroup__id__in=dgids)
                    sdomains = [ sd.domain for sd in sdomainobjs ]
                    if sdomains and obj.status == 1:
                        remote.del_domain_acl(obj.acl, sdomains)
                    obj.delete()
                messages.success(request, "删除已生效！")
            else:
                for obj in delobjs:
                    reload_unbound('del', obj)
                    messages.success(request, "配置已加载生效！")
                    obj.delete()
                messages.success(request, "删除已生效！")
            if gen_conf():
                remote.sync()
                messages.success(request, "配置生成完毕并完成同步")
        return HttpResponse(1)

    @login_required(login_url="/login")
    def update(request, recipient,id):
        if request.method == 'GET':
            print(recipient)
            if recipient == 'dcontrol':
                obj = ACL.objects.get(pk=id)
                contents = {'name':obj.name, 'acl':obj.acl, 'status':obj.status}
                return render(request, 'recadmin/dcontrol/update.html', {'contents':contents})
            elif recipient == 'dforward':
                obj = FowarDomain.objects.get(pk=id)
                contents = {'domain':obj.domain, 'server':obj.server, 'only':obj.only, 'status':obj.status}
                return render(request, 'recadmin/dforward/update.html', {'contents':contents})
            elif recipient == 'dsecurity':
                obj = CRUD.RECIPIENT[recipient].objects.get(pk=id)
                contents = {'domain':obj.domain, 'status':obj.status ,'note':obj.note}
                return render(request, 'recadmin/dsecurity/update.html', {'contents':contents})
            elif recipient == 'dforbidden':   
                obj = CRUD.RECIPIENT[recipient].objects.get(pk=id)
                contents = {'domain':obj.domain, 'status':obj.status}
                return render(request, 'recadmin/dforbidden/update.html', {'contents':contents})
            elif recipient == 'dlocal':
                obj = LocalZone.objects.get(pk=id)
                contents = {'zone':obj.zone, 'rtype':obj.rtype, 'status':obj.status}
                return render(request, 'recadmin/dlocal/update.html', {'contents':contents})
            elif recipient == 'dlocaldata':
                obj = LocalData.objects.get(pk=id)
                contents = {'domain':obj.domain, 'rr':obj.rr, 'address':obj.address}
                return render(request, 'recadmin/dlocaldata/update.html', {'contents':contents})
            elif recipient == 'domaingrp':
                return HttpResponse(recipient)
            raise Http404
        elif request.method == 'POST':
            def a(x, y):
                return x or y
            if recipient == 'dcontrol':
                obj = ACL.objects.get(pk=id)
                old_acl = obj.acl
                querydict = request.POST.dict()
                update_flag = [0, 0] # name, status
                if obj.name != querydict['name']:
                    obj.name = querydict['name']
                    update_flag[0] = 1
                if obj.status != int(querydict['status']):
                    obj.status = int(querydict['status'])
                    update_flag[1] = 1
                if update_flag != [0, 0]:
                    obj.save()
                    if update_flag[1] == 1: # status 发生了变化
                        if gen_conf():
                            messages.success(request, "更新成功同时配置生成完毕！")
                        if obj.status == 1:# 未启用到启用（启用该ACL）
                            remote.addacl(querydict['acl'])
                        else:# 启用到未启用（禁用该ACL）
                            remote.delacl(old_acl)
                return redirect('/recadmin/'+recipient)
            elif recipient == 'dforward':
                querydict = request.POST.dict()
                # id = querydict['id'] 
                obj = FowarDomain.objects.get(pk=id)
                # reload_unbound('del', obj)
                # obj.domain = querydict['domain']
                update_flag = [0, 0, 0] # server, only, status
                if obj.server != querydict['server']:
                    obj.server = querydict['server']
                    update_flag[0] = 1
                if obj.only != int(querydict['only']):
                    obj.only = int(querydict['only'])
                    update_flag[1] = 1
                if obj.status != int(querydict['status']):
                    obj.status = int(querydict['status'])
                    update_flag[-1] = 1
                if reduce(a,update_flag):
                    #print('1则改变')
                    obj.save()
                    if gen_conf():
                        remote.sync()
                        messages.success(request, "更新成功同时配置生成完毕！")
                        if update_flag[-1] == 1:# status 发生了变化
                            if obj.status == True:# 未启用到启用
                                reload_unbound('add', obj)
                            else:# 启用到未启用
                                reload_unbound('del', obj)
                            messages.success(request, "配置已加载生效！")
                        else:# status 未发生变化
                            if obj.status == True:
                                reload_unbound('add', obj)
                                messages.success(request, "配置已加载生效！")
                            else:# status 一直处于未启用状态，其他字段的修改只需入库即可
                                pass
                return redirect('/recadmin/'+recipient)
            elif recipient == 'dsecurity':
                obj = CRUD.RECIPIENT[recipient].objects.get(pk=id)
                # reload_unbound('del', obj)
                querydict = request.POST.dict()
                # obj.domain = querydict['domain']
                update_flag = [0, 0]# status, note
                if obj.status != int(querydict['status']):
                    obj.status = int(querydict['status'])
                    update_flag[0] = 1
                if obj.note != querydict['note']:
                    obj.note = querydict['note']
                    update_flag[1] = 1
                if update_flag != [0, 0]:
                    obj.save()
                    if update_flag[0] == 1:
                        if gen_conf():
                            messages.success(request, "更新成功同时配置生成完毕！")
                            remote.sync()
                            if obj.status == True:
                                reload_unbound('add', obj)
                            else:
                                reload_unbound('del', obj)
                            messages.success(request, "配置已加载生效！")
                return redirect('/recadmin/'+recipient)
            elif  recipient == 'dforbidden':  
                obj = CRUD.RECIPIENT[recipient].objects.get(pk=id)
                status = obj.status
                querydict = request.POST.dict()
                if int(querydict['status']) !=  status:
                    # 当状态发生改变的时候，修改配置
  
                    print(status, querydict['status'], type(querydict['status']))
                    # obj.domain = querydict['domain']
                    obj.status = int(querydict['status'])
                    if obj.status == 0:
                        # disble
                        reload_unbound('del', obj)
                        mcache.remove_cache('zone', zone=obj.domain)
                        messages.success(request, "配置已加载生效")
                    else:
                        reload_unbound('add', obj)
                        mcache.remove_cache('zone', zone=querydict['domain'])
                    obj.save()
                    if gen_conf():
                        messages.success(request, "配置已更新")
                        remote.sync()
                return redirect('/recadmin/'+recipient)
            elif recipient == 'dlocal':
                obj = LocalZone.objects.get(pk=id)
                querydict = request.POST.dict()
                # obj.zone = querydict['zone']
                update_flag = [0, 0]# rtype, status
                if obj.rtype != querydict['rtype']:
                    obj.rtype = querydict['rtype']
                    update_flag[0] = 1
                if obj.status != int(querydict['status']):
                    obj.status = int(querydict['status'])
                    update_flag[-1] = 1
                if update_flag != [0, 0]:
                    obj.save()
                    if gen_conf():
                        remote.sync()
                        messages.success(request, "更新成功同时配置生成完毕！")
                        if update_flag[-1] == 1:# status 发生了变化
                            if obj.status == True:# 未启用到启用
                                reload_unbound('add', obj)
                            else:# 启用到未启用
                                reload_unbound('del', obj)
                            messages.success(request, "配置已加载生效！")
                        else:# status 未发生变化
                            if obj.status == True:
                                reload_unbound('add', obj)
                            else:# status 一直处于未启用状态，其他字段的修改只需入库即可
                                pass
                return redirect('/recadmin/'+recipient)

            elif recipient == 'dlocaldata':
                obj = LocalData.objects.get(pk=id)
                reload_unbound('del', obj)
                querydict = request.POST.dict()
                # obj.domain = querydict['domain']
                update_flag = [0, 0]# rr, address
                if obj.rr != querydict['rr']:
                    obj.rr = querydict['rr']
                    update_flag[0] = 1
                if obj.address != querydict['address']:
                    obj.address = querydict['address']
                    update_flag[-1] =1
                if update_flag != [0, 0]:
                    obj.save()
                    if gen_conf():
                        remote.sync()
                        if update_flag[0] == 1:
                            print('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
                            reload_unbound('del', obj)
                            print('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
                            reload_unbound('add', obj)
                        else:
                            reload_unbound('add', obj)
                        messages.success(request, "配置已加载生效！")
                return redirect('/recadmin/'+recipient)

            elif recipient == 'domaingrp':
                querydict = request.POST.dict()
                obj = DomainGroup.objects.get(pk=id)
                sd_ids_before = set([i.id for i in obj.securitydomain_set.all()])
                sd_ids_after = request.POST.get('secdomains').split(',')
                sd_ids_after = set([int(i) for i in sd_ids_after])  #  切记数据类型
                obj.name = querydict['name']
                obj.tag = querydict['tag']
                obj.save()
                if sd_ids_before != sd_ids_after:
                    obj.securitydomain_set.clear()
                    obj.securitydomain_set.add(*[SecurityDomain.objects.get(id=i) for i in sd_ids_after])

                # 计算增加的域名
                sd_ids_new = sd_ids_after - sd_ids_before
                new_domain_objs = SecurityDomain.objects.filter(id__in=sd_ids_new)
                new_domains = [i.domain for i in new_domain_objs]
                # 计算减少的域名
                sd_ids_del = sd_ids_before - sd_ids_after
                del_domain_objs = SecurityDomain.objects.filter(id__in=sd_ids_del)
                del_domains = [i.domain for i in del_domain_objs]

                # 计算和domaingroup关联的secdomainacl
                sdaclobjs = SecDomainACL.objects.filter(domaingroups__id__contains=id)
                sacls = [i.acl for i in sdaclobjs]
                if sd_ids_new and sacls:
                    # 存在acl并且有新增域名，执行增加域名操作
                    remote.dgroup_add_domain(sacls, new_domains)

                if sd_ids_del and sacls:
                    # 存在acl并且有减少域名，执行减少域名操作
                    remote.dgroup_del_domain(sacls, del_domains)

                return redirect('/recadmin/'+recipient)
            
            elif recipient == 'secdomainacl':
                obj = SecDomainACL.objects.get(pk=id)
                origin_status = obj.status
                querydict = request.POST.dict()
                dgidss = request.POST.get('domaingroups').split(',')
                dgids_before = set([dg.id for dg in obj.domaingroups.all()])
                dgids_after = set([int(i) for i in dgidss])
                obj.acl = querydict['acl']
                obj.status = querydict['status']
                obj.note = querydict['note']
                obj.save()
                if dgids_before != dgids_after:
                    obj.domaingroups.clear()
                    obj.domaingroups.add(*dgids_after)

                dgroup_ids_new = dgids_after - dgids_before
                new_domain_objs = SecurityDomain.objects.filter(dgroup__id__in=dgroup_ids_new)
                new_domains = [d.domain for d in new_domain_objs]
                dgroup_ids_del = dgids_before - dgids_after
                del_domain_objs = SecurityDomain.objects.filter(dgroup__id__in=dgroup_ids_del)
                del_domains = [d.domain for d in del_domain_objs]

                # 判断status 变化
                print('update: ', querydict['status'], new_domains, 'del:', del_domains)
                if origin_status == 1 and obj.status == '1':
                    # 启用acl或者更新domaingroup
                    if new_domains:
                        remote.dgroup_add_domain([obj.acl], new_domains)
                    
                    if del_domains:
                        remote.dgroup_del_domain([obj.acl], del_domains)
                elif origin_status == 0 and obj.status == '1':
                    #启用domaingroup, 0-->1
                    if new_domains:
                        remote.dgroup_add_domain([obj.acl], new_domains)
                    
                    if del_domains:
                        remote.dgroup_del_domain([obj.acl], del_domains)

                    domain_objs = SecurityDomain.objects.filter(dgroup__id__in=dgids_before)
                    domains = [d.domain for d in domain_objs]
                    remote.dgroup_add_domain([obj.acl], domains)
                elif origin_status == 1 and obj.status == '0':
                    # 停用acl
                    domain_objs = SecurityDomain.objects.filter(dgroup__id__in=dgids_before)
                    domains = [d.domain for d in domain_objs]
                    remote.dgroup_del_domain([obj.acl], domains)
                else:
                    # disable 状态, 不做任何操作
                    pass

                return redirect('/recadmin/'+recipient)
            raise Http404

    @login_required(login_url="/login")
    def operate(request, recipient, id):
        print(recipient)
        if recipient in CRUD.RECIPIENT:
            return HttpResponse("operate "+id)
        raise Http404

    @login_required(login_url="/login")
    def operate_multi(request, recipient):
        to_op = request.POST['data'].split(',')
        to_op = [int(i) for i in to_op ]
        if request.GET.get('status') == '1':
            opcode = 1
            opobjs = CRUD.RECIPIENT[recipient].objects.filter(id__in=to_op, status=0)
            for obj in opobjs:
                obj.status = 1
                obj.save()
            updated_counts = len(opobjs)
        else:
            opcode = 0
            opobjs = CRUD.RECIPIENT[recipient].objects.filter(id__in=to_op, status=1)
            for obj in opobjs:
                obj.status = 0
                obj.save()
            #updated_counts = opobjs.update(status=0)
            updated_counts = len(opobjs)
        if updated_counts == 0:
            messages.success(request, "选中的记录的状态均无变化，无需更新配置！")
        else:
            # 确保保存到数据库
            for opobj in opobjs:
                opobj.save()
            # 判断是启用还是停用
            if opcode == 1:
                # 启用
                if gen_conf():
                    for obj in opobjs:
                        if recipient == 'dcontrol':
                            remote.addacl(obj.acl)
                        elif recipient == 'secdomainacl':
                            dgids = set([dg.id for dg in obj.domaingroups.all()])
                            domain_objs = SecurityDomain.objects.filter(dgroup__id__in=dgids)
                            domains = [d.domain for d in domain_objs]
                            if domains:
                                remote.dgroup_add_domain([obj.acl], domains)
                        elif recipient == "dforbidden":
                                reload_unbound('add', obj)
                                mcache.remove_cache('zone', zone=obj.domain)
                                messages.success(request, "配置已加载生效！")
                        else:
                            reload_unbound('add', obj)
                            messages.success(request, "配置已加载生效！")
                    if recipient != 'dcontrol':
                        remote.sync()
            else:
                # 停用
                if gen_conf():
                    for obj in opobjs:
                        if recipient == 'dcontrol':
                            remote.delacl(obj.acl)
                        elif recipient == 'dforbidden':
                            reload_unbound('del', obj)
                            mcache.remove_cache('zone', zone=obj.domain)
                            messages.success(request, "配置已加载生效")
                        elif recipient == 'secdomainacl':
                            dgids = set([dg.id for dg in obj.domaingroups.all()])
                            domain_objs = SecurityDomain.objects.filter(dgroup__id__in=dgids)
                            domains = [d.domain for d in domain_objs]
                            if domains:
                                remote.dgroup_del_domain([obj.acl], domains)
                        else:
                            reload_unbound('del', obj)
                            messages.success(request, "配置已加载生效！")
                    if recipient != 'dcontrol':
                        remote.sync()
        return HttpResponse(1)



def gen_conf():
    l=''
    for acl in ACL.objects.filter(status=1):
        l+=acl.acl+' allow;'
    dictconf = read_config(BASE_DIR+'/unbound.conf')
    dictconf['server']['access-control'] = l.strip(';')
    write_config(dictconf, CONF_OUTPUT_DIR+'/unbound.conf')
    write_local_data(gen_local_zone_data(), CONF_OUTPUT_DIR+'/unbound-local-data.conf')
    write_forward_zone(gen_forward_zone_conf(), CONF_OUTPUT_DIR+'/'+RECNAME+'.zone')
    return 1



def gen_local_zone_data():
    """retrieve local_zone,local_data to gen local_zone_data"""
    lz = LocalZone.objects.filter(status=1).values('zone','rtype','pool')
    ld = LocalData.objects.all().values('domain','rr','address','pool')

    local_zone = []
    local_data = []
    for i in lz:
        if i['pool'] != None:
            local_zone.append((i['zone'], i['rtype'],Pool.objects.get(id=i['pool']).name))
        else:
            local_zone.append((i['zone'], i['rtype']))
    for i in ld:
        if i['pool'] != None:
            local_data.append((i['domain'], i['rr'], i['address'],Pool.objects.get(id=i['pool']).name))
        else:
            local_data.append((i['domain'], i['rr'], i['address']))
    return local_zone, local_data


def gen_forward_zone_conf():
    """retrieve forward_domain to gen forward_zone_conf"""
    fd = FowarDomain.objects.filter(status=1).values('domain','pool','server','only')
    forward_domain = []
    pool_d = []
    for i in fd:
        d = {}
        d['name'] = i['domain']
        d['forward-addr'] = []
        if ' ' in i['server']:
            dforward = i['server'].split(' ')
        elif ';' in i['server']:
            dforward = i['server'].split(';')
        else:
            dforward = i['server'].split(',')
        d['forward-addr'] += dforward
        if not i['only']:
            d['forward-first'] = 'yes'
        if i['pool'] != None:
            pool_dir = Pool.objects.get(id=i['pool']).name
            pool_d.append({pool_dir:[d]})
        else:
            forward_domain.append(d)

    sd = SecurityDomain.objects.filter(status=1).values('domain','pool','ns') # 防污染域名通过转发实现
    for i in sd:
        d = {}
        d['name'] = i['domain']
        if ' ' in i['ns']:
            d['forward-addr'] = i['ns'].split(' ')
        elif ';' in i['ns']:
            d['forward-addr'] = i['ns'].split(';')
        else:
            d['forward-addr'] = i['ns'].split(',')
        if i['pool'] != None:
            pool_dir = Pool.objects.get(id=i['pool']).name
            pool_d.append({pool_dir:[d]})
        else:
            forward_domain.append(d)
    return {'forward-zone': forward_domain,'forward-pool':pool_d}


@login_required(login_url="/login")
def dns_status(request):
    """ get topn information """
    ret = status()
    return JsonResponse(ret)

@login_required(login_url="/login")
def dns_stats(request):
    """ get topn information """
    ret = stats()
    return JsonResponse(ret,safe=False)

@login_required(login_url="/login")
def dns_status_new(request):
    """ get topn information """
    ret = status_new()
    return JsonResponse(ret,safe=False)

@login_required(login_url="/login")
def dns_stats_new(request):
    """ get topn information """
    ret = stats_new()
    return JsonResponse(ret,safe=False)

def reg(request):
    if request.method == "POST":
        name = request.POST['username']
        password = request.POST['password']
        password2 = request.POST['password2']
        if password == password2:
            user = User.objects.create_user(username=name, password=password)
            try:
                user.is_active = True
                return redirect('/login')
            except Exception as e:
                user.delete()
    return render(request, 'recadmin/reg.html',)


def my_login(request):
    if request.method == 'GET':
        return render(request, 'recadmin/login.html', {'err': 0})
    elif request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # handl url: '/login/?next=/acl/'
            jump_url = request.GET.get('next', '/')
            return redirect(jump_url)
        else:
            return render(request, 'recadmin/login.html', {'err': 1})

@login_required(login_url="/login")
def my_logout(request):
    logout(request)
    return redirect('/login')


def reload_unbound(motion=0, obj=None):
    """ reload unbound dynamically or just reload """
    
    fcmd = "dnsagentc -cmd cmd {cmd}"
    motion_map_cmd = {
        'add':obj.get_cmd(),
        'del':obj.get_remove_cmd(),
    }
    mycmd = motion_map_cmd[motion]
    cmd = fcmd.format(cmd=mycmd)

    if subprocess.run(cmd,shell=True).returncode: #0是假，非0为真，一般returncode为0
        return False
    return True


@login_required(login_url="/login")
def sync(request):
    remote.sync()
    return HttpResponse('True')


@login_required(login_url="/login")
def cache_op(request):
    qname = request.GET.get('qname')
    qtype = request.GET.get('type')
    zone = request.GET.get('zone')

    if qtype is not None:
        mcache.remove_cache('qtype', qname=qname, qtype=qtype)
    elif zone is not None:
        mcache.remove_cache('zone', zone=zone)
    elif qname is not None:
        mcache.remove_cache('name', qname=qname)

    messages.success(request, "delete cache")
    return render(request, 'recadmin/cache.html')
    #return HttpResponse('delete cache')

@login_required(login_url="/login")
def history_qname(request):
    qname = request.GET.get('qname')
    client = request.GET.get('client')
    start = request.GET.get('start')
    end = request.GET.get('end')
    isfuzz = int(request.GET.get('fuzz', 0))

    try:
        qlimit = int(request.GET.get('qlimit', 100))
    except ValueError:
        qlimit = 100

    if not qlimit:
        # qlimit == 0, 不做查询数量限制
        qlimit = None

    if qname:
        if not qname.endswith('.'):
            qname += '.'
        queries = history.FUZZ_SEARCH[isfuzz](qname, start, end) 
    else:
        queries = history.lookup_client(client, start, end) 

    qall = queries[:qlimit]

    for q in qall:
        # format to date
        q.timestamp = datetime.datetime.fromtimestamp(q.timestamp)

    if queries.exists():
        # got data
        contents = qall
        paginator = Paginator(contents, 10) 
        page = request.GET.get('page')
        try:
            pagedobjs = paginator.page(page)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            pagedobjs = paginator.page(1)
        except EmptyPage:
            # If page is out of range (e.g. 9999), deliver last page of results.
            pagedobjs = paginator.page(paginator.num_pages)  
        return  render(request, 'recadmin/history.html',{'contents':pagedobjs,'range': paginator.page_range}) 
    else:
        # no data
        contents = 'no data'
       # return JsonResponse(contents,safe=False)
        return  render(request, 'recadmin/history.html',{'contents':contents})  

@login_required(login_url="/login")
def show(request,href):
    if href == 'dforward':
        query_str = request.GET.get('q')
        if query_str:
            contents = FowarDomain.objects.filter(domain__icontains=query_str)
        else:    
            contents = FowarDomain.objects.all()
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
        return  render(request, 'recadmin/show.html',{'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'dlocal':
        query_str = request.GET.get('q')
        if query_str:
            contents = LocalZone.objects.filter(zone__icontains=query_str)
        else:    
            contents = LocalZone.objects.all()
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
        return  render(request, 'recadmin/localshow.html',{'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'dlocaldata':
        query_str = request.GET.get('q')
        if query_str:
            contents = LocalData.objects.filter(domain__icontains=query_str)
        else:    
            contents = LocalData.objects.all()   
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
        return  render(request, 'recadmin/localdatashow.html',{'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href}) 
    elif href == 'dsecurity':
        query_str = request.GET.get('q')
        if query_str:
            contents = SecurityDomain.objects.filter(domain__icontains=query_str)
        else: 
            contents = SecurityDomain.objects.all()
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
        return  render(request, 'recadmin/pollutionshow.html',{'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})
    elif href == 'dcache':
        contents = LocalData.objects.all()
        return  render(request, 'recadmin/cache.html',{'contents':contents})  
    elif href == 'dcontrol':
        query_str = request.GET.get('q')
        if query_str:
            contents = ACL.objects.filter(name__icontains=query_str)
        else:
            contents = ACL.objects.all()
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
        return  render(request, 'recadmin/control.html',{'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})  
    elif href == 'realtime':
        contents = 'aaaaaa'  
        return  render(request, 'recadmin/realtime.html')  
    elif href == 'dhistory':
        return  render(request, 'recadmin/history.html')  

    elif href == 'domaingrp':
        contents = DomainGroup.objects.all()
        sds = SecurityDomain.objects.filter(status=1)
        sds_list = [{'id':sd.id,'domain':sd.domain} for sd in sds]
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
        return render(request, 'recadmin/domaingrpshow.html', {'sds_list':json.dumps(sds_list), 'sds':sds, 'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})
    elif href == 'secdomainacl':
        contents = SecDomainACL.objects.all()
        dgs = DomainGroup.objects.all()
        dgs_list = [{'id':dg.id,'name':dg.name} for dg in dgs]
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
        return render(request, 'recadmin/secdomainaclshow.html', {'dgs_list':json.dumps(dgs_list), 'dgs':dgs, 'contents':pagedobjs,'range':list(paginator.page_range),'recipient':href})
    elif href == 'host':
        return render(request, 'recadmin/host.html')
    raise Http404


@login_required(login_url="/login")
def help(request):
    return  render(request, 'recadmin/help.html')

def df(request):

    return render(request, 'recadmin/df.html',locals())