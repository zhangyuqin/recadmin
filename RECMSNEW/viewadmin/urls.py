from django.conf.urls import url
from . import views


app_name = 'viewadmin'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^index/$', views.index, name='index'),
    url(r'(?P<recipient>^.+)/add$', views.add, name='add'),
    #url(r'(?P<recipient>^.+)/impt$', views.impt, name='impt'),
    url(r'^(?P<recipient>.+)/(?P<id>\d+)/del$', views.delete, name='del'),
    url(r'^(?P<recipient>.+)/(?P<id>\d+)/update$', views.update, name='update'),
    #url(r'^(?P<recipient>.+)/(?P<id>\d+)/operate$', views.operate, name='operate'),

    # 操作多个
    url(r'(?P<recipient>.+)/delmulti/$', views.delete_multi, name='delmulti'),
    url(r'(?P<recipient>.+)/operatemulti/$', views.operate_multi, name='operatemulti'),

    url(r'(?P<href>^.+)/$', views.show, name='show'), # 使其优先级最低
]
   
