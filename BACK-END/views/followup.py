from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, FollowUp
from datetime import datetime

followup_bp = Blueprint('followup_bp', __name__, url_prefix='/api')

# Serializer
def serialize_followup(followup):
    return {
        'id': followup.id,
        'user_id': followup.user_id,
        'question_id': followup.question_id,
        'answer_id': followup.answer_id,
        'content': followup.content,
        'created_at': followup.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
    }

# CREATE follow-up
@followup_bp.route('/followups', methods=['POST'])
@jwt_required()
def create_followup():
    data = request.get_json()
    user_id = get_jwt_identity()

    question_id = data.get('question_id')
    answer_id = data.get('answer_id')  
    content = data.get('content')

    if not question_id or not content:
        return jsonify({'message': 'question_id and content are required'}), 400

    followup = FollowUp(
        user_id=user_id,
        question_id=question_id,
        answer_id=answer_id,
        content=content
    )
    db.session.add(followup)
    db.session.commit()

    return jsonify({'message': 'Follow-up created successfully', 'followup': serialize_followup(followup)}), 201

# READ all follow-ups
@followup_bp.route('/followups', methods=['GET'])
def get_all_followups():
    followups = FollowUp.query.order_by(FollowUp.created_at.desc()).all()
    return jsonify([serialize_followup(f) for f in followups]), 200

# READ one follow-up
@followup_bp.route('/followups/<int:id>', methods=['GET'])
def get_single_followup(id):
    followup = FollowUp.query.get(id)
    if not followup:
        return jsonify({'message': 'Follow-up not found'}), 404
    return jsonify(serialize_followup(followup)), 200

# UPDATE follow-up
@followup_bp.route('/followups/<int:id>', methods=['PUT'])
@jwt_required()
def update_followup(id):
    followup = FollowUp.query.get(id)
    if not followup:
        return jsonify({'message': 'Follow-up not found'}), 404

    user_id = get_jwt_identity()
    if followup.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    followup.content = data.get('content', followup.content)
    followup.answer_id = data.get('answer_id', followup.answer_id)

    db.session.commit()
    return jsonify({'message': 'Follow-up updated successfully', 'followup': serialize_followup(followup)}), 200

# DELETE follow-up
@followup_bp.route('/followups/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_followup(id):
    followup = FollowUp.query.get(id)
    if not followup:
        return jsonify({'message': 'Follow-up not found'}), 404

    user_id = get_jwt_identity()
    if followup.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(followup)
    db.session.commit()
    return jsonify({'message': 'Follow-up deleted successfully'}), 200
