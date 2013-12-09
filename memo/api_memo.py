#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from flask import Blueprint, request, abort, jsonify
from .models import memo as memo_model

blueprint = Blueprint('api_memo', __name__)

@blueprint.errorhandler((ValueError, KeyError))
def handle_common_errors(e):
    return None, 400

@blueprint.route('/<action>', methods=['GET', 'POST'])
def memo(action):

    if action == 'create':

        memo = {}

        memo_id = memo['memo_id'] = memo_model.next_memo_id
        memo_model.next_memo_id += 1

        memo['content'] = request.values['content']

        memo_model.memos[memo_id] = memo

        return jsonify(memo_id=memo_id)

    elif action == 'read':
        memo_id = int(request.values['memo_id'])
        memo = memo_model.memos[memo_id]
        return jsonify(memo_model.memos[memo_id])

    elif action == 'update':
        memo_id = int(request.values['memo_id'])
        memo = memo_model.memos[memo_id]
        memo['content'] = request.values['content']
        return jsonify()

    elif action == 'delete':
        memo_id = int(request.values['memo_id'])
        del memo_model.memos[memo_id]
        return jsonify()

    abort(404)
