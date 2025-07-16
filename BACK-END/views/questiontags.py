from flask import Blueprint, request, jsonify
from models import db, QuestionTags
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError

question_tags_bp = Blueprint('question_tags', __name__)

# Create a new question-tag association
@question_tags_bp.route('/api/question-tags', methods=['POST'])
@jwt_required()
def add_question_tag():
    data = request.get_json()

    if not data or 'question_id' not in data or 'tag_id' not in data:
        return jsonify({'error': 'question_id and tag_id are required'}), 400

    # Prevent duplicates
    existing = QuestionTags.query.filter_by(
        question_id=data['question_id'], tag_id=data['tag_id']
    ).first()
    if existing:
        return jsonify({'error': 'This tag is already associated with the question'}), 409

    try:
        qt = QuestionTags(
            question_id=data['question_id'],
            tag_id=data['tag_id']
        )
        db.session.add(qt)
        db.session.commit()
        return jsonify({'success': 'Tag added to question', 'id': qt.id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Invalid question_id or tag_id'}), 400

# Get all tags associated with a question
@question_tags_bp.route('/api/question-tags/<int:question_id>', methods=['GET'])
def get_question_tags(question_id):
    tags = QuestionTags.query.filter_by(question_id=question_id).all()
    return jsonify([
        {'id': tag.id, 'tag_id': tag.tag_id}
        for tag in tags
    ]), 200

# Delete a question-tag association by ID
@question_tags_bp.route('/api/question-tags/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_question_tag(id):
    qt = QuestionTags.query.get_or_404(id)
    db.session.delete(qt)
    db.session.commit()
    return jsonify({'success': 'Tag removed from question'}), 200
