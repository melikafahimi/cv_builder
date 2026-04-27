# cv_builder
# 📄 Resume Builder Pro

A powerful web-based resume builder application built with Flask that allows users to create, edit, and download professional resumes in multiple templates. Users can sign up, build their resumes with detailed sections, and export them as PDF files.

## ✨ Features

- **User Authentication**: Secure sign-up and login system
- **Multiple Resume Templates**: 6 professionally designed templates
  - Modern (Two Column)
  - Classic
  - Creative
  - Professional
  - Executive (Home Builder Style)
  - Safety Officer (Construction Style)
- **Complete Resume Sections**:
  - Personal Information (Name, Title, Email, Phone, Address)
  - Profile Summary
  - Work Experience (Multiple entries with company, position, dates, description)
  - Education (Degree, field, institution, year, GPA)
  - Skills (Technical and soft skills)
  - Languages (With proficiency levels)
  - Certifications
- **PDF Export**: Download any resume as a professional PDF
- **Dashboard**: Manage all your resumes in one place
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technologies Used

- **Backend**: Flask (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: Flask-Login
- **Forms**: Flask-WTF with WTForms
- **PDF Generation**: pdfkit + wkhtmltopdf
- **Frontend**: Bootstrap 5, Font Awesome icons
- **Template Engine**: Jinja2

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8 or higher
- pip (Python package manager)
- wkhtmltopdf (for PDF generation)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/melikafahimi/resume-builder.git
cd resume-builder
