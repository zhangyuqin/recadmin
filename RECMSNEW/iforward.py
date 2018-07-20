from os import environ as env
import sys

if not 'DJANGO_SETTINGS_MODULE' in env:
    from recms import settings
    env.setdefault('DJANGO_SETTINGS_MODULE', settings.__name__)

import django
django.setup()


def read_forward_zone(forward_zone_conf_file):
    """reads forward zone conf file to a dict consist of some lists"""

    import re

    forward_zone_conf = {'forward-zone': []}
    d = {}
    lines = open(forward_zone_conf_file).read().split('\n')
    lines.reverse()
    for line in lines:

        if re.search(r'forward-first', line):
            d['forward-first']='yes'
            continue

        match_addr = re.match(r'\s+forward-addr:\s+(.+)', line)
        if match_addr:
            if 'forward-addr' in d:
                d['forward-addr'].append(match_addr.group(1))
            else:
                d['forward-addr'] = []
                d['forward-addr'].append(match_addr.group(1))
            continue

        match_name = re.match(r'\s+name:\s+"(.+)"', line)
        if match_name:
            d['name'] = match_name.group(1)
            continue

        match_zone = re.match(r'forward-zone:', line)
        if match_zone:
            forward_zone_conf['forward-zone'].append(d)
            d = {}


    return forward_zone_conf

from recadmin.models import FowarDomain

def main(recname):
    querysetlist = []
    fzone = '/home/unbound/usr/local/etc/unbound/{0}.zone'.format(recname)
    forward_zone_conf = read_forward_zone(fzone)
    for fd in forward_zone_conf['forward-zone']:
        if len(fd['forward-addr']) == 1:
            querysetlist.append(FowarDomain(domain=fd['name'],
                                server=fd['forward-addr'][0], 
                                only=1, status=1))
        else:
            querysetlist.append(FowarDomain(domain=fd['name'],
                                server=','.join(fd['forward-addr']),
                                only=1, status=1))

    FowarDomain.objects.all().delete()
    FowarDomain.objects.bulk_create(querysetlist)

if __name__ == "__main__":
    from django.conf import settings
    if len(sys.argv) == 1:
        print('usage: {0} recname'.format(sys.argv[0]))
        sys.exit(1)
    main(sys.argv[1])
