from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Reports, Question, User, Category  
from datetime import datetime  

reports_bp = Blueprint('reports_bp', __name__, url_prefix='/api')

# Serializer
def serialize_report(report):
    return {
        'id': report.id,
        'user_id': report.user_id,
        'category_id': report.category_id,
        'question_id': report.question_id,
        'reason': report.reason,
        'created_at': report.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
    }

# CREATE a report
@reports_bp.route('/reports', methods=['POST'])
@jwt_required()
def create_report():
    data = request.get_json()
    current_user = get_jwt_identity()

    category_id = data.get('category_id')
    question_id = data.get('question_id')
    reason = data.get('reason')

    if not category_id or not question_id or not reason:
        return jsonify({'message': 'category_id, question_id and reason are required'}), 400

    report = Reports(
        user_id=current_user,
        category_id=category_id,
        question_id=question_id,
        reason=reason
    )

    db.session.add(report)
    db.session.commit()

    return jsonify({'message': 'Report created', 'report': serialize_report(report)}), 201

# GET all reports (admin only)
@reports_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_all_reports():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    reports = Reports.query.order_by(Reports.created_at.desc()).all()
    return jsonify([serialize_report(r) for r in reports]), 200

# GET one report by ID (admin only)
@reports_bp.route('/reports/<int:id>', methods=['GET'])
@jwt_required()
def get_report(id):
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    report = Reports.query.get(id)
    if not report:
        return jsonify({'message': 'Report not found'}), 404

    return jsonify(serialize_report(report)), 200

# UPDATED: UPDATE a report (owner or admin)
@reports_bp.route('/reports/<int:id>', methods=['PUT'])
@jwt_required()
def update_report(id):
    current_user = get_jwt_identity()
    report = Reports.query.get(id)
    if not report:
        return jsonify({'message': 'Report not found'}), 404

    user = User.query.get(current_user)
    if report.user_id != current_user and not user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    report.reason = data.get('reason', report.reason)
    report.category_id = data.get('category_id', report.category_id)

    db.session.commit()
    return jsonify({'message': 'Report updated', 'report': serialize_report(report)}), 200

# DELETE a report (admin or owner)
@reports_bp.route('/reports/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_report(id):
    current_user = get_jwt_identity()
    report = Reports.query.get(id)
    if not report:
        return jsonify({'message': 'Report not found'}), 404

    user = User.query.get(current_user)
    if report.user_id != current_user and not user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(report)
    db.session.commit()
    return jsonify({'message': 'Report deleted'}), 200
