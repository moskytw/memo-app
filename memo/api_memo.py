#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from flask import Blueprint, request, abort, jsonify
from .models import memo as memo_model

blueprint = Blueprint('api_memo', __name__)

@blueprint.route('/sync', methods=['POST'])
def sync():

    memo = json.loads(request.data)
    memo_id = memo.get('memo_id')

    if memo_id is None:
        memo_id = memo['memo_id'] = memo_model.next_memo_id
        memo_model.next_memo_id += 1

    memo_model.memos[memo_id] = memo

    return jsonify(memo)

@blueprint.route('/delete', methods=['POST'])
def delete():

    memo = json.loads(request.data)

    try:
        del memo_model.memos[memo['memo_id']]
    except KeyError:
        abort(400)

    return jsonify()
