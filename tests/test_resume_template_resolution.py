import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app, db, User, Resume
from werkzeug.security import generate_password_hash


class ResumeTemplateResolutionTests(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI='sqlite:///:memory:')
        self.client = app.test_client()

        with app.app_context():
            db.drop_all()
            db.create_all()
            user = User(
                username='test@example.com',
                email='test@example.com',
                password=generate_password_hash('123456'),
                first_name='Test',
                last_name='User',
            )
            db.session.add(user)
            db.session.commit()

            resume = Resume(
                user_id=user.id,
                title='Test Resume',
                full_name='Test User',
                job_title='Developer',
                email='test@example.com',
                phone='123456',
                address='Tehran',
                about='A short summary',
                template='professional',
                experiences='[]',
                educations='[]',
                skills='[]',
                certifications='[]',
                languages='[]',
            )
            db.session.add(resume)
            db.session.commit()

    def test_professional_template_renders_without_error(self):
        with self.client.session_transaction() as session:
            session['_user_id'] = '1'
            session['_fresh'] = True

        response = self.client.get('/view_resume/1')
        self.assertEqual(response.status_code, 200)
        body = response.get_data(as_text=True)
        self.assertIn('Profile Summary', body)


if __name__ == '__main__':
    unittest.main()
