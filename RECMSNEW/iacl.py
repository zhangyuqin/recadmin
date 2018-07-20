from os import environ as env
import sys
import subprocess

if not 'DJANGO_SETTINGS_MODULE' in env:
    from recms import settings
    env.setdefault('DJANGO_SETTINGS_MODULE', settings.__name__)

import django
django.setup()
from recadmin.models import ACL

def iacl(name, acl, status):
    newobj = ACL()
    newobj.name = name
    newobj.acl = acl
    newobj.status = status
    newobj.save()

def main(cmd):
    ret = subprocess.check_output(cmd, universal_newlines=True, shell=True)
    acls = ret.split('\n')
    for net in acls[:-2]:
        iacl(net, net, 1)

if  __name__ == "__main__":
    from django.conf import settings
    main('dnsagentc -cmd showacl')
