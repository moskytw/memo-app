#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Blueprint, render_template
from .models import memo as memo_model

blueprint = Blueprint('pages', __name__)

@blueprint.route('/')
def index():
    return render_template('index.html')
