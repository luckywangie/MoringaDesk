from flask import Blueprint, request, jsonify
from models import db, FollowUp
from views.auth import token_required

followup_bp = Blueprint('followup', __name__, url_prefix='/followup')


#  Create Follow-up (User follows a question or answer)
@followup_bp.route('/', methods=['POST'])
@token_required
def create_followup(current_user):
    data = request.get_json()
    question_id = data.get('question_id')
    answer_id = data.get('answer_id')

    if not question_id and not answer_id:
        return jsonify({'error': 'Either question_id or answer_id is required'}), 400

    followup = FollowUp(
        user_id=current_user.id,
        question_id=question_id,
        answer_id=answer_id
    )
    db.session.add(followup)
    db.session.commit()
    return jsonify({'message': 'Follow-up created', 'id': followup.id}), 201


# Get all follow-ups for current user
@followup_bp.route('/', methods=['GET'])
@token_required
def get_user_followups(current_user):
    followups = FollowUp.query.filter_by(user_id=current_user.id).all()
    return jsonify([
        {
            'id': f.id,
            'question_id': f.question_id,
            'answer_id': f.answer_id
        } for f in followups
    ]), 200


# Get a specific follow-up
@followup_bp.route('/<int:followup_id>', methods=['GET'])
@token_required
def get_followup(current_user, followup_id):
    followup = FollowUp.query.filter_by(id=followup_id, user_id=current_user.id).first()
    if not followup:
        return jsonify({'error': 'Follow-up not found'}), 404

    return jsonify({
        'id': followup.id,
        'question_id': followup.question_id,
        'answer_id': followup.answer_id
    }), 200


# Update a follow-up (e.g., change followed question/answer)
@followup_bp.route('/<int:followup_id>', methods=['PUT'])
@token_required
def update_followup(current_user, followup_id):
    followup = FollowUp.query.filter_by(id=followup_id, user_id=current_user.id).first()
    if not followup:
        return jsonify({'error': 'Follow-up not found'}), 404

    data = request.get_json()
    followup.question_id = data.get('question_id', followup.question_id)
    followup.answer_id = data.get('answer_id', followup.answer_id)

    db.session.commit()
    return jsonify({'message': 'Follow-up updated'}), 200


# Delete follow-up (Unfollow)
@followup_bp.route('/<int:followup_id>', methods=['DELETE'])
@token_required
def delete_followup(current_user, followup_id):
    followup = FollowUp.query.filter_by(id=followup_id, user_id=current_user.id).first()
    if not followup:
        return jsonify({'error': 'Follow-up not found'}), 404

    db.session.delete(followup)
    db.session.commit()
    return jsonify({'message': 'Follow-up deleted'}), 200
