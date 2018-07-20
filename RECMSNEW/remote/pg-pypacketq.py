#!/usr/bin/python3

import subprocess
import json
import psycopg2

DB_NAME = 'dnsquery'
USER = 'queryadmin'
PASSWORD = 'recv6rdns'
HOST = 'localhost'

def packetq(pcaps):
    cmd = '/usr/local/yeti/bin/packetq -s "select s as timestamp, src_addr, dst_addr, qname from dns \
          where qr=0 and rd=1;" {pfile}'.format(pfile=pcaps)
    result = subprocess.check_output(cmd, universal_newlines=False, shell=True)
    js = json.loads(result.decode('utf-8'))
    reqs = js[0]['data']

    return reqs

def connect_db():
    conn = psycopg2.connect("dbname={0} user={1} password={2} host={3}".format(
        DB_NAME,USER,PASSWORD,HOST
    ))
    #conn.text_factory = bytes
    cur = conn.cursor()

    return conn,cur

def create_index():
    """
    CREATE INDEX iquery_qname on query (qnameId);
    CREATE INDEX iquery_server on query (serverId);
    CREATE INDEX iquery_client on query (clientId);
    CREATE INDEX iquery_time on query (timestamp);
    """

def create_table(cur):
    # Create table
    #cur.execute('''CREATE TABLE if not exists dns
    #                 (timestamp integer, client text, server text, qname text)''')
    cur.execute('''CREATE TABLE if not exists client (id SERIAL primary key, client text unique)''')
    #cur.execute('''CREATE TABLE if not exists server (id integer primary key, server text unique)''')
    cur.execute('''CREATE TABLE if not exists server (id SERIAL primary key, server text unique)''')
    cur.execute('''CREATE TABLE if not exists qname (id SERIAL primary key, qname text unique)''')
    cur.execute('''CREATE TABLE if not exists query
                     (timestamp integer,
                      clientId integer,
                      serverId integer,
                      qnameId integer,
                      FOREIGN KEY(clientId) REFERENCES client(id),
                      FOREIGN KEY(serverId) REFERENCES server(id),
                      FOREIGN KEY(qnameId) REFERENCES qname(id),
                      primary key(timestamp, clientId, serverId, qnameId))''')

def insert(cur, record,conn):
    # insert client
    sql = "INSERT INTO client(client) VALUES ('{value}') ON CONFLICT (client) DO NOTHING".format(value=record[1])
    cur.execute(sql)
    #cid = cur.execute("select id from client where client='{client}'".format(client=record[1])).fetchone()[0]
    cur.execute("select id from client where client='{client}'".format(client=record[1]))
    cid = cur.fetchone()[0]

    # insert server
    sql = "INSERT INTO server(server) VALUES ('{value}') ON CONFLICT (server) DO NOTHING".format(value=record[2])
    cur.execute(sql)
    cur.execute("select id from server where server='{server}'".format(server=record[2]))
    sid = cur.fetchone()[0]

    # insert qname
    sql = "INSERT INTO qname(qname) VALUES ('{value}') ON CONFLICT (qname) DO NOTHING".format(value=record[3])
    cur.execute(sql)
    cur.execute("select id from qname where qname='{qname}'".format(qname=record[3]))
    qid = cur.fetchone()[0]

    # insert rr
    #sql = "INSERT or IGNORE INTO query VALUES {value}".format(value=(record[0], cid, sid, qid))
    sql = 'INSERT INTO query (timestamp, "clientId", "serverId" ,"qnameId") VALUES {value}'.format(value=(record[0], cid, sid, qid))
    cur.execute(sql)

def select(cur):
    # test
    cur.execute("select * from client")
    print(cur.fetchall())

    cur.execute("select * from server")
    print(cur.fetchall())

    cur.execute("select * from qname")
    print(cur.fetchall())
    cur.execute("select * from query")
    print(cur.fetchall())

    print('query for baidu-------------')
    cur.execute('''select timestamp, client, server, qname from
                 client,server, qname, query
                 where qname="www.baidu.com" and query.qnameId=qname.id
                       and query.clientId=client.id and query.serverId=server.id
                 ''')

    for req in cur.fetchall():
        print(req)

def commit(conn):
    # Save (commit) the changes
    conn.commit()

def add_dns(reqs, db='dns.db'):
    conn, cur = connect_db()
    #create_table(cur)
    for rr in reqs:
        insert(cur, rr)
    commit(conn)

if __name__ == "__main__":
    import sys
    db = sys.argv[1]
    pcap = sys.argv[2:]
    rr = sorted(set(map(tuple, packetq(' '.join(pcap)))))
    add_dns(rr, db)