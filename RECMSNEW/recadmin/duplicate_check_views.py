import re
import ipaddress
from django.http import JsonResponse
from .models import ACL, FowarDomain, SecurityDomain, LocalZone, LocalData

RECIPIENT = {
    'acl'            :  ('acl', ACL),
    'forwardzone'    :  ('domain', FowarDomain),
    'securityzone'   :  ('domain', SecurityDomain),
    'localzone'      :  ('zone', LocalZone),
    'localdata'      :  ('domain', LocalData),
}

def _check_ip_valid(itc):
    try:
        if ipaddress.ip_network(itc):
            return True
    except ValueError:
        return False

def _check_domain_valid(itc):
    if re.fullmatch(r'[_a-zA-Z\d-]{1,63}(\.[_a-zA-Z\d-]{2,63})*\.?', itc):
        return True
    return False

def check_duplicate(request, recipient):
    if recipient == 'acl':
        item_to_check = request.GET.get('acl', None)
        d = {'acl__iexact':item_to_check}
        data = {
            'is_taken': ACL.objects.filter(**d).exists(),
            'is_valid': _check_ip_valid(item_to_check),
        }
    elif recipient == 'forwardzone':
        domain_to_check = request.GET.get('domain', None)
        server_to_check = request.GET.get('server', None)
        if domain_to_check:
            d = {'domain__iexact':domain_to_check}
            data = {
                'is_taken': FowarDomain.objects.filter(**d).exists(),
                'is_valid': _check_domain_valid(domain_to_check),
            }
        if server_to_check:
            if server_to_check.find(',')+1:
                for stc in server_to_check.split(','):
                    is_valid = (True and _check_ip_valid(stc))
                data = {'is_valid': is_valid}
            else:
                data = {'is_valid': _check_ip_valid(server_to_check)}
    elif recipient in ['securityzone', 'banzone']:
        item_to_check = request.GET.get('domain', None)
        d = {'domain__iexact':item_to_check}
        data = {
            'is_taken': RECIPIENT[recipient][1].objects.filter(**d).exists(),
            'is_valid': _check_domain_valid(item_to_check),
        }
    elif recipient == 'localzone':
        item_to_check = request.GET.get('zone', None)
        d = {'zone__iexact':item_to_check}
        data = {
            'is_taken': LocalZone.objects.filter(**d).exists(),
            'is_valid': _check_domain_valid(item_to_check),
        }
    elif recipient == 'localdata':
        domain_to_check = request.GET.get('domain', None)
        address_to_check = request.GET.get('address', None)
        if domain_to_check:
            d = {'domain__iexact':domain_to_check}
            data = {
                'is_taken': LocalData.objects.filter(**d).exists(),
                'is_valid': _check_domain_valid(domain_to_check),
            }
        if address_to_check:
            d = {'address__iexact':address_to_check}
            data = {
                'is_taken': LocalData.objects.filter(**d).exists(),
                'is_valid': _check_ip_valid(address_to_check),
            }
    return JsonResponse(data)