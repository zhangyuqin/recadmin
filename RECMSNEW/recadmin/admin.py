from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(ACL)
admin.site.register(FowarDomain)
admin.site.register(SecurityDomain)
admin.site.register(LocalZone)
admin.site.register(LocalData)
admin.site.register(SecDomainACL)
admin.site.register(DomainGroup)
