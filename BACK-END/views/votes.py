from flask import Blueprint, request, jsonify
from models import db, Votes, Answers, Notifications
from views.auth import token_required

votes_bp = Blueprint('votes', __name__, url_prefix='/votes')


# Vote for an answer
@votes_bp.route('/', methods=['POST'])
@token_required
def vote_answer(current_user):
    data = request.get_json()
    answer_id = data.get('answer_id')

    if not answer_id:
        return jsonify({'error': 'Answer ID is required'}), 400

    # Check if answer exists
    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'error': 'Answer not found'}), 404

    # Check if user already voted
    existing_vote = Votes.query.filter_by(user_id=current_user.id, solution_id=answer_id).first()
    if existing_vote:
        return jsonify({'message': 'You have already voted for this answer'}), 400

    # Save vote
    vote = Votes(user_id=current_user.id, solution_id=answer_id)
    db.session.add(vote)

    # Notify answer owner (if it's not the same user)
    if answer.user_id != current_user.id:
        notification = Notifications(
            user_id=answer.user_id,
            type='vote',
            message=f"{current_user.username} upvoted your answer.",
        )
        db.session.add(notification)

    db.session.commit()

    return jsonify({'message': 'Vote recorded successfully'}), 201


# Remove vote from an answer
@votes_bp.route('/', methods=['DELETE'])
@token_required
def unvote_answer(current_user):
    data = request.get_json()
    answer_id = data.get('answer_id')

    if not answer_id:
        return jsonify({'error': 'Answer ID is required'}), 400

    vote = Votes.query.filter_by(user_id=current_user.id, solution_id=answer_id).first()
    if not vote:
        return jsonify({'message': 'You have not voted on this answer'}), 404

    db.session.delete(vote)
    db.session.commit()

    return jsonify({'message': 'Vote removed'}), 200


# Get total votes for an answer
@votes_bp.route('/<int:answer_id>', methods=['GET'])
def get_votes_for_answer(answer_id):
    vote_count = Votes.query.filter_by(solution_id=answer_id).count()
    return jsonify({'answer_id': answer_id, 'votes': vote_count}), 200
