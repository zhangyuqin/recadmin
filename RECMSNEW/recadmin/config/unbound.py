import re
import os,django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recms.settings")
django.setup()
from recms.settings import  CONF_OUTPUT_DIR, RECNAME
from functools import reduce

def read_config(conf_file):
    str = open(conf_file).read()
    dictconf = {}
    for line in str.split('\n'):
        # if re.match(r'^\s*#', line):continue
        matchObj = re.match(r'([\w-]+):\s*(.*)', line)
        if matchObj:
            k1,v1 = matchObj.group(1,2)
            if v1:
                if k1 in dictconf:
                    dictconf[k1] += ';'+v1
                else:
                    dictconf[k1] = v1
            else:
                dictconf[k1] = {}
            continue
        matchObj2 = re.match(r'\s+([\w-]+):\s+(.+)', line)
        if matchObj2:
            k2,v2 = matchObj2.group(1,2)
            if k2 in dictconf[k1]:
                dictconf[k1][k2] += ';'+v2
            else:
                dictconf[k1][k2] = v2
    return dictconf


def dict_merge(x,y): #字典的值必须是列表形式才可以通过reduce聚合
    for k, v in y.items():
        if k in x.keys():
            x[k] += v
        else:
            x[k] = v
    return x

def write_config(dictconf, conf_file):
    fh = open(conf_file, 'w')
    fh.write('#generate by atuto')
    clause = ['server','remote-control']
    for klause in clause:
        fh.write('\n'+klause+':\n')
        for k in dictconf[klause]:
            if dictconf[klause][k].find(';') == -1:
                fh.write('    '+k+': '+dictconf[klause][k]+'\n')
            else:
                for vv in dictconf[klause][k].split(';'):
                    fh.write('    '+k+': '+vv+'\n')
    if dictconf['include'].find(';') != -1:
        for v in dictconf['include'].split(';'):
            fh.write('\ninclude: '+v)
    else:
        fh.write('\ninclude: '+dictconf['include']+'\n')
    fh.close()


def read_local_data(unbound_local_data_conf_file):
    str = open(unbound_local_data_conf_file).read()
    local_zone = []
    local_data = []
    for line in str.split('\n'):
        matchlz = re.match(r'local-zone:\s+"(.+)"\s+(\w+)', line)
        matchld = re.match(r'local-data:\s+"(.+)\s+IN\s+(\w+)\s+([\w:]+)"', line)
        if matchlz:
            local_zone.append(matchlz.group(1,2))
        if matchld:
            local_data.append(matchld.group(1,2,3))
    return local_zone, local_data


def write_local_data(local_zone_data, unbound_local_data_conf_file):
    fh = open(unbound_local_data_conf_file, 'w')
    zone_pool = []
    for local_zone in local_zone_data[0]:

        content = 'local-zone: "'+local_zone[0]+'" '+local_zone[1]+'\n'
        if len(local_zone) == 2:
            fh.write(content)
        elif len(local_zone) == 3:
            zone_pool.append({local_zone[2]:[content]})
    for local_data in local_zone_data[1]:
        content2 = 'local-data: "'+local_data[0]+' IN '+local_data[1]+' '+local_data[2]+'"\n'
        if len(local_data) == 3:
            fh.write(content2)
        elif len(local_data) == 4:
            zone_pool.append({local_data[3]:[content2]})
    fh.close()

    if zone_pool != []:
        z_pool = reduce(dict_merge,zone_pool,{})
        for k, v in z_pool.items():
            p_dir = CONF_OUTPUT_DIR + '/' + '{0}/'.format(k)
            p_f = p_dir +'/unbound-local-data.conf'
            if not os.path.exists(p_dir):
                os.mkdir(p_dir)
            with open(p_f,'w') as n:
                n.write(''.join(v))


def read_forward_zone(forward_zone_conf_file):
    """reads forward zone conf file to a dict consist of some lists"""

    forward_zone_conf = {'forward-zone': []}
    d = {}
    lines = open(forward_zone_conf_file).read().split('\n')
    lines.reverse()
    for line in lines:

        if re.search(r'forward-first', line):
            d['forward-first']='yes'
            continue

        match_addr = re.match(r'\s+forward-addr:\s+(.+)', line)
        if match_addr:
            if 'forward-addr' in d:
                d['forward-addr'].append(match_addr.group(1))
            else:
                d['forward-addr'] = []
                d['forward-addr'].append(match_addr.group(1))
            continue

        match_name = re.match(r'\s+name:\s+"(.+)"', line)
        if match_name:
            d['name'] = match_name.group(1)
            continue

        match_zone = re.match(r'forward-zone:', line)
        if match_zone:
            forward_zone_conf['forward-zone'].append(d)
            d = {}


    return forward_zone_conf


def write_forward_zone(forward_zone_conf, forward_zone_conf_file):
    """writes conf to file"""

    def de(fh,d):
        for zone in d:
            fh.write('forward-zone:\n')
            fh.write('    name: "' + zone['name'] + '"\n')

            for addr in zone['forward-addr']:
                fh.write('    forward-addr: ' + addr + '\n')

            if 'forward-first' in zone:
                fh.write('    forward-first: yes\n')
        fh.close()

    fh = open(forward_zone_conf_file, 'w')
    forward_zone_conf['forward-zone'].reverse()
    de(fh,forward_zone_conf['forward-zone'])

    """write pool conf"""
    r =  forward_zone_conf['forward-pool']

    ret = reduce(dict_merge,r,{})
    for k,v in ret.items():
        p_dir = CONF_OUTPUT_DIR+'/'+'{0}/'.format(k)
        p_f = p_dir +RECNAME+'.zone'
        if not os.path.exists(p_dir):
            os.mkdir(p_dir)
        f = open(p_f,'w')
        de(f,v)


if __name__ == '__main__':
    #read_config('/tmp/unbound.conf')
    pass