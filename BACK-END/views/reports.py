# reports.py

from flask import Blueprint, request, jsonify
from models import db, Reports, Category, User
from views.auth import token_required

reports_bp = Blueprint('reports', __name__, url_prefix='/reports')


# Student reports a category 
@reports_bp.route('/', methods=['POST'])
@token_required
def create_report(current_user):
    data = request.get_json()
    category_id = data.get('category_id')

    if not category_id:
        return jsonify({'error': 'Category ID is required'}), 400

    category = Category.query.get(category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    report = Reports(user_id=current_user.id, category_id=category_id)
    db.session.add(report)
    db.session.commit()

    return jsonify({'message': 'Report submitted successfully'}), 201


# Admin view all reports
@reports_bp.route('/', methods=['GET'])
@token_required
def get_all_reports(current_user):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403

    reports = Reports.query.all()
    response = []

    for r in reports:
        reporter = User.query.get(r.user_id)
        category = Category.query.get(r.category_id)
        response.append({
            'report_id': r.id,
            'reported_by': reporter.username if reporter else 'Unknown',
            'category': category.category_name if category else 'Unknown',
        })

    return jsonify(response), 200


# Admin deletes a report
@reports_bp.route('/<int:report_id>', methods=['DELETE'])
@token_required
def delete_report(current_user, report_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403

    report = Reports.query.get(report_id)
    if not report:
        return jsonify({'error': 'Report not found'}), 404

    db.session.delete(report)
    db.session.commit()

    return jsonify({'message': 'Report deleted'}), 200
