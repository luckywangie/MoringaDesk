from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db, mail

# Blueprints
from views.auth import auth_bp
from views.question import question_bp
from views.answers import answers_bp
from views.votes import votes_bp
from views.followup import followup_bp
from views.notifications import notification_bp
from views.reports import reports_bp
from views.tags import tags_bp
from views.relatedquestions import related_questions_bp
from views.category import categories_bp
from views.questiontags import questiontags_bp
from views.faqs import faqs_bp
from views import user_bp

def create_app():
    app = Flask(__name__)

    # -------------------- CORS Setup --------------------
    CORS(app,
        resources={r"/api/*": {"origins": "https://funny-sprite-8e31be.netlify.app"}},
        supports_credentials=True
    )

    # -------------------- JWT & Secret Config --------------------
    shared_secret = 'moringa_secret_2025'
    app.config['SECRET_KEY'] = shared_secret
    app.config['JWT_SECRET_KEY'] = shared_secret
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

    # -------------------- Mail Config --------------------
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'devworkzzy@gmail.com'
    app.config['MAIL_PASSWORD'] = 'ikdd hmwo zphg bvws'
    app.config['MAIL_DEFAULT_SENDER'] = ('MoringaDesk Support Team', 'supportteam@moringadesk.com')

    # -------------------- Database --------------------
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://moringadeskdb_user:L7JOySGGEISf79IsdLrnryfvLPk0ce1f@dpg-d1vjk07diees73bnlu9g-a.oregon-postgres.render.com/moringadeskdb'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # -------------------- Initialize Extensions --------------------
    db.init_app(app)
    mail.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    # -------------------- Register Blueprints --------------------
    app.register_blueprint(auth_bp)
    app.register_blueprint(question_bp)
    app.register_blueprint(answers_bp)
    app.register_blueprint(votes_bp)
    app.register_blueprint(followup_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(tags_bp)
    app.register_blueprint(related_questions_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(faqs_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(questiontags_bp)

    # -------------------- Root Endpoint --------------------
    @app.route('/')
    def home():
        return "✅ MoringaDesk Flask API is running!"

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
