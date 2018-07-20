from django.conf.urls import url
from .views import CRUD
from . import views
from .duplicate_check_views import check_duplicate

app_name = 'recadmin'

urlpatterns = [
    url(r'^check/(?P<recipient>.+)/$', check_duplicate, name='check_duplicate'),
    url(r'^$', CRUD.index, name='index'),
    url(r'^help/$', views.help, name='help'),
    url(r'^sync/$', views.sync, name='sync'),
    url(r'^history/$', views.history_qname, name='history'),
    url(r'^cache/$', views.cache_op, name='cache'),
    url(r'^reg/$', views.reg, name='reg'),
    url(r'^login/$', views.my_login, name='login'),
    url(r'^logout/$', views.my_logout, name='logout'),
    url(r'^status/$', views.dns_status, name='status'),
    url(r'^stats/$', views.dns_stats, name='stats'),
    url(r'^status_new/$', views.dns_status_new, name='status_new'),
    url(r'^stats_new/$', views.dns_stats_new, name='stats_new'),
    url(r'^genconf/', CRUD.genconf, name='genconf'),
    url(r'^df/$', views.df, name='df'),#####测试页面，不对外服务，不维护
    url(r'(?P<recipient>^.+)/(?P<id>\d+)/$', CRUD.detail, name='detail'),
    url(r'(?P<recipient>^.+)/add$', CRUD.add, name='add'),
    # url(r'(?P<recipient>^.+)/update$', CRUD.update, name='update'),
    url(r'(?P<recipient>^.+)/impt$', CRUD.impt, name='impt'),
    url(r'^(?P<recipient>.+)/(?P<id>\d+)/del$', CRUD.delete, name='del'),
    url(r'^(?P<recipient>.+)/(?P<id>\d+)/update$', CRUD.update, name='update'),
    url(r'^(?P<recipient>.+)/(?P<id>\d+)/operate$', CRUD.operate, name='operate'),

     # 操作多个
    url(r'(?P<recipient>.+)/delmulti/$', CRUD.delete_multi, name='delmulti'),
    url(r'(?P<recipient>.+)/operatemulti/$', CRUD.operate_multi, name='operatemulti'),

   

    url(r'(?P<href>^.+)/$', views.show, name='show'), # 使其优先级最低

]
   
