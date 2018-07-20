import subprocess
import dns.resolver
import time

import os,django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recms.settings")
django.setup()

from django.test import TestCase
from django.test import Client
from django.contrib.auth.models import User
from .models import *

# run all tests: python manage.py test recadmin
# run ACL tests: python manage.py test recadmin.tests.ACLTests
# run Index tests: python manage.py test recadmin.tests.IndexTests


class IndexTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.username = 'test'
        self.email = 'test@test.com'
        self.password = 'test'        
        self.test_user = User.objects.create_user(self.username, self.email, self.password)
        login = self.client.login(username=self.username, password=self.password)
        self.assertEqual(login, True)

    def test_index(self):
        #client = Client()
        #print(client.login(username='admin', password='adminadmin'))
        #response = client.get('/add/', {'name':'txx'})
        #response = client.get('/')
        #response = self.client.post('/login/', {'username':'test', 'password':'test'}, follow=True)
        response = self.client.get('/', follow=True)
        #response = client.post('/update/', {'name':'test', 'status':1})
        #print(response)
        #print(response.content)
        #print(response.request)
        #self.assertEqual(response.status_code, 200)
        self.assertContains(response, "递归管理系统")
        self.assertContains(response, "功能列表")
        #self.assertQuerysetEqual(response.context['latest_question_list'], [])

class ACLTests(TestCase):
    def setUp(self):
        #每个测试用例执行前，设置执行环境
        self.client = Client()
        self.username = 'test'
        self.email = 'test@test.com'
        self.password = 'test'        
        self.test_user = User.objects.create_user(self.username, self.email, self.password)
        login = self.client.login(username=self.username, password=self.password)
        self.assertEqual(login, True)

    def test_add_acl_pause(self):
        self.client.post('/dcontrol/add', {'name':'t323', 'acl':'18.0.0.0/8', 'status':0})
        self.client.post('/dcontrol/add', {'name':'t423', 'acl':'19.0.0.0/8', 'status':0})
        response = self.client.get('/dcontrol/')
        #print(response, response.content)
        self.assertContains(response, "t323")
        # todo 测试所有dns节点未ACL
        cmd = "dnsagentc -cmd showacl"
        acls = subprocess.check_output(cmd, universal_newlines=True, shell=True)
        self.assertTrue('18.0.0.0/8' not in acls)
        self.assertTrue('19.0.0.0/8' not in acls)

    def test_add_acl_enable(self):
        self.client.post('/dcontrol/add', {'name':'t523', 'acl':'17.0.0.0/8', 'status':1})
        self.client.post('/dcontrol/add', {'name':'t623', 'acl':'16.0.0.0/8', 'status':1})
        response = self.client.get('/dcontrol/')
        #print(response, response.content)
        # 检查html 页面展示结果
        self.assertContains(response, "t523")
        self.assertContains(response, "t623")
        # todo 测试所有dns节点已经添加了ACL
        cmd = "dnsagentc -cmd showacl"
        acls = subprocess.check_output(cmd, universal_newlines=True, shell=True)
        self.assertTrue('16.0.0.0/8' in acls)
        self.assertTrue('17.0.0.0/8' in acls)

    def tearDown(self):
        # 每个测试执行后，执行清理操作
        # 删除添加的数据
        self.client.get('/dcontrol/1/del')
        self.client.get('/dcontrol/2/del')

class DomainGroupTests(IndexTests):
    """域名分组的测试用例"""
    def test_add_domaingroup(self):
        self.client.post('/domaingrp/add', {'name':'Group001', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group002', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group003', 'tag':'test'})
        response = self.client.get('/domaingrp/', follow=True)
        # print(response, response.content)
        self.assertContains(response, 'Group001')
        self.assertContains(response, 'Group002')
        self.assertContains(response, 'Group003')

    def test_del_domaingroup(self):
        self.client.post('/domaingrp/add', {'name':'Group001', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group002', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group003', 'tag':'test'})
        response = self.client.get('/domaingrp/1/del', follow=True)
        self.assertNotContains(response, 'Group001')
        response = self.client.get('/domaingrp/2/del', follow=True)
        self.assertNotContains(response, 'Group002')
        response = self.client.get('/domaingrp/3/del', follow=True)
        self.assertNotContains(response, 'Group003')

    def test_add_domaingroup_with_domain(self):
        self.client.post('/dsecurity/add', {'domain':'google.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'domain':'facebook.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'domain':'dropbox.com', 'status':1, 'note':'老师'})

        self.client.post('/domaingrp/add', {'name':'Group001', 'tag':'test', 'secdomains':('1', '2')})
        self.client.post('/domaingrp/add', {'name':'Group002', 'tag':'test', 'secdomains':('2', '3')})
        self.client.post('/domaingrp/add', {'name':'Group003', 'tag':'test', 'secdomains':('1', '3')})
        response = self.client.get('/domaingrp/', follow=True)
        # print(response, response.content)
        self.assertContains(response, 'Group001')
        self.assertContains(response, 'Group002')
        self.assertContains(response, 'Group003')

    def test_del_domaingroup_with_domain(self):
        self.client.post('/dsecurity/add', {'domain':'google.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'domain':'facebook.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'domain':'dropbox.com', 'status':1, 'note':'老师'})

        self.client.post('/domaingrp/add', {'name':'Group001', 'tag':'test', 'secdomains':('1', '2')})
        self.client.post('/domaingrp/add', {'name':'Group002', 'tag':'test', 'secdomains':('2', '3')})
        self.client.post('/domaingrp/add', {'name':'Group003', 'tag':'test', 'secdomains':('1', '3')})
        response = self.client.get('/domaingrp/1/del', follow=True)
        self.assertNotContains(response, 'Group001')
        response = self.client.get('/domaingrp/2/del', follow=True)
        self.assertNotContains(response, 'Group002')
        response = self.client.get('/domaingrp/3/del', follow=True)
        self.assertNotContains(response, 'Group003')

class SecDomainACLTests(IndexTests):
    def setUp(self):
        super(SecDomainACLTests, self).setUp()
        self.client.post('/domaingrp/add', {'name':'Group001', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group002', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group003', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group004', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group005', 'tag':'test'})
        self.client.post('/domaingrp/add', {'name':'Group006', 'tag':'test'})

    def test_add_secdomainacl_no_domain(self):
        self.client.post('/secdomainacl/add', {'acl':'192.168.0.0/24', 'domaingroups':('1', '2', '3'), 'status':1, 'note':'老师'})
        self.client.post('/secdomainacl/add', {'acl':'192.168.1.0/24', 'domaingroups':('4', '5', '6'), 'status':0, 'note':'学生'})
        response = self.client.get('/secdomainacl/', follow=True)
        self.assertContains(response, '192.168.0.0/24')
        self.assertContains(response, 'Group001')
        self.assertContains(response, 'Group002')
        self.assertContains(response, 'Group003')
        self.assertContains(response, 'True')
        self.assertContains(response, '老师')
        self.assertContains(response, '192.168.1.0/24')
        self.assertContains(response, 'Group004')
        self.assertContains(response, 'Group005')
        self.assertContains(response, 'Group006')
        self.assertContains(response, 'False')
        self.assertContains(response, '学生')

    def test_del_secdomainacl_no_domain(self):
        self.client.post('/secdomainacl/add', {'acl':'192.168.0.0/24', 'domaingroups':('1', '2', '3'), 'status':1, 'note':'老师'})
        self.client.post('/secdomainacl/add', {'acl':'192.168.1.0/24', 'domaingroups':('4', '5', '6'), 'status':0, 'note':'学生'})
        response = self.client.get('/secdomainacl/1/del', follow=True)
        self.assertNotContains(response, '192.168.0.0/24')
        self.assertNotContains(response, 'Group001')
        self.assertNotContains(response, 'Group002')
        self.assertNotContains(response, 'Group003')
        self.assertNotContains(response, 'True')
        self.assertNotContains(response, '老师')
        response = self.client.get('/secdomainacl/2/del', follow=True)
        self.assertNotContains(response, '192.168.1.0/24')
        self.assertNotContains(response, 'Group004')
        self.assertNotContains(response, 'Group005')
        self.assertNotContains(response, 'Group006')
        self.assertNotContains(response, 'False')
        self.assertNotContains(response, '学生')

    def test_add_secdomainacl_with_domain(self):
        self.client.post('/dsecurity/add', {'dgroup':'1', 'domain':'google.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'2', 'domain':'facebook.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'3', 'domain':'dropbox.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'4', 'domain':'twitter.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'5', 'domain':'t.co', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'6', 'domain':'youtube.com', 'status':1, 'note':'老师'})
        self.client.post('/secdomainacl/add', {'acl':'192.168.0.0/24', 'domaingroups':('1', '2', '3'), 'status':1, 'note':'老师'})
        self.client.post('/secdomainacl/add', {'acl':'192.168.1.0/24', 'domaingroups':('4', '5', '6'), 'status':0, 'note':'学生'})
        response = self.client.get('/secdomainacl/', follow=True)
        self.assertContains(response, '192.168.0.0/24')
        self.assertContains(response, 'Group001')
        self.assertContains(response, 'Group002')
        self.assertContains(response, 'Group003')
        self.assertContains(response, 'True')
        self.assertContains(response, '老师')
        self.assertContains(response, '192.168.1.0/24')
        self.assertContains(response, 'Group004')
        self.assertContains(response, 'Group005')
        self.assertContains(response, 'Group006')
        self.assertContains(response, 'False')
        self.assertContains(response, '学生')

    def test_update_secdomainacl_with_domain(self):
        self.client.post('/dsecurity/add', {'dgroup':'1', 'domain':'google.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'2', 'domain':'facebook.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'3', 'domain':'dropbox.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'4', 'domain':'twitter.com', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'5', 'domain':'t.co', 'status':1, 'note':'老师'})
        self.client.post('/dsecurity/add', {'dgroup':'6', 'domain':'youtube.com', 'status':1, 'note':'老师'})

        self.client.post('/domaingrp/1/update', {'name':'Group001', 'tag':'test', 'secdomains':(1,)})
        self.client.post('/domaingrp/2/update', {'name':'Group002', 'tag':'test', 'secdomains':(2,)})
        self.client.post('/domaingrp/3/update', {'name':'Group003', 'tag':'test', 'secdomains':(3,)})
        self.client.post('/domaingrp/4/update', {'name':'Group004', 'tag':'test', 'secdomains':(4,)})
        self.client.post('/domaingrp/5/update', {'name':'Group005', 'tag':'test', 'secdomains':(5,)})
        self.client.post('/domaingrp/6/update', {'name':'Group006', 'tag':'test', 'secdomains':(6,)})

        self.client.post('/secdomainacl/add', {'acl':'192.168.0.0/24', 'domaingroups':('1', '2', '3'), 'status':1, 'note':'老师'})
        self.client.post('/secdomainacl/add', {'acl':'192.168.1.0/24', 'domaingroups':('4', '5'), 'status':0, 'note':'学生'})
        response = self.client.get('/secdomainacl/', follow=True)
        print(response.content)
        self.assertContains(response, '192.168.0.0/24')
        self.assertContains(response, 'Group001')
        self.assertContains(response, 'Group002')
        self.assertContains(response, 'Group003')
        self.assertContains(response, 'True')
        self.assertContains(response, '老师')
        self.assertContains(response, '192.168.1.0/24')
        self.assertContains(response, 'Group004')
        self.assertContains(response, 'Group005')
        self.assertNotContains(response, 'Group006', html=True)
        self.assertContains(response, 'False')
        self.assertContains(response, '学生')
        self.client.post('/secdomainacl/1/update', {'acl':'192.168.0.0/24', 'domaingroups':('1', '2', '6'), 'status':1, 'note':'老师'})
        response = self.client.get('/secdomainacl/', follow=True)

    def test_del_secdomainacl_with_domain(self):
        self.client.post('/secdomainacl/add', {'acl':'192.168.0.0/24', 'domaingroups':('1', '2', '3'), 'status':1, 'note':'老师'})
        self.client.post('/secdomainacl/add', {'acl':'192.168.1.0/24', 'domaingroups':('4', '5', '6'), 'status':0, 'note':'学生'})
        response = self.client.get('/secdomainacl/1/del', follow=True)
        self.assertNotContains(response, '192.168.0.0/24')
        self.assertNotContains(response, 'Group001')
        self.assertNotContains(response, 'Group002')
        self.assertNotContains(response, 'Group003')
        self.assertNotContains(response, 'True')
        self.assertNotContains(response, '老师')
        response = self.client.get('/secdomainacl/2/del', follow=True)
        self.assertNotContains(response, '192.168.1.0/24')
        self.assertNotContains(response, 'Group004')
        self.assertNotContains(response, 'Group005')
        self.assertNotContains(response, 'Group006')
        self.assertNotContains(response, 'False')
        self.assertNotContains(response, '学生')


class CacheTests(IndexTests):
    def test_del_domain_cache(self):
        self.client.get('/cache/', {'qname':'qq.com', 'type':'A'})
        ttl_before = dns.resolver.query('qq.com', 'A').rrset.ttl
        print(ttl_before)
        time.sleep(5)
        print(dns.resolver.query('qq.com', 'A').rrset.ttl)
        self.client.get('/cache/', {'qname':'qq.com', 'type':'A'})
        ttl_after = dns.resolver.query('qq.com', 'A').rrset.ttl
        self.assertEqual(ttl_before, ttl_after)
    def test_del_zone_cache(self):
        self.client.get('/cache/', {'zone':'qq.com'})
        ttl_a_before = dns.resolver.query('qq.com', 'A').rrset.ttl
        ttl_mx_before = dns.resolver.query('qq.com', 'MX').rrset.ttl
        print(ttl_a_before, ttl_mx_before)
        time.sleep(5)
        print(dns.resolver.query('qq.com', 'A').rrset.ttl, dns.resolver.query('qq.com', 'MX').rrset.ttl)
        self.client.get('/cache/', {'zone':'qq.com'})
        ttl_a_after = dns.resolver.query('qq.com', 'A').rrset.ttl
        ttl_mx_after = dns.resolver.query('qq.com', 'MX').rrset.ttl
        self.assertEqual(ttl_a_before, ttl_a_after)
        self.assertEqual(ttl_mx_before, ttl_mx_after)

class BanDomainTests(IndexTests):
    def test_001_add_bd_disable(self):
        Host(ip='127.0.0.1', user='admin', htype='unbound').save()
        self.client.post('/dforbidden/add', {'domain':'qq.com', 'status':'0'})
        rc = dns.query.udp(dns.message.make_query('qq.com', 'a'), '127.0.0.1').rcode()
        self.assertEqual(rc, 0)

    def test_002_add_bd_enable(self):
        Host(ip='127.0.0.1', user='admin', htype='unbound').save()
        self.client.post('/dforbidden/add', {'domain':'qq.com', 'status':'1'})
        rc = dns.query.udp(dns.message.make_query('qq.com', 'a'), '127.0.0.1').rcode()
        self.assertEqual(rc, 5)


class FowarDomainTests(IndexTests):
    def test_fowardomain(self):
        # 新增
        self.client.post('/dforward/add', {'domain':'google.com','server':'240c:f:1:22::103,240c:f:1:22::103','only':'1','status':'1'})
        response = self.client.get('/dforward/', follow=True)
        self.assertContains(response, 'google.com')
        self.assertEqual(os.stat('/tmp/gfw.zone')[6], 107)
        # 更新
        self.client.post('/dforward/1/update', {'id':1,'domain':'google.com','server':'8.8.8.8','only':'1','status':'1'})
        response = self.client.get('/dforward/', follow=True)
        self.assertContains(response, '8.8.8.8')
        # 删除
        response = self.client.get('/dforward/1/del', follow=True)
        self.assertNotContains(response, 'google.com')
        self.assertEqual(os.stat('/tmp/gfw.zone')[6], 0)


class LocalZoneTests(IndexTests):
    def test_localzone(self):
        # 务必初始化节点
        Host(ip='127.0.0.1', user='admin', htype='unbound').save()
        # 新增
        self.client.post('/dlocal/add', {'zone':'google.com','rtype':'refuse','status':'1'})
        rc = dns.query.udp(dns.message.make_query('google.com', 'a'), '127.0.0.1').rcode()
        self.assertEqual(rc, 5)
        response = self.client.get('/dlocal/', follow=True)
        self.assertContains(response, 'google.com')
        self.assertContains(response, 'refuse')
        self.assertContains(response, 'True')
        # 更新
        self.client.post('/dlocal/1/update', {'zone':'google.com','rtype':'refuse','status':'0'})
        rc = dns.query.udp(dns.message.make_query('google.com', 'a'), '127.0.0.1').rcode()
        self.assertEqual(rc, 0)
        # 删除
        response = self.client.get('/dlocal/1/del', follow=True)
        self.assertNotContains(response, 'google.com')
        rc = dns.query.udp(dns.message.make_query('google.com', 'a'), '127.0.0.1').rcode()
        self.assertEqual(rc, 0)


class LocalDataTests(IndexTests):
    def test_localdata(self):
        # 务必初始化节点
        Host(ip='127.0.0.1', user='admin', htype='unbound').save()
        # 新增
        m = dns.query.udp(dns.message.make_query('google.com', 'aaaa'), '127.0.0.1')
        rrset = m.answer[0]
        result1 = rrset.items[0].address
        self.client.post('/dlocaldata/add', {'domain':'google.com', 'rr':'AAAA', 'address':'240c:F:1:22::105'})
        m = dns.query.udp(dns.message.make_query('google.com', 'aaaa'), '127.0.0.1')
        rrset = m.answer[0]
        result2 = rrset.items[0].address
        print(result1, result2)
        self.assertNotEqual(result1, result2)
        self.assertEqual(result2, '240c:F:1:22::105'.lower())
        #更新
        self.client.post('/dlocaldata/1/update', {'domain':'google.com', 'rr':'A', 'address':'192.168.1.105'})
        m = dns.query.udp(dns.message.make_query('google.com', 'a'), '127.0.0.1')
        rrset = m.answer[0]
        result3 = rrset.items[0].address
        m = dns.query.udp(dns.message.make_query('google.com', 'aaaa'), '127.0.0.1')
        rrset = m.answer
        result4 = len(rrset)
        print(result3, result4)
        self.assertEquals(result3, '192.168.1.105')
        self.assertEqual(result4, 0)
        #删除
        self.client.get('/dlocaldata/1/del', follow=True)
        m = dns.query.udp(dns.message.make_query('google.com', 'a'), '127.0.0.1')
        rrset = m.answer[0]
        result5 = rrset.items[0].address
        self.assertNotEqual(result5, '192.168.1.105')




