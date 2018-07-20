from django.contrib import admin
from .models import (CacheConfig, Policy, Pool,
                    RuleTraffic, RuleView, Server, TopDomain)

# Register your models here.
admin.site.register(CacheConfig)
admin.site.register(Policy)
admin.site.register(Pool)
admin.site.register(RuleTraffic)
admin.site.register(RuleView)
admin.site.register(Server)
admin.site.register(TopDomain)
