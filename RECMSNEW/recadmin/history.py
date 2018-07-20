from django.core.exceptions import ObjectDoesNotExist
from psql.models import Qname,Query,Server,Client
import time

def lookup_qname(qname, start=None, end=None):
    # search qname id
    try:
        qnameid = Qname.objects.using('dns').get(qname=qname).id
        if start is None or end is None:
            end = int(time.time())
            # last 5 minutes
            start = end - 5*60

        # search Query
        reqs = Query.objects.using('dns').filter(qnameid__exact=qnameid, timestamp__gte=start, timestamp__lte=end)
        return reqs
    except ObjectDoesNotExist:
        return Query.objects.using('dns').none()

def lookup_qname_fuzz(qname, start=None, end=None):
    try:
        qnames = Qname.objects.using('dns').filter(qname__endswith=qname)
        qnameids = [q.id for q in qnames]
        if start is None or end is None:
            end = int(time.time())
            # last 5 minutes
            start = end - 5*60

        # search Query
        reqs = Query.objects.using('dns').filter(qnameid__in=qnameids, timestamp__gte=start, timestamp__lte=end)
        return reqs
    except ObjectDoesNotExist:
        return Query.objects.using('dns').none()

def lookup_client(client, start=None, end=None):
    # search client id
    try:
        clientid = Client.objects.using('dns').get(client=client).id
        if start is None or end is None:
            end = int(time.time())
            # last 5 minutes
            start = end - 5*60

        # search Query
        reqs = Query.objects.using('dns').filter(clientid__exact=clientid, timestamp__gte=start, timestamp__lte=end)
        return reqs

    except ObjectDoesNotExist:
        return Query.objects.using('dns').none()

FUZZ_SEARCH = {
    False: lookup_qname,
    True: lookup_qname_fuzz,
}
