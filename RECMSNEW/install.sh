#!/bin/bash

#
#  install recms 
#

local_deb(){
	dpkg -i deb_pkg/lib*.deb >/dev/null 
	dpkg -i deb_pkg/dnsdist_1.3.0-1pdns.xenial_amd64.deb >/dev/null 
}

help(){
	echo "usage: $0 help"
	echo "       $0 (all|update)"
	cat <<EOF

	help       - this screen
	update     - update the pyc only
	all        - install first time all in
EOF
}
case "$1" in
	update)
		;;
	all)
		local_deb
		;;
	*)
		help
		;;
esac

echo "...install end"
