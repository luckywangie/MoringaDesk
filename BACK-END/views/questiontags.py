from flask import Blueprint, request, jsonify
from models import db, QuestionTag

question_tags_bp = Blueprint('question_tags', __name__)

@question_tags_bp.route('/question-tags', methods=['POST'])
def add_question_tag():
    data = request.get_json()
    qt = QuestionTag(
        question_id=data['question_id'],
        tag_id=data['tag_id']
    )
    db.session.add(qt)
    db.session.commit()
    return jsonify({'success': 'Tag added to question', 'id': qt.id}), 201

@question_tags_bp.route('/question-tags/<int:question_id>', methods=['GET'])
def get_question_tags(question_id):
    tags = QuestionTag.query.filter_by(question_id=question_id).all()
    return jsonify([
        {'id': tag.id, 'tag_id': tag.tag_id}
        for tag in tags
    ])

@question_tags_bp.route('/question-tags/<int:id>', methods=['DELETE'])
def delete_question_tag(id):
    qt = QuestionTag.query.get_or_404(id)
    db.session.delete(qt)
    db.session.commit()
    return jsonify({'success': 'Tag removed from question'})