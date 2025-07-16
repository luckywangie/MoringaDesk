from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from models import db  
from views.auth import auth_bp

# Factory function for the Flask application
def create_app():
    app = Flask(__name__)
    CORS(app)  # Allow cross-origin requests from frontend

    # Configurations
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # Change to PostgreSQL/MySQL URI in production
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize database and migrations
    db.init_app(app)
    migrate = Migrate(app, db)

    # Register the auth blueprint
    app.register_blueprint(auth_bp)

    # Example root route
    @app.route('/')
    def home():
        return "Flask App with SQLAlchemy and Google Auth is running!"

    return app

# Allow running the app directly with `python app.py`
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
