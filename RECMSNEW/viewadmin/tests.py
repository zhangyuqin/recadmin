import subprocess

from django.test import TestCase
from django.test import Client
from django.contrib.auth.models import User


from .models import *
from .models import (CacheConfig, LinkType, Policy, Pool,
                    RuleTraffic, RuleView, Server, TopDomain)
# Create your tests here.
class LinkTypeTestCase(TestCase):
    def setUp(self):
        #create
        LinkType.objects.create(name='Tunnel')
        LinkType.objects.create(name='VPN')

    def test_link_type_crud(self):
        lt1 = LinkType.objects.get(pk=1)
        lt2 = LinkType.objects.get(pk=2)
        #read
        self.assertEqual(lt1.name, 'Tunnel')
        self.assertEqual(lt2.name, 'VPN')
        #update
        lt1.name = 'ModifiedTunnel'
        lt2.name = 'ModifiedVPN'
        lt1.save()
        lt2.save()
        self.assertEqual(lt1.name, 'ModifiedTunnel')
        self.assertEqual(lt2.name, 'ModifiedVPN')
        #delete
        lt1.delete()
        lt2.delete()
        self.assertEqual(len(LinkType.objects.all()), 0)


class PolicyTestCase(TestCase):
    def setUp(self):
        #create
        Policy.objects.create(name='Policy1')
        Policy.objects.create(name='Policy2')

    def test_policy_crud(self):
        p1 = Policy.objects.get(pk=1)
        p2 = Policy.objects.get(pk=2)
        #read
        self.assertEqual(p1.name, 'Policy1')
        self.assertEqual(p2.name, 'Policy2')
        #update
        p1.name = 'ModifiedPolicy1'
        p2.name = 'ModifiedPolicy2'
        p1.save()
        p2.save()
        self.assertEqual(p1.name, 'ModifiedPolicy1')
        self.assertEqual(p2.name, 'ModifiedPolicy2')
        #delete
        p1.delete()
        p2.delete()
        self.assertEqual(len(Policy.objects.all()), 0)


class CacheConfigTestCase(TestCase):
    def setUp(self):
        #create
        CacheConfig.objects.create(name='CacheConfig1')
        CacheConfig.objects.create(name='CacheConfig2')

    def test_policy_crud(self):
        cc1 = CacheConfig.objects.get(pk=1)
        cc2 = CacheConfig.objects.get(pk=2)
        #read
        self.assertEqual(cc1.name, 'CacheConfig1')
        self.assertEqual(cc2.name, 'CacheConfig2')
        #update
        cc1.name = 'ModifiedCacheConfig1'
        cc2.name = 'ModifiedCacheConfig2'
        cc1.save()
        cc2.save()
        self.assertEqual(cc1.name, 'ModifiedCacheConfig1')
        self.assertEqual(cc2.name, 'ModifiedCacheConfig2')
        #delete
        cc1.delete()
        cc2.delete()
        self.assertEqual(len(CacheConfig.objects.all()), 0)

class ServerTests(TestCase):
    def setUp(self):
        #每个测试用例执行前，设置执行环境
        self.client = Client()
        self.username = 'test'
        self.email = 'test@test.com'
        self.password = 'test'
        self.test_user = User.objects.create_user(self.username, self.email, self.password)
        login = self.client.login(username=self.username, password=self.password)
        self.assertEqual(login, True)

    def test_add_server(self):
        self.client.post('/viewadmin/server/add', {'name':'t323', 'address':'18.0.0.1', 'src_addr': "", 'isp': 1, 'weight':5, 'order':5, 'note':'t1', 'status':1})
        response = self.client.get('/viewadmin/server/')
        #print(response, response.content)
        self.assertContains(response, "t323")
        self.assertContains(response, "18.0.0.1")
        # todo 测试所有dns节点未ACL
        cmd = "dnsdist -c -e 'showServers()'"
        servers = subprocess.check_output(cmd, universal_newlines=True, shell=True)
        self.assertTrue('18.0.0.1' in servers)

    def test_add_duplicate_server(self):
        self.client.post('/viewadmin/server/add', {'name':'t323', 'address':'19.0.0.1', 'src_addr': "", 'isp': 2, 'weight':5, 'order':5, 'note':'t1', 'status':1})
        self.client.post('/viewadmin/server/add', {'name':'t323', 'address':'20.0.0.1', 'src_addr': "", 'isp': 2, 'weight':5, 'order':5, 'note':'t1', 'status':1})
        response = self.client.get('/viewadmin/server/')
        #print(response, response.content)
        self.assertContains(response, "t323")
        self.assertNotContains(response, "20.0.0.1")
        # todo 测试所有dns节点未ACL
        cmd = "dnsdist -c -e 'showServers()'"
        servers = subprocess.check_output(cmd, universal_newlines=True, shell=True)
        self.assertTrue('20.0.0.1' not in servers)

