from models import db, User, Question, Answers, Category
from app import app  # Make sure app is defined and configured in app.py
from werkzeug.security import generate_password_hash

with app.app_context():
    # Drop and recreate all tables
    db.drop_all()
    db.create_all()

    # Seed categories
    category1 = Category(category_name="Backend", created_by="admin")
    category2 = Category(category_name="Frontend", created_by="admin")

    db.session.add_all([category1, category2])
    db.session.commit()

    # Seed users
    user1 = User(
        username="john_doe",
        email="john@example.com",
        password=generate_password_hash("password123")
    )

    user2 = User(
        username="jane_doe",
        email="jane@example.com",
        password=generate_password_hash("password456")
    )

    db.session.add_all([user1, user2])
    db.session.commit()

    # Seed questions
    q1 = Question(
        title="How to use Flask with SQLAlchemy?",
        description="I need help setting up Flask with SQLAlchemy for a simple app.",
        category_id=category1.id,
        user_id=user1.id,
        language="Python"
    )

    db.session.add(q1)
    db.session.commit()

    # Seed answers
    a1 = Answers(
        question_id=q1.id,
        user_id=user2.id,
        content="You can start by initializing SQLAlchemy with your app instance."
    )

    db.session.add(a1)
    db.session.commit()

    print("✅ Seeded database successfully.")
