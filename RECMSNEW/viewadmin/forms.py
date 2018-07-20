import re
import ipaddress
from django import forms
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, _lazy_re_compile
from django.utils.translation import ugettext_lazy as _
from django.db.utils import OperationalError

from django.db import models
from django.forms import ModelForm 

from .models import  Server, Pool, Policy, CacheConfig, TopDomain

FIELD_MAP_MODEL = {
        'servers': (Server,'mm'),
        'poolrt': (Pool,'mo'),
        'policy': (Policy,'mo'),
        'qname': (TopDomain,'mo'),
        'cache': (CacheConfig,'oo'),
        'pool': (Pool,'mo'),
    }

def _get_choices(field):

    try:
        if FIELD_MAP_MODEL[field][1] == 'mo':
            # 多对一
            objs = FIELD_MAP_MODEL[field][0].objects.all()
        elif FIELD_MAP_MODEL[field][1] == 'mm':
            # 多对多
            if field != 'servers':
                objs = FIELD_MAP_MODEL[field][0].objects.all()
            else:
                objs = FIELD_MAP_MODEL[field][0].objects.filter(status=True)
        else:
            # 一对一
            objs = []
            cc = CacheConfig.objects.all()
            for c in cc:
                if not hasattr(c, 'pool'):
                    objs.append(c)
        return [(obj.id, obj.name) for obj in objs]
    except OperationalError:
        return [(None, None)]
    
_no_space_validator = RegexValidator(regex='^\S+$')

domain_regex = _lazy_re_compile(
    r'((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+)(?:[A-Z0-9-]{2,63}(?<!-))\Z',
    re.IGNORECASE)
_domain_validator = RegexValidator(regex=domain_regex)

def _acl_validator(value):
    for v in value.split(','):
        try:
            ipaddress.ip_network(v)
        except ValueError:
            raise ValidationError(_(v+' is invalid ipaddress,Enter a valid IPv4 or IPv6 address.'), code='invalid')


v_name = forms.CharField(label='name', max_length=20, validators=[_no_space_validator]) #中间不能为空
v_source = forms.CharField(label='source', max_length=20)
v_acl = forms.CharField(label='acl', max_length=215, validators=[_no_space_validator,_acl_validator])
v_domain = forms.CharField(label='domain', max_length=255, validators=[_no_space_validator,_domain_validator])
v_note = forms.CharField(label='note', max_length=20)

# IP地址
v_address = forms.GenericIPAddressField(label='address')
v_distaddress = forms.GenericIPAddressField(label='distaddress')
v_src_addr = forms.GenericIPAddressField(label='src_addr', required=False)

# CSV，每一个值是正整数(外键ID，多对多)
v_servers = forms.MultipleChoiceField(label='servers', choices=_get_choices('servers'))
# 外键ID，多对一，一对一
v_policy = forms.ChoiceField(label='policy', choices=_get_choices('policy'))
v_cache = forms.ChoiceField(label='cache', choices=_get_choices('cache'))
v_pool = forms.ChoiceField(label='pool', choices=_get_choices('pool'))
v_poolrt = forms.ChoiceField(label='pool', choices=_get_choices('poolrt'))
v_qname = forms.ChoiceField(label='qname', choices=_get_choices('qname'))

# 正整数
v_order = forms.IntegerField(label='order', min_value=1)
v_weight = forms.IntegerField(label='weight', min_value=1)
v_entries = forms.IntegerField(label='entries', min_value=1)
v_minTTL = forms.IntegerField(label='minTTL', min_value=1)
v_maxTTL = forms.IntegerField(label='maxTTL', min_value=1)
v_servfail = forms.IntegerField(label='servfail', min_value=1)
v_stale = forms.IntegerField(label='stale', min_value=1)

# 值只可以是 1,0,'1','0'
v_status = forms.ChoiceField(label='status', required=True, choices=[(1, True), (0, False)])
v_keepTTL = forms.ChoiceField(label='keepTTL', required=True, choices=[(1, True), (0, False)])


def validate_passed(field, data):
    try:
        if data == [''] or data == 'None':
            return True
        field.clean(data)
        return True
    except Exception as e:
        print(e)
    #except forms.ValidationError:
        return False
# 从模型创建表单
# class LinkTypeForm (ModelForm):
#     class Meta:
#         model = LinkType
#         fields = ['name']
class LinkTypeForm (forms.Form):
    name = forms.CharField(
            max_length=20,
            required=True,
            widget=forms.TextInput(attrs={'class': 'form-control col-md-7 col-xs-12'}),
            #自定义错误信息
            error_messages={
                'e1': u'中间不能有空格'
            },
            #验证器
            validators=[
                RegexValidator(regex='^\S+$', code='e1'),]
        )