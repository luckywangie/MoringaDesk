from models import db, Question
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

question_bp = Blueprint('questions', __name__)

# Get all questions with filters and pagination
@question_bp.route('/api/questions', methods=['GET'])
def get_questions():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 100)
    stage = request.args.get('stage')
    language = request.args.get('language')
    search = request.args.get('search')

    query = Question.query
    if stage:
        query = query.filter(Question.stage == stage)
    if language:
        query = query.filter(Question.language == language)
    if search:
        query = query.filter(
            Question.title.ilike(f"%{search}%") | 
            Question.description.ilike(f"%{search}%")
        )

    questions = query.order_by(Question.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'questions': [{
            'id': q.id,
            'title': q.title,
            'description': q.description,
            'author': q.user.username if q.user else 'Unknown',
            'stage': q.stage,
            'language': q.language,
            'is_solved': q.is_solved,
            'answer_count': len(q.answers),
            'created_at': q.created_at.isoformat()
        } for q in questions.items],
        'total': questions.total,
        'pages': questions.pages,
        'current_page': page
    }), 200

# Create a new question
@question_bp.route('/api/questions', methods=['POST'])
@jwt_required()
def create_question():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('title') or not data.get('description'):
        return jsonify({"error": "Title and description are required"}), 400

    question = Question(
        title=data['title'],
        description=data['description'],
        user_id=user_id,
        stage=data.get('stage'),
        language=data.get('language')
    )
    db.session.add(question)
    db.session.commit()

    return jsonify({
        'id': question.id,
        'title': question.title,
        'description': question.description,
        'author': question.user.username if question.user else 'Unknown',
        'stage': question.stage,
        'language': question.language,
        'is_solved': question.is_solved,
        'created_at': question.created_at.isoformat()
    }), 201

# Get question by ID
@question_bp.route('/api/questions/<int:question_id>', methods=['GET'])
def get_question_by_id(question_id):
    question = Question.query.get_or_404(question_id)

    return jsonify({
        'id': question.id,
        'title': question.title,
        'description': question.description,
        'author': question.user.username if question.user else 'Unknown',
        'stage': question.stage,
        'language': question.language,
        'is_solved': question.is_solved,
        'created_at': question.created_at.isoformat(),
        'answers': [{
            'id': a.id,
            'content': a.content[:100] + '...' if len(a.content) > 150 else a.content,
            'author': a.user.username if a.user else 'Unknown',
            'created_at': a.created_at.isoformat()
        } for a in question.answers]
    }), 200

# Update question
@question_bp.route('/api/questions/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    user_id = get_jwt_identity()
    question = Question.query.get_or_404(question_id)

    if question.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    question.title = data.get('title', question.title)
    question.description = data.get('description', question.description)
    question.stage = data.get('stage', question.stage)
    question.language = data.get('language', question.language)
    question.updated_at = datetime.utcnow()

    db.session.commit()
    return jsonify({'success': "Question updated successfully"}), 200

# Delete question
@question_bp.route('/api/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    user_id = get_jwt_identity()
    question = Question.query.get_or_404(question_id)

    if question.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(question)
    db.session.commit()
    return jsonify({"success": "Question deleted successfully"}), 200
