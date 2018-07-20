"""
    cache management
"""

import subprocess

# cache lookup
def lookup_domain(server, domain, qtype):
    cmd = "dig @{server} {qname} {qtype}".format(server=server, qname=domain, qtype=qtype)
    return subprocess.check_output(cmd, universal_newlines=True, shell=True)

# delete cache
def del_cache(server, domain=None, qtype=None, zone=None):
    if qtype is None and zone is None:
        cmd = "unbound-control flush {qname}".format(qname=domain)
    elif zone is None and domain and qtype:
        cmd = "unbound-control flush_type {qname} {qtype}".format(qname=domain, qtype=qtype)
    elif zone and not qtype and not domain:
        cmd = "unbound-control flush_zone {zone}".format(zone=zone)
    else:
        return "error arguments!!! ({0},{1},{2})".format(domain, qtype, zone)

    print(cmd)
    return subprocess.check_output(cmd, universal_newlines=True, shell=True)


if __name__ == "__main__":
    import sys
    #print(lookup_domain(sys.argv[1], sys.argv[2], sys.argv[3]))
    del_cache(sys.argv[1], sys.argv[2], sys.argv[3])
