# coding: utf-8

""" wrap dnsdist functions

  wrap function to configure dnsdist.
  include ACL, forward zone, banzone, spoof zone
  and speed limit
  and view, backend servers managment
  and topn items lookup
"""
import os,django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recms.settings")
django.setup()
import subprocess
import json
import requests
from viewadmin.models import Server
import socket

def run_dnsdist_client(cmd, conf="/etc/dnsdist/dnsdist.conf"):
    """ exec dnsdist via command line

    dnsdist -c /path/to/dnsdist.conf -e "showServers()"
    dnsdist -c /path/to/dnsdist.conf -e "showACL()"
    dnsdist -c /path/to/dnsdist.conf -e "addACL("192.168.10.0/24")"
    """
    origin_cmd = "dnsdist -c -C {conf} -e \"{cmd}\""
    last_cmd = origin_cmd.format(conf=conf, cmd=cmd)
    #print(last_cmd)
    #return subprocess.call(last_cmd, universal_newlines=True, stdout=None, shell=True)
    return subprocess.check_output(last_cmd, universal_newlines=True, shell=True)

def top_users(n=10):
    """ top n users """
    return _top_client(n, "topClients({n})")

def top_queries(n=10):
    """ top n domain names """
    return _top_client(n, "topQueries({n})")

def top_servfail(n=10):
    """ top n SERVAIL domain names """
    return _top_client(n, "topResponses({n}, 2)")

def top_nxdomain(n=10):
    """ top n NXDOMAIN domain names """
    return _top_client(n, "topResponses({n}, 3)")

def _top_client(n, cmd):
    ret = run_dnsdist_client(cmd.format(n=n))
    topn_users = ret.split('\n')
    clients = []

    for i in topn_users[:-2]:
        # ignor the last two lines
        line = i.split()
        if line[0] in [str(i) for i in range(1,11)]:
            clients.append(line[1])
    return clients

def status_new(n=10):
    cmd_all = ['topClients({n})','topQueries({n})','topResponses({n}, 2)','topResponses({n}, 3)']
    """ get top n client from dnsdist

   dnsdist format:
       1  240c:f:1:4000:395b:91c8:a585:ef10        4836 48.4%
       2  172.16.120.111                           2938 29.4%
       3  192.168.0.212                            2226 22.3%
       4  Rest                                        0  0.0%
    output:
       240c:f:1:4000:395b:91c8:a585:ef10
       172.16.120.111
       192.168.0.212
    """
    origin_cmd = "dnsdist -c -C {conf} -e \"{cmd}\""
    conf = "/tmp/tempfile"
    host_info = Server.objects.filter(status=1).filter(dtype__in=['dist_unbound', 'dnsdist']).values('id', 'name',
                                                                                                     'address')
    cl = []
    for j in host_info:
        h = j['address']
        k = 'MXNeLFWHUe4363BBKrY06cAsH8NWNb+Se2eXU5+Bb74='
        with open(conf,'w') as f:
            f.write('controlSocket("{host}")'.format(host=h))
            f.write('setKey("{key}")'.format(key=k))
        mid = {}
        for cmd in cmd_all:
            last_cmd = origin_cmd.format(conf=conf, cmd=cmd.format(n=n))
            # return subprocess.call(last_cmd, universal_newlines=True, stdout=None, shell=True)
            ret = subprocess.check_output(last_cmd, universal_newlines=True, shell=True)
            topn_users = ret.split('\n')
            clients = []
            for i in topn_users[:-2]:
                # ignor the last two lines
                line = i.split()
                if line[0] in [str(i) for i in range(1,11)]:
                    clients.append(line[1])
            mid.update({cmd.format(n=n):clients})
        cl.append({'node':j['name'],'content':mid})
    #print(cl)
    return cl

def status(n=10):
    """ return dnsdist top n information
        output:
         {'client':[], 'domain':[], 'servfail':[], 'nxdomain':[]}
    """

    return {'client': top_users(n), 'domain': top_queries(n),
            'servfail': top_servfail(n), 'nxdomain': top_nxdomain(n)}

def stats():
    """ dnsdist status """
    url1 = 'http://127.0.0.1:8083/jsonstat?command=stats'
    headers = {'Authorization': 'Basic UG93ZXJETlM6Z2VoZWltMg=='}
    r1 = requests.get(url1, headers=headers)
    h = json.loads(r1.text)
    return h

def stats_new():
    """ dnsdist status """
    host_info = Server.objects.filter(status=1).filter(dtype__in=['dist_unbound','dnsdist']).values('id','name','address')
    r_all = []
    url1 = 'http://127.0.0.1:8083/jsonstat?command=stats'
    headers = {'Authorization': 'Basic UG93ZXJETlM6Z2VoZWltMg=='}
    if len(host_info) == 0:
        try:
            r1 = requests.get(url1, headers=headers)
        except Exception as e:
            return r_all
        h = json.loads(r1.text)
        h.update({'hostname':socket.gethostname()})
        r_all.append(h)
    else:
        for i in host_info:
            url1 = 'http://{0}:8083/jsonstat?command=stats'.format(i['address'])
            try:
                r1 = requests.get(url1, headers=headers)
            except Exception as e:
                continue
            h = json.loads(r1.text)
            h.update({'hostname':i['name']})
            r_all.append(h)
    return r_all

def _test():
    run_dnsdist_client("showACL()")
    #cmd = "addACL('{acl}')".format(acl="192.168.11.0/24")
    cmd = "setACL({acl})".format(acl="{'192.168.0.0/24', '240c::/28'}")
    #print run_dnsdist_client(cmd)

    ret = run_dnsdist_client("topClients(2)")
    #print(ret)
    ret = run_dnsdist_client("topQueries(2)")
    #print(ret)
    #ret = run_dnsdist_client("topResponses(10)")
    #if ret.startswith("Error:"):
    #    print("error")

    #newserv = "newServer('172.16.120.107:5454')"
    #newserv = "newServer({address='172.16.120.109:5454', pool='test'})"
    #ret = run_dnsdist_client(newserv)
    #print(ret)
    #print(run_dnsdist_client("showServers()"))

    #pools = "addAction({'bad-domain1.example', 'bad-domain2.example'}, PoolAction('test'))"
    #pools = "addAction({'192.168.5.1/24', '192.168.6.0/24'}, PoolAction('test'))"
    #pools = "addAction({'192.168.5.1/24', '192.168.6.0/24'}, PoolAction('test'))"
    #pools = "addPoolRule({'192.168.12.0/24', '192.168.13.14'}, 'test')"
    #pools = "addPoolRule({'www.baidu.com', 'www.ietf.org'}, 'test')"
    #run_dnsdist_client(pools)

    ret = run_dnsdist_client("showRules()")
    #print ret

    # cache
    #cmd = "pc1 = newPacketCache(10000, 86400, 0, 60, 60, false)"
    #run_dnsdist_client(cmd)
    #cmd = "getPool('test'):setCache(pc1)"
    #run_dnsdist_client(cmd)
    # remove all caches
    #cmd = "getPool('test'):getCache():purgeExpired(0)"
    #run_dnsdist_client(cmd)
    # remove special domain
    #cmd = "getPool('test'):getCache():expungeByName(newDNSName('powerdns.com'), dnsdist.A)"
    #run_dnsdist_client(cmd)

if __name__ == "__main__":
    pass
