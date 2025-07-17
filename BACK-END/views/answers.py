from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Answers, Question

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

# CREATE Answer
@answers_bp.route('/questions/<int:question_id>/answers', methods=['POST'])
@jwt_required()
def create_answer(question_id):
    data = request.get_json()
    user_id = get_jwt_identity()

    question = Question.query.get(question_id)
    if not question:
        return jsonify({'message': 'Question not found'}), 404

    content = data.get('content')
    if not content:
        return jsonify({'message': 'Answer content is required'}), 400

    new_answer = Answers(content=content, question_id=question_id, user_id=user_id)
    db.session.add(new_answer)
    db.session.commit()

    return jsonify({'message': 'Answer created successfully', 'answer': serialize_answer(new_answer)}), 201

# READ: Get all answers for a question
@answers_bp.route('/questions/<int:question_id>/answers', methods=['GET'])
def get_answers_for_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'message': 'Question not found'}), 404

    answers = Answers.query.filter_by(question_id=question_id).all()
    return jsonify([serialize_answer(answer) for answer in answers]), 200

# READ: Get answer by ID
@answers_bp.route('/answers/<int:answer_id>', methods=['GET'])
def get_answer_by_id(answer_id):
    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'message': 'Answer not found'}), 404
    return jsonify(serialize_answer(answer)), 200

# UPDATE: Update an answer
@answers_bp.route('/answers/<int:answer_id>', methods=['PUT'])
@jwt_required()
def update_answer(answer_id):
    data = request.get_json()
    user_id = get_jwt_identity()

    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'message': 'Answer not found'}), 404

    if answer.user_id != user_id:
        return jsonify({'message': 'Unauthorized to update this answer'}), 403

    content = data.get('content')
    if content:
        answer.content = content
        db.session.commit()

    return jsonify({'message': 'Answer updated successfully', 'answer': serialize_answer(answer)}), 200

# DELETE: Delete an answer
@answers_bp.route('/answers/<int:answer_id>', methods=['DELETE'])
@jwt_required()
def delete_answer(answer_id):
    user_id = get_jwt_identity()
    answer = Answers.query.get(answer_id)
    if not answer:
        return jsonify({'message': 'Answer not found'}), 404

    if answer.user_id != user_id:
        return jsonify({'message': 'Unauthorized to delete this answer'}), 403

    db.session.delete(answer)
    db.session.commit()
    return jsonify({'message': 'Answer deleted successfully'}), 200
