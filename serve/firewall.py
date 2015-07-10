from flask import current_app, request, abort
from netaddr import IPAddress, IPNetwork


def firewall():
    if not any(IPAddress(request.remote_addr) in IPNetwork(network)
               for network in current_app.config['ALLOWED_NETWORKS']):
        abort(404)
