from models import db, Answers, Question
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

answers_bp = Blueprint('answers', __name__)

# Create answer
@answers_bp.route('/api/questions/<int:question_id>/answers', methods=['POST'])
@jwt_required()
def create_answer(question_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400

    Question.query.get_or_404(question_id)
    answer = Answers(
        content=data['content'],
        question_id=question_id,
        user_id=user_id
    )
    db.session.add(answer)
    db.session.commit()

    return jsonify({'success': 'Answer created successfully', 'answer_id': answer.id}), 201


# Get answer by ID
@answers_bp.route('/api/answers/<int:answer_id>', methods=['GET'])
@jwt_required()
def get_answer(answer_id):
    answer = Answers.query.get_or_404(answer_id)
    return jsonify({
        'id': answer.id,
        'content': answer.content,
        'author': {
            'id': answer.user.id,
            'name': answer.user.username,
        },
        'question': {
            'id': answer.question.id,
            'title': answer.question.title
        },
        'is_approved': answer.is_approved,
        'votes': answer.votes,
        'created_at': answer.created_at.isoformat()
    }), 200


# Update answer
@answers_bp.route('/api/answers/<int:answer_id>', methods=['PUT'])
@jwt_required()
def update_answer(answer_id):
    user_id = get_jwt_identity()
    answer = Answers.query.get_or_404(answer_id)

    if answer.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if 'content' in data:
        answer.content = data['content']
    if 'is_approved' in data:
        answer.is_approved = data['is_approved']
    
    answer.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'success': 'Answer updated successfully', 'answer_id': answer.id}), 200


# Vote on an answer
@answers_bp.route('/api/answers/<int:answer_id>/vote', methods=['POST'])   
@jwt_required()
def vote_answer(answer_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    vote_type = data.get('vote_type')

    if vote_type not in ['up', 'down']:
        return jsonify({'error': 'Invalid vote type'}), 400

    answer = Answers.query.get_or_404(answer_id)

    # Placeholder logic — ideally prevent repeat votes per user
    if vote_type == 'up':
        answer.votes += 1
    elif vote_type == 'down':
        answer.votes = max(answer.votes - 1, 0)  # Optional: prevent negative votes

    db.session.commit()

    return jsonify({
        'success': 'Vote recorded successfully',
        'votes': answer.votes
    }), 200
