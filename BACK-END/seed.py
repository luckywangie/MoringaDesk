from app import create_app
from models import db, User, Question, Answers, Category, Tags, QuestionTags, FAQs
from werkzeug.security import generate_password_hash
from datetime import datetime

app = create_app()

with app.app_context():
    # Drop all existing tables and recreate them
    db.drop_all()
    db.create_all()

    # Sample users
    user1 = User(
        username="testuser1",
        email="user1@example.com",
        password=generate_password_hash("password123"),
        is_admin=False
    )
    user2 = User(
        username="adminuser",
        email="admin@example.com",
        password=generate_password_hash("adminpass"),
        is_admin=True
    )

    db.session.add_all([user1, user2])
    db.session.commit()

    # Sample categories
    cat1 = Category(category_name="Python", created_by=user2.username)
    cat2 = Category(category_name="React", created_by=user2.username)
    db.session.add_all([cat1, cat2])
    db.session.commit()

    # Sample questions
    q1 = Question(
        title="How to use list comprehensions?",
        description="I need help understanding Python list comprehensions.",
        category_id=cat1.id,
        user_id=user1.id,
        language="Python"
    )

    q2 = Question(
        title="How to use useState in React?",
        description="I am trying to manage state in a functional component.",
        category_id=cat2.id,
        user_id=user2.id,
        language="JavaScript"
    )

    db.session.add_all([q1, q2])
    db.session.commit()

    # Sample answers
    a1 = Answers(
        question_id=q1.id,
        content="You can use [x for x in iterable if condition].",
        user_id=user2.id,
        is_approved=True
    )

    a2 = Answers(
        question_id=q2.id,
        content="Try using useState like this: const [state, setState] = useState(0);",
        user_id=user1.id,
        is_approved=True
    )

    db.session.add_all([a1, a2])
    db.session.commit()

    # Sample tags
    tag1 = Tags(name="beginner", type="difficulty")
    tag2 = Tags(name="state", type="react")
    db.session.add_all([tag1, tag2])
    db.session.commit()

    # Question-Tags relationship
    qt1 = QuestionTags(question_id=q1.id, tag_id=tag1.id)
    qt2 = QuestionTags(question_id=q2.id, tag_id=tag2.id)
    db.session.add_all([qt1, qt2])
    db.session.commit()

    # Sample FAQ
    faq1 = FAQs(
        question="How do I reset my password?",
        answer="Go to your profile settings and click 'Reset Password'.",
        category="Account",
        created_by=user2.id
    )
    db.session.add(faq1)
    db.session.commit()

    print("✅ Database seeded successfully!")
