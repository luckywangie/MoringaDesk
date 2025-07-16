from flask import Blueprint, request, jsonify
from models import db, QuestionTags  # Corrected import
from views.auth import token_required  # If you want to protect routes

question_tags_bp = Blueprint('question_tags', __name__)

# Create a new question-tag association
@question_tags_bp.route('/question-tags', methods=['POST'])
@token_required  # Optional: Remove if public
def add_question_tag():
    data = request.get_json()
    qt = QuestionTags(
        question_id=data['question_id'],
        tag_id=data['tag_id']
    )
    db.session.add(qt)
    db.session.commit()
    return jsonify({'success': 'Tag added to question', 'id': qt.id}), 201

# Get all tags associated with a question
@question_tags_bp.route('/question-tags/<int:question_id>', methods=['GET'])
def get_question_tags(question_id):
    tags = QuestionTags.query.filter_by(question_id=question_id).all()
    return jsonify([
        {'id': tag.id, 'tag_id': tag.tag_id}
        for tag in tags
    ])

# Delete a question-tag association by ID
@question_tags_bp.route('/question-tags/<int:id>', methods=['DELETE'])
@token_required  # Optional: Remove if public
def delete_question_tag(id):
    qt = QuestionTags.query.get_or_404(id)
    db.session.delete(qt)
    db.session.commit()
    return jsonify({'success': 'Tag removed from question'})
