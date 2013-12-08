#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask

app = Flask(__name__)

from . import pages
app.register_blueprint(pages.blueprint)
