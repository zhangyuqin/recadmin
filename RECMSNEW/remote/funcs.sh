#!/bin/bash

#
# acl management
#

CONFIG="/home/unbound/usr/local/etc/unbound/unbound.conf"
dist_showacl() {
    dnsdist -c -e "showACL()"
}

showacl() {
    local cnf="$1"
    egrep '^\s+access-control' $cnf |awk '{print $2}'
}


addacl() {
    local cnf="$1"
    local acl="$2"

    for s in $unbound_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/uaddacl "$cnf" "$acl"
    done
}

delacl() {
    local cnf="$1"
    local acl="$2"

    for s in $unbound_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/udelacl "$cnf" "$acl"
    done
}

reload_unbound() {
    for s in $unbound_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/ureload
    done
}

reload_server() {
    reload_unbound
}

reload_server_all() {
    reload_server
    for s in $dist_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/reload
    done
}

start_server() {
    for s in $unbound_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/ustart
    done
}

start_server_all() {
   start_server 
    for s in $dist_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/start
    done
}

stop_server() {
    for s in $unbound_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/ustop
    done
}

stop_server_all() {
   stop_server 
    for s in $dist_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/stop
    done
}

adddomain() {
    local cnf="$1"
    local domain="$2"

    if egrep -q "name: \"$domain\"" $cnf; then
        :
    else
        # add domain
        cat <<EOT > /tmp/f.zone
forward-zone:
   name: "$domain"
   forward-addr: 240c:F:1:22::105
   forward-addr: 240c:F:1:22::103
EOT

        cat /tmp/f.zone $cnf >$cnf.new
        mv $cnf.new $cnf
       
    fi

}

deldomain() {
    local cnf="$1"
    local domain="$2"

    if egrep -q "name: \"$domain\"" $cnf; then
        # remove zone
        # http://bbs.chinaunix.net/thread-3775201-1-1.html
        ed -s $cnf <<EOT >/dev/null
/$domain/
-1,+2d
w
q
EOT
    fi
}

delzone() {
    local cnf="$1"
    local domain="$2"

    for s in $unbound_servers; do
        ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/udelzone "$domain"
    done
}

delname() {
    local cnf="$1"
    local domain="$2"

    for s in $unbound_servers; do
       ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/udelname "$domain"
    done

}

run_cmd() {
    local cmd="$@"
    echo "$cmd"
    for s in $unbound_servers; do
       ssh -o StrictHostKeyChecking=no root@$s unbound-control -q $cmd
    done

}
