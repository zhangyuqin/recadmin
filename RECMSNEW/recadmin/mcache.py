"""
    cache managment for dnsdist and unbound

    1. flush all of name(A,AAAA,NS...)
    2. flush some type of name(A|AAA|...)
    3. flush the zone

    two models:
      A. unbound only: clear unbound cache
      B. dnsdist + unbound: clear dnsdist and unbound cache
"""

import subprocess
from viewadmin.models import Server
from .models import Master
from .remote import delname, delzone

def _dns_model():
    """ return dns deployment model, return 'unbound' or 'dnsdist' """
    masters = Master.objects.all()
    for m in masters:
        if m.dtype == "dnsdist":
            return 'dnsdist'

    # unbound only
    return 'unbound'

def _remove_unbound_cache(hosts, action, **kargs):
    cmd = {'name': 'flush {name}'.format(name=kargs.get('name')),
           'qtype': 'flush_name {name} {qtype}'.format(
               name=kargs.get('name'), qtype=kargs.get('qtype')),
           'zone': 'flush_zone {zone}'.format(zone=kargs.get('zone'))
          }

    for host in hosts:
        ctrl_cmd = 'unbound-control -c {conf} {cmd}'.format(
            conf='unboundrc.log', cmd=cmd[action])
        print(ctrl_cmd)
        subprocess.call(ctrl_cmd, universal_newlines=True, stdout=None, shell=True)

def _remove_dnsdist_cache(hosts, action, **kargs):
    cmd = {'name': 'getPool("test"):getCache():expungeByName({name})'.format(
        name=kargs.get('name')),
           'qtype': 'getPool("test"):getCache():expungeByName({name},qtype={qtype})'.format(
               name=kargs.get('name'), qtype=kargs.get('qtype')),
           'zone': 'getPool("test"):getCache():expungeByName({name})'.format(name=kargs.get('name'))
          }

    for host in hosts:
        ctrl_cmd = 'dnsdist -C {conf} -c -e \'{cmd}\''.format(
            conf='unboundrc.log', cmd=cmd[action])
        print(ctrl_cmd)
        subprocess.call(ctrl_cmd, universal_newlines=True, stdout=None, shell=True)

def remove_cache1(action, **kargs):
    """ remove cache from dnsdist or unbound """
    # got dns modle
    dmodel = _dns_model()
    if dmodel == 'dnsdist':
        # find all nodes
        dists = Server.objects.all()
        unbounds = Server.objects.all()

        # clear all dnsdist and unbound nodes cache
        _remove_unbound_cache(unbounds, action, **kargs)
        _remove_dnsdist_cache(dists, action, **kargs)
    elif dmodel == 'unbound':
        unbounds = Server.objects.all()
        # clear all unbound nodes cache
    else:
        pass

def remove_cache(action, **kargs):
    """ remove cache from dnsdist or unbound """
    cmd = {'name': { 'func': delname, 'arg':kargs.get('qname') },
           'qtype': { 'func': delname, 'arg':kargs.get('qname') },
           'zone': { 'func': delzone, 'arg':kargs.get('zone') },
          }

    func = cmd[action]['func']
    arg = cmd[action]['arg']
    print(func, arg)
    func(arg)
    

def _test():
    hosts = []

    _remove_dnsdist_cache(hosts, 'name', name='baidu.com')
    _remove_dnsdist_cache(hosts, 'zone', zone='zone.com')
    _remove_dnsdist_cache(hosts, 'qtype', name='zone.com', qtype='A')

    _remove_unbound_cache(hosts, 'name', name='baidu.com')
    _remove_unbound_cache(hosts, 'zone', zone='baidu.com')
    _remove_unbound_cache(hosts, 'qtype', name='zone.com', qtype='A')

if __name__ == "__main__":
    _test()
