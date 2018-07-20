#!/bin/bash

#
# rdns management
#

DOMAIN_CONF="/home/unbound/usr/local/etc/unbound/gfw.zone"
LOG=/tmp/dnsm.log

. "/usr/local/yeti/config/funcs.sh"
. "/usr/local/yeti/config/setting.sh"

if [ "$unbound_only" -eq 1 ]; then
case $1 in
    showacl)
        echo `date` showacl >>$LOG
        showacl $CONFIG
        ;;
    addacl)
        echo `date` addacl "$2" >> $LOG
        addacl $CONFIG "$2"
        reload_unbound
        ;;

    delacl)
        echo `date` delacl "$2" >> $LOG
        delacl $CONFIG "$2"
        reload_unbound
        ;;
    adddomain)
        echo `date` adddomain "$2" >> $LOG
        adddomain $DOMAIN_CONF "$2"
        reload_unbound
        ;;
    deldomain)
        echo `date` deldomain "$2" >> $LOG
        deldomain $DOMAIN_CONF "$2"
        reload_unbound
        ;;
    delzone)
        echo `date` delzone "$2" >> $LOG
        delzone $CONFIG "$2"
        ;;
    delname)
        echo `date` delname "$2" >> $LOG
        delname $CONFIG "$2"
        ;;
    reload)
        echo `date` reload >> $LOG
        reload_server
        ;;
    start)
        echo `date` start >> $LOG
        start_server
        ;;
    stop)
        echo `date` stop >> $LOG
        stop_server
        ;;
    sync)
        echo `date` sync >> $LOG
        /usr/local/yeti/bin/sync
        ;;
    cmd)
        echo `date` cmd >> $LOG
        shift
        run_cmd "$@"
        ;;
    *)
        :
esac
else
case $1 in
    showacl)
        echo `date` showacl >>$LOG
        dist_showacl $CONFIG
        ;;
    addacl)
        echo `date` addacl "$2" >> $LOG
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/addacl "$2"
        done
        ;;

    delacl)
        echo `date` delacl "$2" >> $LOG
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delacl "$2"
        done
        ;;
    addserver)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/addserver "$@"
        done
        ;;
    updateserver)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/updateserver "$@"
        done
        ;;
    delserver)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delserver "$@"
        done
        ;;
    addcache)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/addcache "$@"
        done
        ;;
    delcache)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delcache "$@"
        done
        ;;
    addpool)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/addpool "$@"
        done
        ;;
    updatepool)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/updatepool "$@"
        done
        ;;
    delpool)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delpool "$@"
        done
        ;;
    addruleview)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/addruleview "$@"
        done
        ;;
    delruleview)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delruleview "$@"
        done
        ;;
    addruletraffic)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/addruletraffic "$@"
        done
        ;;
    delruletraffic)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delruletraffic "$@"
        done
        ;;
    mvrule)
        echo `date` "$@" >> $LOG
        shift
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/mvrule "$@"
        done
        ;;
    adddomainacl)
        echo `date` "$@" >> $LOG
        shift; 
        acl="$1"
        shift;
        domains="$@"
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/adddomainacl "$acl" "$domains"
        done
        ;;
    deldomainacl)
        echo `date` "$@" >> $LOG
        shift; 
        acl="$1"
        shift;
        domains="$@"
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/deldomainacl "$acl" "$domains"
        done
        ;;
    dgroupadddomain)
        echo `date` "$@" >> $LOG
        shift; 
        acls="$1"
        shift;
        domains="$@"
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/dgroupadddomain "$acls" "$domains"
        done
        ;;
    dgroupdeldomain)
        echo `date` "$@" >> $LOG
        shift; 
        acls="$1"
        shift;
        domains="$@"
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/dgroupdeldomain "$acls" "$domains" 
        done
        ;;
    adddomain)
        echo `date` adddomain "$2" >> $LOG
        adddomain $DOMAIN_CONF "$2"
        reload_unbound
        ;;
    deldomain)
        echo `date` deldomain "$2" >> $LOG
        deldomain $DOMAIN_CONF "$2"
        reload_unbound
        ;;
    delzone)
        echo `date` delzone "$2" >> $LOG
        delzone $CONFIG "$2"
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delzone "$2"
        done
        ;;
    delname)
        echo `date` delname "$2" >> $LOG
        delname $CONFIG "$2"
        for s in $dist_servers; do
            ssh -o StrictHostKeyChecking=no root@$s /usr/local/yeti/bin/delname "$2"
        done
        ;;
    reload)
        echo `date` reload >> $LOG
        reload_server_all
        ;;
    start)
        echo `date` start >> $LOG
        start_server_all
        ;;
    stop)
        echo `date` stop >> $LOG
        stop_server_all
        ;;
    sync)
        echo `date` sync >> $LOG
        /usr/local/yeti/bin/sync
        ;;
    cmd)
        echo `date` cmd >> $LOG
        shift
        run_cmd "$@"
        ;;
    *)
        :
esac
fi
