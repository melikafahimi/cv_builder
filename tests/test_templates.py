import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app


def test_missing_professional_template():
    with app.test_request_context():
        assert os.path.exists('templates/resume_template_professional.html') is False


def test_custom_resume_templates_exist():
    expected_templates = [
        'resume_template_professional.html',
        'resume_template_executive.html',
        'resume_template_safety.html',
    ]

    for template_name in expected_templates:
        assert os.path.exists(os.path.join('templates', template_name))
