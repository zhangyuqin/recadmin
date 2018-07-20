from os import environ as env
import sys

if not 'DJANGO_SETTINGS_MODULE' in env:
    from recms import settings
    env.setdefault('DJANGO_SETTINGS_MODULE', settings.__name__)

import django
django.setup()

from recadmin.models import SecurityDomain

def main(secfile):
    with open(secfile) as f:
        security_list = f.read().split('\n')
        f.close()

    querysetlist = []
    for secdomain in security_list:
        if secdomain == '' or secdomain[0] == '#':
            continue
        else:
            querysetlist.append(SecurityDomain(domain=secdomain, status=1))

    SecurityDomain.objects.all().delete()
    SecurityDomain.objects.bulk_create(querysetlist)

if __name__ == "__main__":
    from django.conf import settings
    if len(sys.argv) == 1:
        print('usage: {0} domain_list_file'.format(sys.argv[0]))
        sys.exit(1)
    main(sys.argv[1])
