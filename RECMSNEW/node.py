from os import environ as env

if not 'DJANGO_SETTINGS_MODULE' in env:
    from recms import settings
    env.setdefault('DJANGO_SETTINGS_MODULE', settings.__name__)

import django
django.setup()

from recadmin.models import Host

def main():
    Host.objects.all().delete()
    h = Host(ip="::1", hostname="ubound1", user="root", ctrl_conf="u1.conf", htype="unbound")
    h.save()

if  __name__ == "__main__":
    from django.conf import settings
    main()
