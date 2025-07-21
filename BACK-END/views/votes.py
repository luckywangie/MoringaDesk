from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Votes, Answers, User, Notifications

votes_bp = Blueprint('votes_bp', __name__, url_prefix='/api')

# Serializer
def serialize_vote(vote):
    return {
        'id': vote.id,
        'user_id': vote.user_id,
        'answer_id': vote.answer_id,
        'vote_type': vote.vote_type
    }

# CREATE / TOGGLE vote
@votes_bp.route('/votes', methods=['POST'])
@jwt_required()
def create_vote():
    data = request.get_json()
    current_user = get_jwt_identity()

    answer_id = data.get('answer_id')
    vote_type = data.get('vote_type')

    if vote_type not in ['up', 'down']:
        return jsonify({'error': 'vote_type must be "up" or "down"'}), 400
    if not answer_id:
        return jsonify({'error': 'answer_id is required'}), 400

    existing = Votes.query.filter_by(user_id=current_user, answer_id=answer_id).first()

    if existing:
        if existing.vote_type == vote_type:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'success': 'Vote removed'}), 200
        else:
            existing.vote_type = vote_type
            db.session.commit()
            return jsonify({'success': 'Vote updated', 'vote': serialize_vote(existing)}), 200
    else:
        vote = Votes(user_id=current_user, answer_id=answer_id, vote_type=vote_type)
        db.session.add(vote)

        # Notify the owner of the answer
        answer = Answers.query.get(answer_id)
        if answer and answer.user_id != current_user:
            voter = User.query.get(current_user)
            notif_msg = f'{voter.username} {vote_type}voted your answer.'
            notification = Notifications(
                user_id=answer.user_id,
                type='vote',
                message=notif_msg
            )
            db.session.add(notification)

        db.session.commit()
        return jsonify({'success': 'Vote created', 'vote': serialize_vote(vote)}), 201

# GET all votes
@votes_bp.route('/votes', methods=['GET'])
@jwt_required()
def get_all_votes():
    votes = Votes.query.all()
    return jsonify([serialize_vote(v) for v in votes]), 200

# GET vote by ID
@votes_bp.route('/votes/<int:id>', methods=['GET'])
@jwt_required()
def get_vote(id):
    vote = Votes.query.get(id)
    if not vote:
        return jsonify({'error': 'Vote not found'}), 404
    return jsonify(serialize_vote(vote)), 200

# UPDATE vote (owner only)
@votes_bp.route('/votes/<int:id>', methods=['PUT'])
@jwt_required()
def update_vote(id):
    current_user = get_jwt_identity()
    vote = Votes.query.get(id)

    if not vote:
        return jsonify({'error': 'Vote not found'}), 404
    if vote.user_id != current_user:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    new_vote_type = data.get('vote_type')
    if new_vote_type not in ['up', 'down']:
        return jsonify({'error': 'vote_type must be "up" or "down"'}), 400

    vote.vote_type = new_vote_type
    db.session.commit()

    return jsonify({'success': 'Vote updated', 'vote': serialize_vote(vote)}), 200

# DELETE vote (owner only)
@votes_bp.route('/votes/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_vote(id):
    current_user = get_jwt_identity()
    vote = Votes.query.get(id)

    if not vote:
        return jsonify({'error': 'Vote not found'}), 404
    if vote.user_id != current_user:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(vote)
    db.session.commit()

    return jsonify({'success': 'Vote deleted'}), 200
