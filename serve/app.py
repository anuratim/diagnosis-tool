import os

from flask import Flask
from werkzeug.contrib.fixers import ProxyFix

from .firewall import firewall

PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))
PUBLIC_ROOT = os.path.normpath(os.path.join(PROJECT_ROOT, "..", "public"))

app = Flask(__name__, static_folder=PUBLIC_ROOT, static_url_path="")

app.debug = True

app.config["ALLOWED_NETWORKS"] = [
    "127.0.0.1",       # Localhost (for development)
    "38.122.7.254",    # Practice Fusion HQ
    "71.217.70.0/24",  # Beau's home
    "71.217.72.0/24",  # Beau's home
    "71.217.87.0/24",  # Beau's home
    "24.6.158.210",    # Anita's home
]

# Only respond to requests from the IPs above
# app.before_request(firewall)

# Add in middleware to secure our use of X-Forwarded-For on Heroku
app.wsgi_app = ProxyFix(app.wsgi_app)


@app.route("/")
def index():
    return app.send_static_file("index.html")
@app.route("/demo")
def demo_index():
    return app.send_static_file("demo/index.html")
@app.route("/demo/")
def demo_index2():
    return app.send_static_file("demo/index.html")

# Add in middleware to secure our use of X-Forwarded-For on Heroku
app.wsgi_app = ProxyFix(app.wsgi_app)
