""" exec remote operations on all dns nodes
    addacl, delacl
    delname, delzone
    sync domain information
"""

import subprocess
from viewadmin.models import Pool,Server
from functools import reduce
from recms.settings import BASE_DIR
from recadmin.config.unbound import dict_merge
extra_settings = BASE_DIR+'/remote/pool_setting.sh'

def run_dnsagentc(cmd):
    return subprocess.check_output(cmd, universal_newlines=True, shell=True)

def showacl():
    cmd = 'dnsagentc -cmd showacl'
    return run_dnsagentc(cmd)

def add_domain_acl(acl, domains):
    cmd = 'dnsagentc -cmd adddomainacl -net {net} -domainlst {domains}'
    cmd = cmd.format(net=acl, domains=','.join(domains))
    return run_dnsagentc(cmd)

def del_domain_acl(acl, domains):
    cmd = 'dnsagentc -cmd deldomainacl -net {net} -domainlst {domains}'
    cmd = cmd.format(net=acl, domains=','.join(domains))
    return run_dnsagentc(cmd)

def dgroup_add_domain(acls, domains):
    # attach security domains to domain group
    cmd = 'dnsagentc -cmd dgroupadddomain -netlst {nets} -domainlst {domains}'
    cmd = cmd.format(nets=','.join(acls), domains=','.join(domains))
    return run_dnsagentc(cmd)

def dgroup_del_domain(acls, domains):
    # delete security domains
    cmd = 'dnsagentc -cmd dgroupdeldomain -netlst {nets} -domainlst {domains}'
    cmd = cmd.format(nets=','.join(acls), domains=','.join(domains))
    return run_dnsagentc(cmd)

def del_dgroup(acls, domains):
    # 在所有acl中删除domains
    ret = dgroup_del_domain(acls, domains)
    return ret

def addacl(acl):
    cmd = 'dnsagentc -cmd addacl -net {net}'.format(net=acl)
    return run_dnsagentc(cmd)

def delacl(acl):
    cmd = 'dnsagentc -cmd delacl -net {net}'.format(net=acl)
    return run_dnsagentc(cmd)

def delzone(zone):
    cmd = 'dnsagentc -cmd delzone -domain {zone}'.format(zone=zone)
    return run_dnsagentc(cmd)

def delname(domain):
    cmd = 'dnsagentc -cmd delname -domain {domain}'.format(domain=domain)
    return run_dnsagentc(cmd)

def sync():

    h = Server.objects.filter(dtype='dist_unbound').values('address','pool')

    unbound_servers = [{Pool.objects.get(pk=i['pool']).name:[i['address'],]} for i in h if i['pool'] != None]
    if unbound_servers:
        ret = reduce(dict_merge,unbound_servers)
        conf = ''
        for i in ret.keys():
            p = "[{0}]".format(i)+'='+'"{0}"'.format(' '.join(ret[i]))+' '
            conf+=p
        with open(extra_settings,'w+') as n:
            n.write('#!/usr/bin/env bash\n')
            n.write('declare -A dic\n')
            n.write("dic=({0})".format(conf))

    cmd = 'dnsagentc -cmd sync'
    return run_dnsagentc(cmd)

def  _test():
    return run_dnsagentc('/usr/local/bin/dnsagentc -cmd showacl')

if __name__ == "__main__":
    print(_test())

