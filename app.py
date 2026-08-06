from flask import Flask, render_template, redirect, url_for, flash, request, make_response, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models import db, User, Resume
from forms import RegistrationForm, LoginForm, ResumeForm
from pdf_parser import parse_pdf_resume
import json
import os
from bs4 import BeautifulSoup
import pdfkit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resume_builder.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# تنظیمات آپلود فایل پروفایل
UPLOAD_FOLDER = 'static/profile_pics'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_json_list(value):
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return []
    return parsed if isinstance(parsed, list) else []


def normalize_resume_data(resume):
    experiences = parse_json_list(resume.experiences)
    educations = parse_json_list(resume.educations)
    skills = parse_json_list(resume.skills)
    certifications = parse_json_list(resume.certifications)
    languages = parse_json_list(resume.languages)

    normalized_experiences = []
    for item in experiences:
        if not isinstance(item, dict):
            continue
        normalized_experiences.append({
            'company': item.get('company', '') or '',
            'position': item.get('position', '') or '',
            'start_date': item.get('start_date', '') or item.get('startDate', '') or '',
            'end_date': item.get('end_date', '') or item.get('endDate', '') or '',
            'description': item.get('description', '') or '',
        })

    normalized_educations = []
    for item in educations:
        if not isinstance(item, dict):
            continue
        normalized_educations.append({
            'degree': item.get('degree', '') or '',
            'field': item.get('field', '') or '',
            'institution': item.get('institution', '') or '',
            'graduation_year': item.get('graduation_year', '') or item.get('year', '') or '',
            'gpa': item.get('gpa', '') or '',
        })

    normalized_skills = []
    for item in skills:
        if isinstance(item, str):
            cleaned = item.strip()
            if cleaned:
                normalized_skills.append(cleaned)
        elif isinstance(item, dict):
            cleaned = item.get('skill') or item.get('name') or ''
            if cleaned:
                normalized_skills.append(str(cleaned))

    normalized_certifications = []
    for item in certifications:
        if not isinstance(item, dict):
            continue
        normalized_certifications.append({
            'name': item.get('name', '') or '',
            'issuer': item.get('issuer', '') or '',
            'year': item.get('year', '') or item.get('startDate', '') or '',
        })

    normalized_languages = []
    for item in languages:
        if not isinstance(item, dict):
            continue
        normalized_languages.append({
            'language': item.get('language', '') or item.get('name', '') or '',
            'proficiency': item.get('proficiency', '') or item.get('level', '') or '',
        })

    return {
        'experiences': normalized_experiences,
        'educations': normalized_educations,
        'skills': normalized_skills,
        'certifications': normalized_certifications,
        'languages': normalized_languages,
    }


def get_resume_template_file(template_name):
    template_map = {
        'modern': 'resume_template_modern.html',
        'classic': 'resume_template_classic.html',
        'creative': 'resume_template_creative.html',
        'professional': 'resume_template_professional.html',
        'executive': 'resume_template_executive.html',
        'safety': 'resume_template_safety.html'
    }

    template_file = template_map.get(template_name, 'resume_template_classic.html')
    if os.path.exists(os.path.join(app.template_folder, template_file)):
        return template_file

    return 'resume_template_classic.html'

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

# ایجاد جداول دیتابیس
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
    
    if request.method == 'POST':
        try:
            first_name = request.form.get('first_name', '').strip()
            last_name = request.form.get('last_name', '').strip()
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            
            if not first_name or not last_name or not email or not password:
                flash('❌ All fields are required!', 'danger')
                return redirect(url_for('register'))
            
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                flash('❌ Email already registered!', 'danger')
                return redirect(url_for('register'))
            
            profile_pic_filename = 'default.jpg'
            if 'profile_pic' in request.files:
                file = request.files['profile_pic']
                if file and file.filename != '' and allowed_file(file.filename):
                    filename = secure_filename(f"{email.split('@')[0]}_{file.filename}")
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    profile_pic_filename = filename
            
            hashed_password = generate_password_hash(password)
            user = User(
                username=email,
                email=email,
                password=hashed_password,
                first_name=first_name,
                last_name=last_name,
                profile_pic=profile_pic_filename
            )
            
            db.session.add(user)
            db.session.commit()
            
            flash('✅ Registration successful! You can now login.', 'success')
            return redirect(url_for('login'))
            
        except Exception as e:
            print(f"❌ Error in registration: {str(e)}")
            flash(f'❌ Error: {str(e)}', 'danger')
            return redirect(url_for('register'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password', 'danger')
    
    return render_template('login.html')

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

@app.route('/my_documents')
@login_required
def my_documents():
    resumes = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.updated_at.desc()).all()
    return render_template('my_documents.html', resumes=resumes)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    first_name = request.form.get('first_name', '').strip()
    last_name = request.form.get('last_name', '').strip()
    email = request.form.get('email', '').strip()
    
    if first_name:
        current_user.first_name = first_name
    if last_name:
        current_user.last_name = last_name
    if email:
        current_user.email = email
        current_user.username = email
    
    if 'profile_pic' in request.files:
        file = request.files['profile_pic']
        if file and file.filename != '' and allowed_file(file.filename):
            if current_user.profile_pic and current_user.profile_pic != 'default.jpg':
                old_path = os.path.join(app.config['UPLOAD_FOLDER'], current_user.profile_pic)
                if os.path.exists(old_path):
                    os.remove(old_path)
            
            filename = secure_filename(f"{current_user.email.split('@')[0]}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            current_user.profile_pic = filename
    
    db.session.commit()
    flash('✅ Profile updated successfully!', 'success')
    return redirect(url_for('profile'))

@app.route('/build_resume_with_templates')
@login_required
def build_resume_with_templates():
    return render_template('build_resume_with_templates.html')

@app.route('/upload_pdf', methods=['POST'])
@login_required
def upload_pdf():
    """Handle PDF resume upload, extract text, and parse into structured data."""
    try:
        if 'pdf_file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'})

        file = request.files['pdf_file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'})

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Please upload a PDF file'})

        # Save temporarily for parsing
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f'temp_pdf_{filename}')
        file.save(temp_path)

        # Parse the PDF
        parsed_data = parse_pdf_resume(temp_path)

        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

        if not parsed_data:
            return jsonify({'success': False, 'error': 'Could not extract text from PDF. The file may be scanned or password-protected.'})

        # Map parsed data to the format expected by the frontend JavaScript
        result = {
            'full_name': parsed_data.get('full_name', ''),
            'job_title': parsed_data.get('job_title', ''),
            'email': parsed_data.get('email', ''),
            'phone': parsed_data.get('phone', ''),
            'address': parsed_data.get('address', ''),
            'about': parsed_data.get('about', ''),
            'experiences': [
                {
                    'company': exp.get('company', ''),
                    'position': exp.get('position', ''),
                    'startDate': exp.get('start_date', ''),
                    'endDate': exp.get('end_date', ''),
                    'description': exp.get('description', '')
                }
                for exp in parsed_data.get('experiences', [])
            ],
            'educations': [
                {
                    'degree': edu.get('degree', ''),
                    'field': edu.get('field', ''),
                    'institution': edu.get('institution', ''),
                    'year': edu.get('graduation_year', '')
                }
                for edu in parsed_data.get('educations', [])
            ],
            'skills': parsed_data.get('skills', []),
            'certifications': [
                {
                    'name': cert.get('name', ''),
                    'issuer': cert.get('issuer', ''),
                    'year': cert.get('year', '')
                }
                for cert in parsed_data.get('certifications', [])
            ],
            'languages': [
                {
                    'name': lang.get('language', ''),
                    'level': lang.get('proficiency', '')
                }
                for lang in parsed_data.get('languages', [])
            ]
        }

        print(f"✅ PDF parsed: {len(result['experiences'])} experiences, "
              f"{len(result['educations'])} educations, "
              f"{len(result['skills'])} skills, "
              f"{len(result['certifications'])} certifications, "
              f"{len(result['languages'])} languages")

        return jsonify({'success': True, 'data': result})

    except Exception as e:
        print(f"❌ Error in upload_pdf: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/save_resume_data', methods=['POST'])
@login_required
def save_resume_data():
    try:
        data = request.get_json()
        
        # اطمینان از اینکه certifications به درستی ذخیره بشه
        certifications_data = data.get('certifications', [])
        # اگر certifications به صورت لیستی از آبجکت‌هاست، همانطور ذخیره کن
        if certifications_data and isinstance(certifications_data, list):
            certifications_json = json.dumps(certifications_data)
        else:
            certifications_json = json.dumps([])
        
        # همین کار برای سایر فیلدها
        experiences_data = data.get('experiences', [])
        educations_data = data.get('educations', [])
        skills_data = data.get('skills', [])
        languages_data = data.get('languages', [])
        
        resume = Resume(
            user_id=current_user.id,
            title=data.get('full_name', 'My Resume') + "'s Resume",
            full_name=data.get('full_name', ''),
            job_title=data.get('job_title', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            address=data.get('address', ''),
            about=data.get('about', ''),
            template=data.get('template', 'classic'),
            experiences=json.dumps(experiences_data),
            educations=json.dumps(educations_data),
            skills=json.dumps(skills_data),
            certifications=certifications_json,  # این خط مهمه
            languages=json.dumps(languages_data)
        )
        
        db.session.add(resume)
        db.session.commit()
        
        # برای دیباگ - چاپ کن ببینیم چی ذخیره شده
        print(f"✅ Saved resume with {len(certifications_data)} certifications")
        for cert in certifications_data:
            print(f"   - {cert.get('name')} at {cert.get('issuer')}")
        
        return jsonify({'success': True, 'resume_id': resume.id})
    except Exception as e:
        print(f"❌ Error in save_resume_data: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/view_resume/<int:resume_id>')
@login_required
def view_resume(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    # استفاده از normalize_resume_data برای تبدیل فیلدهای camelCase به snake_case
    data_context = normalize_resume_data(resume)
    
    # برای دیباگ
    print(f"📄 Viewing resume: {resume.title}")
    print(f"   Certifications found: {len(data_context['certifications'])}")
    for cert in data_context['certifications']:
        print(f"   - {cert}")
    
    template_file = get_resume_template_file(resume.template)
    
    rendered_html = render_template(template_file, 
                         resume=resume, 
                         experiences=data_context['experiences'],
                         educations=data_context['educations'],
                         skills=data_context['skills'],
                         certifications=data_context['certifications'],
                         languages=data_context['languages'])
    
    # تزریق نوار تغییر قالب به صفحه نمایش رزومه
    soup = BeautifulSoup(rendered_html, 'html.parser')
    
    # ایجاد استایل نوار تغییر قالب
    switcher_style = soup.new_tag('style')
    switcher_style.string = """
        .template-switcher-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #436456;
            color: white;
            padding: 10px 20px;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: 'Segoe UI', Tahoma, sans-serif;
        }
        .template-switcher-bar .switcher-label {
            font-weight: 600;
            font-size: 14px;
            margin-right: 5px;
        }
        .template-switcher-bar .template-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid transparent;
            padding: 6px 14px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .template-switcher-bar .template-btn:hover {
            background: rgba(255,255,255,0.35);
            transform: translateY(-1px);
        }
        .template-switcher-bar .template-btn.active {
            background: white;
            color: #436456;
            border-color: white;
            font-weight: 700;
        }
        .template-switcher-bar .switcher-actions {
            margin-left: 15px;
            display: flex;
            gap: 8px;
        }
        .template-switcher-bar .action-btn {
            background: #2c3e32;
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .template-switcher-bar .action-btn:hover {
            background: #1a2e22;
            transform: translateY(-1px);
        }
        .template-switcher-bar .action-btn.danger {
            background: #c0392b;
        }
        .template-switcher-bar .action-btn.danger:hover {
            background: #a93226;
        }
        body {
            padding-top: 60px !important;
        }
        @media (max-width: 768px) {
            .template-switcher-bar {
                padding: 8px 10px;
                gap: 5px;
            }
            .template-switcher-bar .switcher-label {
                font-size: 12px;
            }
            .template-switcher-bar .template-btn {
                padding: 4px 10px;
                font-size: 11px;
            }
            .template-switcher-bar .switcher-actions {
                margin-left: 5px;
                gap: 5px;
            }
        }
    """
    
    # ایجاد نوار تغییر قالب
    templates = [
        ('classic', '📄 Classic'),
        ('modern', '⚡ Modern'),
        ('creative', '🎨 Creative'),
        ('professional', '💼 Professional'),
        ('executive', '🏆 Executive'),
        ('safety', '🦺 Safety')
    ]
    
    switcher_bar = soup.new_tag('div', attrs={'class': 'template-switcher-bar', 'id': 'templateSwitcherBar'})
    
    label = soup.new_tag('span', attrs={'class': 'switcher-label'})
    label.string = '🎨 Template:'
    switcher_bar.append(label)
    
    for tpl_key, tpl_label in templates:
        btn_classes = 'template-btn'
        if resume.template == tpl_key:
            btn_classes += ' active'
        btn = soup.new_tag('button', attrs={
            'class': btn_classes,
            'onclick': f"changeTemplate('{tpl_key}')"
        })
        btn.string = tpl_label
        switcher_bar.append(btn)
    
    # دکمه‌های اکشن
    actions_div = soup.new_tag('div', attrs={'class': 'switcher-actions'})
    
    pdf_link = soup.new_tag('a', attrs={
        'class': 'action-btn',
        'href': f'/download_pdf/{resume.id}'
    })
    pdf_link.string = '📄 PDF'
    actions_div.append(pdf_link)
    
    edit_link = soup.new_tag('a', attrs={
        'class': 'action-btn',
        'href': f'/edit_resume/{resume.id}'
    })
    edit_link.string = '✏️ Edit'
    actions_div.append(edit_link)
    
    back_link = soup.new_tag('a', attrs={
        'class': 'action-btn',
        'href': '/dashboard'
    })
    back_link.string = '← Back'
    actions_div.append(back_link)
    
    switcher_bar.append(actions_div)
    
    # اسکریپت تغییر قالب
    switcher_script = soup.new_tag('script')
    switcher_script.string = """
        function changeTemplate(templateName) {
            fetch('/change_template/""" + str(resume.id) + """', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template: templateName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Error: ' + (data.error || 'Could not change template'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error changing template');
            });
        }
    """
    
    # اضافه کردن به head و body
    if soup.head:
        soup.head.append(switcher_style)
    if soup.body:
        soup.body.insert(0, switcher_bar)
        soup.body.append(switcher_script)
    
    return str(soup)


@app.route('/change_template/<int:resume_id>', methods=['POST'])
@login_required
def change_template(resume_id):
    """Change the template of an existing resume."""
    resume = Resume.query.get_or_404(resume_id)
    
    if resume.user_id != current_user.id:
        return jsonify({'success': False, 'error': 'Access denied'}), 403
    
    data = request.get_json() or {}
    new_template = data.get('template', '').strip()
    
    valid_templates = ['modern', 'classic', 'creative', 'professional', 'executive', 'safety']
    if new_template not in valid_templates:
        return jsonify({'success': False, 'error': 'Invalid template'}), 400
    
    resume.template = new_template
    db.session.commit()
    
    return jsonify({'success': True, 'template': new_template})


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
    
    data_context = normalize_resume_data(resume)
    
    return render_template('resume_form.html', form=form, resume=resume, 
                         experiences=data_context['experiences'], educations=data_context['educations'], 
                         skills=data_context['skills'], certifications=data_context['certifications'], 
                         languages=data_context['languages'])

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

@app.route('/download_pdf/<int:resume_id>')
@login_required
def download_pdf(resume_id):
    resume = Resume.query.get_or_404(resume_id)
    
    if resume.user_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('dashboard'))
    
    data_context = normalize_resume_data(resume)
    
    template_file = get_resume_template_file(resume.template)
    
    rendered_html = render_template(template_file, 
                                   resume=resume, 
                                   experiences=data_context['experiences'],
                                   educations=data_context['educations'],
                                   skills=data_context['skills'],
                                   certifications=data_context['certifications'],
                                   languages=data_context['languages'])
    
    # حذف نوار و فوتر برای PDF
    soup = BeautifulSoup(rendered_html, 'html.parser')
    
    # حذف المنت‌های ناوبری و فوتر
    nav = soup.find('nav')
    if nav:
        nav.decompose()
    
    footer = soup.find('footer')
    if footer:
        footer.decompose()
    
    # حذف هرگونه دکمه یا المنت تعاملی
    for btn in soup.find_all(class_=['btn', 'navbar', 'footer', 'alert', 'nav-link', 'btn-primary', 'btn-secondary']):
        btn.decompose()
    
    # حذف نوار تغییر قالب از PDF
    switcher = soup.find(id='templateSwitcherBar')
    if switcher:
        switcher.decompose()
    for el in soup.find_all(class_='template-switcher-bar'):
        el.decompose()
    
    # افزودن استایل مخصوص PDF - با حفظ استایل‌های اصلی
    style = soup.new_tag('style')
    style.string = """
        @page {
            size: A4;
            margin: 15mm;
        }
        html,
        body {
            width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-family: 'Segoe UI', 'Times New Roman', Arial, sans-serif !important;
        }
        .resume-container,
        .resume-page,
        .container,
        .content-wrap {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 auto !important;
            padding: 20px !important;
            box-shadow: none !important;
            background: white !important;
        }
        .header {
            display: block !important;
            width: 100% !important;
            align-items: flex-start !important;
            flex-wrap: wrap !important;
            gap: 0 !important;
        }
        .profile-image,
        .header-content {
            width: 100% !important;
            max-width: 100% !important;
        }
        .profile-image {
            margin: 0 auto 20px auto !important;
        }
        .contact-info {
            display: block !important;
            width: 100% !important;
            gap: 8px !important;
        }
        .contact-info div {
            display: block !important;
            width: 100% !important;
        }
        .job-titles,
        .full-name,
        .section-title,
        .resume-container,
        .profile-text,
        .education-degree,
        .experience-title,
        .exp-company,
        .exp-description li,
        .skills-list li,
        .certification-item,
        .language-item,
        .additional-item {
            word-break: break-word !important;
            white-space: normal !important;
        }
        .two-columns {
            display: block !important;
            width: 100% !important;
        }
        .two-columns > div {
            display: block !important;
            width: 100% !important;
            padding-right: 0 !important;
        }
        .section,
        .experience-item,
        .education-item,
        .certification-item,
        .entry,
        .resume-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }
        .btn,
        .navbar,
        .footer,
        .alert,
        nav,
        .nav-link,
        .btn-primary,
        .btn-secondary {
            display: none !important;
        }
    """
    
    # اضافه کردن style به head
    if soup.head:
        soup.head.append(style)
    else:
        head = soup.new_tag('head')
        head.append(style)
        soup.html.insert(0, head)
    
    html_for_pdf = str(soup)
    
    options = {
        'page-size': 'A4',
        'margin-top': '15mm',
        'margin-right': '15mm',
        'margin-bottom': '15mm',
        'margin-left': '15mm',
        'encoding': 'UTF-8',
        'no-outline': None,
        'enable-local-file-access': None,
        'print-media-type': None,
        'disable-smart-shrinking': None
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