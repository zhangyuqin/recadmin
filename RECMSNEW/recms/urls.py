"""recms URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
#from rest_framework_jwt.views import obtain_jwt_token#jwt token行后续升级可参考使用
from rest_framework.authtoken.views import obtain_auth_token
from django.contrib import admin
from recadmin import viewsets
from viewadmin import viewsets as vavs
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'forward_domain', viewsets.FowarDomainViewSet)
router.register(r'acl', viewsets.ACLViewSet)
router.register(r'local_zone',viewsets.LocalZoneViewSet)
router.register(r'local_data',viewsets.LocalDataViewSet)

router.register(r'security_domain',viewsets.SecurityDomainViewSet)
router.register(r'domain_group',viewsets.DomainGroupViewSet)
router.register(r'security_domain_acl',viewsets.SecDomainACLViewSet)
router.register(r'server_profile',viewsets.ServerProfileViewSet)
###test
router.register(r'test',viewsets.TestViewSet)
###

router.register(r'server',vavs.ServerViewSet)
router.register(r'cache_config',vavs.CacheConfigViewSet)
router.register(r'pool',vavs.PoolViewSet)
router.register(r'rule_view',vavs.RuleViewViewSet)#DNS视图是流量调度域名为空时的情况
router.register(r'top_domain',vavs.TopDomainViewSet)
router.register(r'rule_traffic',vavs.RuleTrafficViewSet)

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^recadmin/', include('recadmin.urls')),
    url(r'^viewadmin/', include('viewadmin.urls')),
    url(r'^api-token-auth/', obtain_auth_token),#不支持GET，支持POST提交用户密码返回token值
    url(r'^api/v1/', include(router.urls)),
    #url(r'^', include('domainms.urls')),
    url(r'^', include('recadmin.urls')),
]
