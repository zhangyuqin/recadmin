from recadmin.remote import run_dnsagentc as dnsagentc

def addserver(name, address, weight=1, order=1, src=""):
    cmd = 'dnsagentc -cmd addserver -name {0} -address {1} -weight {2} -order {3}'
    if src:
        cmd += ' -src {4}'
        cmd = cmd.format(name, address, weight, order, src)
    else:
        cmd = cmd.format(name, address, weight, order)

    return dnsagentc(cmd)

def delserver(name):
    cmd = 'dnsagentc -cmd delserver -name {name}'.format(name=name)
    return dnsagentc(cmd)

def updateserver(oldname, newname, weight=1, order=1,src=""):
    cmd = 'dnsagentc -cmd updateserver -name {0} -newname {1} -weight {2} -order {3}'
    if src:
        cmd += ' -src {4}'
        cmd = cmd.format(oldname, newname, weight, order, src)
    else:
        cmd = cmd.format(oldname, newname, weight, order)
    return dnsagentc(cmd)

def addcache(name, entries, maxttl=86400, minttl=0, servfail=60, stale=60, keepttl=False):
    cmd = 'dnsagentc -cmd addcache -name {0} -entries {1} -maxttl {2} -minttl {3} '
    cmd += '-servfail {4} -stale {5} -keepttl {6} '
    string_bool= {1: 'true', 0: 'false' }
    cmd = cmd.format(name, entries, maxttl, minttl, servfail, stale, string_bool[keepttl])
    return dnsagentc(cmd)

def updatecache(name, entries, maxttl=86400, minttl=0, servfail=60, stale=60, keepttl=False,oldname=''):

    cmd0 = 'dnsagentc -cmd delcache -name {0}'.format(oldname)
    dnsagentc(cmd0)
    cmd = 'dnsagentc -cmd addcache -name {0} -entries {1} -maxttl {2} -minttl {3} '
    cmd += '-servfail {4} -stale {5} -keepttl {6} '
    string_bool= {1: 'true', 0: 'false' }
    cmd = cmd.format(name, entries, maxttl, minttl, servfail, stale, string_bool[keepttl])
    return dnsagentc(cmd)

def delcache(name):
    cmd = 'dnsagentc -cmd delcache -name {name} '
    cmd = cmd.format(name=name)
    return dnsagentc(cmd)

def addpool(name, servers, policy="", cache=""):
    cmd = 'dnsagentc -cmd addpool -name {0} -servers {1} -policy {2} -cache {3}' 
    cmd = cmd.format(name, servers, policy, cache)
    return dnsagentc(cmd)

def delpool(name):
    cmd = 'dnsagentc -cmd delpool -name {0}'.format(name)
    return dnsagentc(cmd)

def updatepool(name, servers, policy="", cache=""):
    cmd = 'dnsagentc -cmd delpool -name {0}'.format(name)
    dnsagentc(cmd)
    cmd = 'dnsagentc -cmd addpool -name {0} -servers {1} -policy {2} -cache {3}'
    cmd = cmd.format(name, servers, policy, cache)
    return dnsagentc(cmd)

def addruleview(acls, pool):
    cmd = 'dnsagentc -cmd addruleview -netlst {0} -pool {1}'
    cmd = cmd.format(acls, pool)
    return dnsagentc(cmd)

def delruleview(acls, pool):
    cmd = 'dnsagentc -cmd delruleview -netlst {0} -pool {1}'
    cmd = cmd.format(acls, pool)
    return dnsagentc(cmd)

def addruletraffic(acls, domains, pool):
    cmd = 'dnsagentc -cmd addruletraffic -netlst {0} -domainlst {1} -pool {2}'
    cmd = cmd.format(acls, domains, pool)
    return dnsagentc(cmd)

def delruletraffic(acls, domains, pool):
    cmd = 'dnsagentc -cmd delruletraffic -netlst {0} -domainlst {1} -pool {2}'
    cmd = cmd.format(acls, domains, pool)
    return dnsagentc(cmd)

def mvrule(oldorder, neworder):
    cmd = 'dnsagentc -cmd mvrule -order {0} -neworder {1}'
    cmd = cmd.format(oldorder, neworder)
    return dnsagentc(cmd)

