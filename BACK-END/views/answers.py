from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Answers, Question, User, Notifications, FollowUp  # ✅ FollowUp added

answers_bp = Blueprint('answers_bp', __name__, url_prefix='/api')

# Helper to serialize Answer
def serialize_answer(answer):
    return {
        'id': answer.id,
        'content': answer.content,
        'question_id': answer.question_id,
        'user_id': answer.user_id,
        'created_at': answer.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
    }

# CREATE Answer (with notification to question owner + thread contributors)
@answers_bp.route('/questions/<int:question_id>/answers', methods=['POST'])
@jwt_required()
def create_answer(question_id):
    data = request.get_json()
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    content = data.get('content')
    if not content:
        return jsonify({'error': 'Answer content is required'}), 400

    new_answer = Answers(content=content, question_id=question_id, user_id=user_id)
    db.session.add(new_answer)

    # ✅ Notify the question owner (if not the same as the answerer)
    if question.user_id != user_id:
        notification = Notifications(
            user_id=question.user_id,
            type='answer',
            message=f'{user.username} answered your question: "{question.title}"'
        )
        db.session.add(notification)

    # ✅ Notify previous contributors (excluding current user and question owner)
    contributor_ids = set()

    # Previous answerers
    previous_answers = Answers.query.filter_by(question_id=question.id).all()
    for ans in previous_answers:
        if ans.user_id not in (user_id, question.user_id):
            contributor_ids.add(ans.user_id)

    # Previous follow-ups
    previous_followups = FollowUp.query.filter_by(question_id=question.id).all()
    for f in previous_followups:
        if f.user_id not in (user_id, question.user_id):
            contributor_ids.add(f.user_id)

    # Send notifications
    for uid in contributor_ids:
        notif = Notifications(
            user_id=uid,
            type='thread',
            message=f'{user.username} also contributed to a thread you’re part of.'
        )
        db.session.add(notif)

    db.session.commit()

    return jsonify({'success': 'Answer created successfully', 'answer': serialize_answer(new_answer)}), 201

# GET: Approved answers for a specific question
@answers_bp.route('/questions/<int:question_id>/answers/is_approved', methods=['GET'])
def get_approved_answers(question_id):
    answers = Answers.query.filter_by(question_id=question_id, is_approved=True).all()
    return jsonify([serialize_answer(ans) for ans in answers]), 200

# PUT: Admin approves an answer
@answers_bp.route('/answers/<int:answer_id>/is_approved', methods=['PUT'])
@jwt_required()
def approve_answer(answer_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or not user.is_admin:
        return jsonify({'error': 'Access denied. Admins only.'}), 403

    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'error': 'Answer not found'}), 404

    answer.is_approved = True
    db.session.commit()

    return jsonify({'success': 'Answer approved successfully'}), 200

# READ: Get all answers for a question
@answers_bp.route('/questions/<int:question_id>/answers', methods=['GET'])
def get_answers_for_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    answers = Answers.query.filter_by(question_id=question_id).all()
    return jsonify([serialize_answer(answer) for answer in answers]), 200

# READ: Get answer by ID
@answers_bp.route('/answers/<int:answer_id>', methods=['GET'])
def get_answer_by_id(answer_id):
    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'error': 'Answer not found'}), 404
    return jsonify(serialize_answer(answer)), 200

# UPDATE: Update an answer
@answers_bp.route('/answers/<int:answer_id>', methods=['PUT'])
@jwt_required()
def update_answer(answer_id):
    data = request.get_json()
    user_id = get_jwt_identity()

    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'error': 'Answer not found'}), 404

    if answer.user_id != user_id:
        return jsonify({'error': 'Unauthorized to update this answer'}), 403

    content = data.get('content')
    if content:
        answer.content = content
        db.session.commit()

    return jsonify({'success': 'Answer updated successfully', 'answer': serialize_answer(answer)}), 200

# DELETE: Delete an answer
@answers_bp.route('/answers/<int:answer_id>', methods=['DELETE'])
@jwt_required()
def delete_answer(answer_id):
    user_id = get_jwt_identity()
    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'error': 'Answer not found'}), 404

    if answer.user_id != user_id:
        return jsonify({'error': 'Unauthorized to delete this answer'}), 403

    db.session.delete(answer)
    db.session.commit()
    return jsonify({'success': 'Answer deleted successfully'}), 200
