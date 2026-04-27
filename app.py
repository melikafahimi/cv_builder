from flask import Flask, render_template, redirect, url_for, flash, request, make_response
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Resume
from forms import RegistrationForm, LoginForm, ResumeForm
import json
import os
from bs4 import BeautifulSoup
import pdfkit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resume_builder.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please login to access this page'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# مسیر wkhtmltopdf برای ویندوز
WKHTMLTOPDF_PATH = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
if os.path.exists(WKHTMLTOPDF_PATH):
    config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)
    print("✅ wkhtmltopdf found at:", WKHTMLTOPDF_PATH)
else:
    config = None
    print("⚠️ Warning: wkhtmltopdf not found at:", WKHTMLTOPDF_PATH)
    print("   Please install wkhtmltopdf from: https://wkhtmltopdf.org/downloads.html")

# Create database tables
with app.app_context():
    db.create_all()
    print("✅ Database created successfully!")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        existing_user = User.query.filter_by(email=form.email.data).first()
        if existing_user:
            flash('Email already registered!', 'danger')
            return redirect(url_for('register'))
        
        hashed_password = generate_password_hash(form.password.data)
        user = User(
            username=form.username.data,
            email=form.email.data,
            password=hashed_password
        )
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! You can now login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password', 'danger')
    
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    resumes = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.updated_at.desc()).all()
    return render_template('dashboard.html', resumes=resumes)

@app.route('/create_resume', methods=['GET', 'POST'])
@login_required
def create_resume():
    form = ResumeForm()
    
    if form.validate_on_submit():
        resume = Resume(
            user_id=current_user.id,
            title=form.title.data if form.title.data else f"{form.full_name.data}'s Resume",
            full_name=form.full_name.data,
            job_title=form.job_title.data,
            email=form.email.data,
            phone=form.phone.data or '',
            address=form.address.data or '',
            about=form.about.data or '',
            template=form.template.data
        )
        db.session.add(resume)
        db.session.commit()
        
        flash('Resume created successfully!', 'success')
        return redirect(url_for('edit_resume', resume_id=resume.id))
    
    return render_template('resume_form.html', form=form, resume=None, 
                         experiences=[], educations=[], skills=[], certifications=[], languages=[])

@app.route('/edit_resume/<int:resume_id>', methods=['GET', 'POST'])
@login_required
def edit_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    form = ResumeForm()
    
    if request.method == 'GET':
        form.title.data = resume.title
        form.full_name.data = resume.full_name
        form.job_title.data = resume.job_title
        form.email.data = resume.email
        form.phone.data = resume.phone
        form.address.data = resume.address
        form.about.data = resume.about
        form.template.data = resume.template
    
    if form.validate_on_submit():
        resume.title = form.title.data
        resume.full_name = form.full_name.data
        resume.job_title = form.job_title.data
        resume.email = form.email.data
        resume.phone = form.phone.data or ''
        resume.address = form.address.data or ''
        resume.about = form.about.data or ''
        resume.template = form.template.data
        
        db.session.commit()
        flash('Resume updated successfully!', 'success')
        return redirect(url_for('dashboard'))
    
    experiences = json.loads(resume.experiences) if resume.experiences else []
    educations = json.loads(resume.educations) if resume.educations else []
    skills = json.loads(resume.skills) if resume.skills else []
    certifications = json.loads(resume.certifications) if resume.certifications else []
    languages = json.loads(resume.languages) if resume.languages else []
    
    return render_template('resume_form.html', form=form, resume=resume, 
                         experiences=experiences, educations=educations, 
                         skills=skills, certifications=certifications, 
                         languages=languages)

@app.route('/add_experience/<int:resume_id>', methods=['POST'])
@login_required
def add_experience(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    experiences = json.loads(resume.experiences) if resume.experiences else []
    
    new_exp = {
        'company': request.form.get('company', ''),
        'position': request.form.get('position', ''),
        'start_date': request.form.get('start_date', ''),
        'end_date': request.form.get('end_date', ''),
        'description': request.form.get('description', '')
    }
    
    experiences.append(new_exp)
    resume.experiences = json.dumps(experiences)
    db.session.commit()
    flash('Work experience added!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/delete_experience/<int:resume_id>/<int:exp_index>')
@login_required
def delete_experience(resume_id, exp_index):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    experiences = json.loads(resume.experiences) if resume.experiences else []
    if 0 <= exp_index < len(experiences):
        experiences.pop(exp_index)
        resume.experiences = json.dumps(experiences)
        db.session.commit()
        flash('Experience deleted!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/add_education/<int:resume_id>', methods=['POST'])
@login_required
def add_education(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    educations = json.loads(resume.educations) if resume.educations else []
    
    new_edu = {
        'degree': request.form.get('degree', ''),
        'field': request.form.get('field', ''),
        'institution': request.form.get('institution', ''),
        'graduation_year': request.form.get('graduation_year', ''),
        'gpa': request.form.get('gpa', '')
    }
    
    educations.append(new_edu)
    resume.educations = json.dumps(educations)
    db.session.commit()
    flash('Education added!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/delete_education/<int:resume_id>/<int:edu_index>')
@login_required
def delete_education(resume_id, edu_index):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    educations = json.loads(resume.educations) if resume.educations else []
    if 0 <= edu_index < len(educations):
        educations.pop(edu_index)
        resume.educations = json.dumps(educations)
        db.session.commit()
        flash('Education deleted!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/add_skill/<int:resume_id>', methods=['POST'])
@login_required
def add_skill(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    skills = json.loads(resume.skills) if resume.skills else []
    skill = request.form.get('skill', '')
    
    if skill:
        skills.append(skill)
        resume.skills = json.dumps(skills)
        db.session.commit()
        flash('Skill added!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/delete_skill/<int:resume_id>/<int:skill_index>')
@login_required
def delete_skill(resume_id, skill_index):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    skills = json.loads(resume.skills) if resume.skills else []
    if 0 <= skill_index < len(skills):
        skills.pop(skill_index)
        resume.skills = json.dumps(skills)
        db.session.commit()
        flash('Skill deleted!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/add_language/<int:resume_id>', methods=['POST'])
@login_required
def add_language(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    languages = json.loads(resume.languages) if resume.languages else []
    
    new_lang = {
        'language': request.form.get('language', ''),
        'proficiency': request.form.get('proficiency', '')
    }
    
    languages.append(new_lang)
    resume.languages = json.dumps(languages)
    db.session.commit()
    flash('Language added!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/delete_language/<int:resume_id>/<int:lang_index>')
@login_required
def delete_language(resume_id, lang_index):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    languages = json.loads(resume.languages) if resume.languages else []
    if 0 <= lang_index < len(languages):
        languages.pop(lang_index)
        resume.languages = json.dumps(languages)
        db.session.commit()
        flash('Language deleted!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/add_certification/<int:resume_id>', methods=['POST'])
@login_required
def add_certification(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    certifications = json.loads(resume.certifications) if resume.certifications else []
    
    new_cert = {
        'name': request.form.get('cert_name', ''),
        'issuer': request.form.get('issuer', ''),
        'year': request.form.get('year', '')
    }
    
    certifications.append(new_cert)
    resume.certifications = json.dumps(certifications)
    db.session.commit()
    flash('Certification added!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/delete_certification/<int:resume_id>/<int:cert_index>')
@login_required
def delete_certification(resume_id, cert_index):
    resume = Resume.query.get_or_404(resume_id)
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    certifications = json.loads(resume.certifications) if resume.certifications else []
    if 0 <= cert_index < len(certifications):
        certifications.pop(cert_index)
        resume.certifications = json.dumps(certifications)
        db.session.commit()
        flash('Certification deleted!', 'success')
    return redirect(url_for('edit_resume', resume_id=resume_id))

@app.route('/view_resume/<int:resume_id>')
@login_required
def view_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    experiences = json.loads(resume.experiences) if resume.experiences else []
    educations = json.loads(resume.educations) if resume.educations else []
    skills = json.loads(resume.skills) if resume.skills else []
    certifications = json.loads(resume.certifications) if resume.certifications else []
    languages = json.loads(resume.languages) if resume.languages else []
    
    template_map = {
        'modern': 'resume_template_modern.html',
        'classic': 'resume_template_classic.html',
        'creative': 'resume_template_creative.html',
        'professional': 'resume_template_professional.html',
        'executive': 'resume_template_executive.html',
        'safety': 'resume_template_safety.html'
    }
    
    template_file = template_map.get(resume.template, 'resume_template_modern.html')
    
    return render_template(template_file, 
                         resume=resume, 
                         experiences=experiences,
                         educations=educations,
                         skills=skills,
                         certifications=certifications,
                         languages=languages)

@app.route('/download_pdf/<int:resume_id>')
@login_required
def download_pdf(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    experiences = json.loads(resume.experiences) if resume.experiences else []
    educations = json.loads(resume.educations) if resume.educations else []
    skills = json.loads(resume.skills) if resume.skills else []
    certifications = json.loads(resume.certifications) if resume.certifications else []
    languages = json.loads(resume.languages) if resume.languages else []
    
    template_map = {
        'modern': 'resume_template_modern.html',
        'classic': 'resume_template_classic.html',
        'creative': 'resume_template_creative.html',
    }
    
    template_file = template_map.get(resume.template, 'resume_template_modern.html')
    
    rendered_html = render_template(template_file, 
                                   resume=resume, 
                                   experiences=experiences,
                                   educations=educations,
                                   skills=skills,
                                   certifications=certifications,
                                   languages=languages)
    
    # Remove navbar and footer for PDF
    soup = BeautifulSoup(rendered_html, 'html.parser')
    
    nav = soup.find('nav')
    if nav:
        nav.decompose()
    
    footer = soup.find('footer')
    if footer:
        footer.decompose()
    
    # Add PDF-specific styles
    style = soup.new_tag('style')
    style.string = """
        @page {
            size: A4;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        .container {
            margin: 0;
            padding: 0;
            max-width: 100%;
        }
        .modern-resume-v2, .classic-resume, .creative-resume, 
        .professional-resume, .executive-resume, .safety-resume {
            margin: 0;
            padding: 0;
            max-width: 100%;
            box-shadow: none;
        }
        .btn, .navbar, .footer, .alert {
            display: none !important;
        }
    """
    soup.head.append(style)
    
    html_for_pdf = str(soup)
    
    options = {
        'page-size': 'A4',
        'margin-top': '0mm',
        'margin-right': '0mm',
        'margin-bottom': '0mm',
        'margin-left': '0mm',
        'encoding': 'UTF-8',
        'no-outline': None,
        'enable-local-file-access': None
    }
    
    try:
        if config:
            pdf = pdfkit.from_string(html_for_pdf, False, options=options, configuration=config)
        else:
            flash('PDF generation not available. wkhtmltopdf not installed.', 'danger')
            return redirect(url_for('view_resume', resume_id=resume.id))
        
        response = make_response(pdf)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename={resume.full_name.replace(" ", "_")}_Resume.pdf'
        
        return response
    except Exception as e:
        print(f"PDF Error: {str(e)}")
        flash(f'PDF generation error: {str(e)}', 'danger')
        return redirect(url_for('view_resume', resume_id=resume.id))

@app.route('/delete_resume/<int:resume_id>')
@login_required
def delete_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    db.session.delete(resume)
    db.session.commit()
    flash('Resume deleted successfully!', 'success')
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(debug=True)