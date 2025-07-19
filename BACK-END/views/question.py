from flask import Blueprint, request, jsonify
from models import db, Question, User, Category
from .auth import token_required
from datetime import datetime

question_bp = Blueprint('question', __name__, url_prefix='/api/questions')

# -------------------- Create Question --------------------
@question_bp.route('', methods=['POST'])
@token_required
def create_question(current_user):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    category_id = data.get('category_id')
    language = data.get('language')  # <-- Get language

    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400

    if not category_id:
        return jsonify({'error': 'Category ID is required'}), 400

    if not language:
        return jsonify({'error': 'Language is required'}), 400  # <-- Validate language

    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Invalid category ID'}), 400

    new_question = Question(
        title=title,
        description=description,
        user_id=current_user.id,
        category_id=category_id,
        language=language,  # <-- Add language to model
        created_at=datetime.utcnow()
    )

    db.session.add(new_question)
    db.session.commit()

    return jsonify({
        'success': 'Question created successfully',
        'question': {
            'id': new_question.id,
            'title': new_question.title,
            'description': new_question.description,
            'user_id': new_question.user_id,
            'category_id': new_question.category_id,
            'language': new_question.language,
            'created_at': new_question.created_at
        }
    }), 201
    
# -------------------- Mark Question as Solved/Unsolved (Admin or Owner) --------------------
@question_bp.route('/<int:question_id>/is_solved', methods=['PUT'])
@token_required
def set_question_solved(current_user, question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    if question.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'error': 'Unauthorized to update this question'}), 403
    data = request.get_json()
    is_solved = data.get('is_solved')
    if is_solved is None:
        return jsonify({'error': 'is_solved (true/false) is required'}), 400
    question.is_solved = bool(is_solved)
    db.session.commit()
    return jsonify({'success': 'Question solved status updated', 'question': {
        'id': question.id,
        'is_solved': question.is_solved
    }}), 200

# -------------------- Get All Solved Questions --------------------
@question_bp.route('/is_solved', methods=['GET'])
def get_solved_questions():
    questions = Question.query.filter_by(is_solved=True).all()
    result = []
    for q in questions:
        result.append({
            'id': q.id,
            'title': q.title,
            'description': q.description,
            'user_id': q.user_id,
            'category_id': q.category_id,
            'language': q.language,
            'created_at': q.created_at,
            'is_solved': q.is_solved
        })
    return jsonify(result), 200

#--------------------- Get Unsolved Questions --------------
@question_bp.route('/is_unsolved', methods=['GET'])
def get_unsolved_questions():
    questions = Question.query.filter_by(is_solved=False).all()
    result = []
    for q in questions:
        result.append({
            'id': q.id,
            'title': q.title,
            'description': q.description,
            'user_id': q.user_id,
            'category_id': q.category_id,
            'language': q.language,
            'created_at': q.created_at,
            'is_solved': q.is_solved
        })
    return jsonify(result), 200

# -------------------- Get All Questions --------------------
@question_bp.route('', methods=['GET'])
def get_questions():
    questions = Question.query.all()
    result = []
    for q in questions:
        result.append({
            'id': q.id,
            'title': q.title,
            'description': q.description,
            'user_id': q.user_id,
            'category_id': q.category_id,
            'language': q.language,
            'created_at': q.created_at
        })

    return jsonify(result), 200

# -------------------- Get One Question --------------------
@question_bp.route('/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    return jsonify({
        'id': question.id,
        'title': question.title,
        'description': question.description,
        'user_id': question.user_id,
        'category_id': question.category_id,
        'language': question.language,
        'created_at': question.created_at
    }), 200

# -------------------- Update Question --------------------
@question_bp.route('/<int:question_id>', methods=['PUT'])
@token_required
def update_question(current_user, question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    if question.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'error': 'Unauthorized to update this question'}), 403

    data = request.get_json()
    question.title = data.get('title', question.title)
    question.description = data.get('description', question.description)
    question.category_id = data.get('category_id', question.category_id)
    question.language = data.get('language', question.language)  # <-- update language

    db.session.commit()

    return jsonify({
        'success': 'Question updated successfully',
        'question': {
            'id': question.id,
            'title': question.title,
            'description': question.description,
            'user_id': question.user_id,
            'category_id': question.category_id,
            'language': question.language,
            'created_at': question.created_at
        }
    }), 200

# -------------------- Delete Question --------------------
@question_bp.route('/<int:question_id>', methods=['DELETE'])
@token_required
def delete_question(current_user, question_id):
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    if question.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'error': 'Unauthorized to delete this question'}), 403

    db.session.delete(question)
    db.session.commit()

    return jsonify({'success': f'Question {question.title} deleted successfully'}), 200
