#import os,django
#os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recms.settings")
#django.setup()

import requests

host = 'http://192.168.3.75:8000/'
HEADS = {
    'Authorization': 'Token a5411a3756d0891e19e02908626a7b6a8ca6e6dd'
}


def get_token(user='admin',passwd='admin'):
    data = {
        'username': user,
        'password': passwd,
    }
    r_p = requests.post('{0}api-token-auth/'.format(host), data=data)
    return r_p.json()


class TestApi:
    def __init__(self, router_api,user='admin',passwd='admin'):
        self.url = '{0}api/v1/{1}/'.format(host,router_api)
        r = get_token(user,passwd)
        Heads = {
            'Authorization': 'Token {0}'.format(r['token'])
        }
        self.head = Heads

    def get(self,data):
        r = requests.get(self.url, headers=self.head,params=data)
        return r.json()

    def add_del(self,data):

        r1 = self.add_one(data)
        if 'id' not in r1:
            id = self.get({'name':data.pop('name')})['Pool'][0]['id']
            ret = self.del_one(id)
            return ret
        ret = self.del_one(r1['id'])
        return ret

    def add_one(self,data):
        r1 = requests.post(self.url, headers=self.head, data=data)
        return r1.json()

    def patch_one(self,pk,data):
        r = requests.patch(self.url+'{0}/'.format(pk),headers=self.head,data=data)
        return r.json()

    def get_one(self,pk):
        r_pk = requests.get(self.url + '{0}/'.format(pk), headers=self.head)
        return r_pk.json()

    def del_one(self,pk):
        d_pk = requests.delete(self.url + '{0}/'.format(pk), headers=self.head)
        return d_pk

def test_args(*args,**kwargs):
    print(args[0],type(args))
    print(kwargs,type(kwargs))

if __name__ == '__main__':
    data1 = {
        'name': 'post_pool1',
        'cache': 1,
    }
    data2 = {
        'name': 'post_pool2',
        'cache': 1,
    }
    pool = TestApi('pool',user='zdl',passwd='123321')
    ad = pool.add_del(data1)
    assert ad.status_code == 204, '增删异常'
    #ret = pool.add_one(data2)
    #patch = pool.patch_one(13,{'name': 'post_pool_patch'})
    #print(patch)

