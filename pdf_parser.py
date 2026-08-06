"""
PDF Resume Parser Module
Extracts and parses resume information from PDF files.
"""
import re
import os
from pypdf import PdfReader


# ---------- Section header patterns (case-insensitive) ----------
SECTION_PATTERNS = {
    'experience': re.compile(
        r'^(work\s+)?experience|employment\s+history|professional\s+experience|'
        r'career\s+history|work\s+history|experience\s+history|work\s+background',
        re.IGNORECASE
    ),
    'education': re.compile(
        r'^education|academic|educational\s+background|study|qualifications|'
        r'academic\s+background',
        re.IGNORECASE
    ),
    'skills': re.compile(
        r'^skills|technical\s+skills|core\s+competencies|competencies|expertise|'
        r'skills\s+&',
        re.IGNORECASE
    ),
    'certifications': re.compile(
        r'^certifications?|certification|licenses?|certifications',
        re.IGNORECASE
    ),
    'languages': re.compile(
        r'^languages?',
        re.IGNORECASE
    ),
    'summary': re.compile(
        r'^summary|profile|about|professional\s+summary|objective|overview|'
        r'career\s+summary|personal\s+profile',
        re.IGNORECASE
    ),
}

# ---------- Contact info patterns ----------
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b')
PHONE_PATTERN = re.compile(
    r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
)

# ---------- Date patterns ----------
MONTH_NAMES = r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|' \
              r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
DATE_PATTERN = re.compile(
    rf'\b{MONTH_NAMES}\s+\d{{4}}\b|\b\d{{4}}\b|\b\d{{1,2}}/\d{{4}}\b|\b\d{{4}}-\d{{4}}\b|Present',
    re.IGNORECASE
)

# Pattern to extract full date ranges (e.g., "Jan 2020 - Present", "2015 - 2017")
DATE_RANGE_PATTERN = re.compile(
    rf'({MONTH_NAMES}\s+\d{{4}}|\d{{4}}|\d{{1,2}}/\d{{4}})\s*[-–—]\s*(Present|{MONTH_NAMES}\s+\d{{4}}|\d{{4}}|\d{{1,2}}/\d{{4}})',
    re.IGNORECASE
)


def extract_text_from_pdf(file_path):
    """Extract text content from a PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"
        return text
    except Exception as e:
        print(f"❌ Error extracting PDF text: {e}")
        return ""


def clean_text(text):
    """Clean and normalize extracted text."""
    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Remove extra blank lines
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped:
            cleaned_lines.append(stripped)
    return cleaned_lines


def detect_section(line):
    """Detect if a line is a section header. Returns section name or None."""
    for section_name, pattern in SECTION_PATTERNS.items():
        if pattern.match(line):
            return section_name
    return None


def extract_contact_info(lines):
    """Extract email and phone from a list of lines."""
    email = ""
    phone = ""
    for line in lines:
        if not email:
            match = EMAIL_PATTERN.search(line)
            if match:
                email = match.group(0)
        if not phone:
            match = PHONE_PATTERN.search(line)
            if match:
                phone = match.group(0)
    return email, phone


def extract_name(lines):
    """Try to extract the person's name from the first few lines."""
    for line in lines[:5]:
        # Name is typically 2-4 words, each starting with uppercase
        words = line.split()
        if 2 <= len(words) <= 4:
            if all(w[0].isupper() for w in words if w):
                # Make sure it doesn't look like an email or address
                if '@' not in line and not any(c.isdigit() for c in line):
                    return line
    # Fallback: return the first non-empty line
    for line in lines[:5]:
        if line and '@' not in line:
            return line
    return ""


def extract_job_title(lines, name):
    """Try to extract job title from lines after the name."""
    for i, line in enumerate(lines[:10]):
        if line == name:
            # Check the next line
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                # Job title is typically short, title case, no email/phone
                if '@' not in next_line and not PHONE_PATTERN.search(next_line):
                    words = next_line.split()
                    if 1 <= len(words) <= 6:
                        return next_line
    return ""


def extract_address(lines):
    """Try to extract address from lines."""
    for line in lines[:10]:
        # Look for address pattern: comma followed by 2-letter state abbreviation
        if re.search(r',\s*[A-Z]{2}\b', line):
            # If the line also has email or phone, extract the address part
            if EMAIL_PATTERN.search(line) or PHONE_PATTERN.search(line):
                if '|' in line:
                    parts = line.split('|')
                    for part in reversed(parts):
                        part = part.strip()
                        if re.search(r',\s*[A-Z]{2}\b', part):
                            return part
                # Try to remove email and phone from the line
                cleaned = EMAIL_PATTERN.sub('', line)
                cleaned = PHONE_PATTERN.sub('', cleaned)
                cleaned = re.sub(r'\s*\|\s*', '', cleaned).strip()
                if re.search(r',\s*[A-Z]{2}\b', cleaned):
                    return cleaned
            else:
                return line
    return ""


def parse_experience(lines):
    """Parse work experience entries from lines."""
    experiences = []
    current_entry = None

    for line in lines:
        # Check if this line starts a new entry (has a date)
        date_match = DATE_PATTERN.search(line)

        if date_match and current_entry:
            # This line has a date, it might be a new entry or continuation
            # Check if it looks like a new entry (has company/position info)
            if '|' in line or date_match.start() < len(line) * 0.5:
                # Save previous entry
                experiences.append(current_entry)
                current_entry = None

        if current_entry is None:
            # Start a new entry
            current_entry = {
                'company': '',
                'position': '',
                'start_date': '',
                'end_date': '',
                'description': ''
            }

        # Try to extract date range using DATE_RANGE_PATTERN first
        range_match = DATE_RANGE_PATTERN.search(line)
        if range_match:
            current_entry['start_date'] = range_match.group(1).strip()
            current_entry['end_date'] = range_match.group(2).strip()
        elif date_match:
            date_str = date_match.group(0)
            # Try to split into start and end dates
            if '-' in date_str or '–' in date_str or '—' in date_str:
                parts = re.split(r'[-–—]', date_str)
                if len(parts) >= 2:
                    current_entry['start_date'] = parts[0].strip()
                    current_entry['end_date'] = parts[1].strip()
                else:
                    current_entry['start_date'] = date_str
            else:
                current_entry['start_date'] = date_str

        # Try to identify position and company
        if not current_entry['position']:
            # Check if line has a separator like | or -
            if '|' in line:
                parts = line.split('|')
                if len(parts) >= 2:
                    current_entry['position'] = parts[0].strip()
                    current_entry['company'] = parts[1].strip()
                    # Check if there's a third part with dates
                    if len(parts) >= 3:
                        date_part = parts[2].strip()
                        range_match = DATE_RANGE_PATTERN.search(date_part)
                        if range_match:
                            current_entry['start_date'] = range_match.group(1).strip()
                            current_entry['end_date'] = range_match.group(2).strip()
            elif ' – ' in line or ' - ' in line:
                parts = re.split(r'\s*[–-]\s*', line, maxsplit=1)
                if len(parts) >= 2:
                    current_entry['position'] = parts[0].strip()
                    current_entry['company'] = parts[1].strip()
            else:
                # Assume it's a position or company
                if not current_entry['company']:
                    current_entry['position'] = line
                else:
                    current_entry['company'] = line
        else:
            # Add to description
            if current_entry['description']:
                current_entry['description'] += ' ' + line
            else:
                current_entry['description'] = line

    if current_entry:
        experiences.append(current_entry)

    # Filter out empty entries
    experiences = [e for e in experiences if e['position'] or e['company']]
    return experiences


def parse_education(lines):
    """Parse education entries from lines."""
    educations = []
    current_entry = None

    for line in lines:
        date_match = DATE_PATTERN.search(line)

        if date_match and current_entry:
            # New entry likely
            if '|' in line or date_match.start() < len(line) * 0.5:
                educations.append(current_entry)
                current_entry = None

        if current_entry is None:
            current_entry = {
                'degree': '',
                'field': '',
                'institution': '',
                'graduation_year': '',
                'gpa': ''
            }

        # Try to extract date range using DATE_RANGE_PATTERN first
        range_match = DATE_RANGE_PATTERN.search(line)
        if range_match:
            current_entry['graduation_year'] = range_match.group(1).strip()
        elif date_match:
            year_match = re.search(r'\b\d{4}\b', date_match.group(0))
            if year_match:
                current_entry['graduation_year'] = year_match.group(0)

        # Try to identify degree and institution
        if not current_entry['degree']:
            if '|' in line:
                parts = line.split('|')
                if len(parts) >= 2:
                    current_entry['degree'] = parts[0].strip()
                    current_entry['institution'] = parts[1].strip()
                    # Check if there's a third part with dates
                    if len(parts) >= 3:
                        date_part = parts[2].strip()
                        range_match = DATE_RANGE_PATTERN.search(date_part)
                        if range_match:
                            current_entry['graduation_year'] = range_match.group(1).strip()
            elif ' – ' in line or ' - ' in line:
                parts = re.split(r'\s*[–-]\s*', line, maxsplit=1)
                if len(parts) >= 2:
                    current_entry['degree'] = parts[0].strip()
                    current_entry['institution'] = parts[1].strip()
            else:
                current_entry['degree'] = line
        else:
            if not current_entry['institution']:
                current_entry['institution'] = line

    if current_entry:
        educations.append(current_entry)

    # Filter out empty entries
    educations = [e for e in educations if e['degree'] or e['institution']]
    return educations


def parse_skills(lines):
    """Parse skills from lines."""
    skills = []
    for line in lines:
        # Split by common delimiters
        if ',' in line:
            parts = [s.strip() for s in line.split(',') if s.strip()]
            skills.extend(parts)
        elif ' • ' in line or '·' in line:
            parts = re.split(r'\s*[•·]\s*', line)
            parts = [s.strip() for s in parts if s.strip()]
            skills.extend(parts)
        else:
            skill = line.strip()
            if skill:
                skills.append(skill)

    # Remove duplicates while preserving order
    seen = set()
    unique_skills = []
    for s in skills:
        if s.lower() not in seen:
            seen.add(s.lower())
            unique_skills.append(s)

    return unique_skills


def parse_certifications(lines):
    """Parse certifications from lines."""
    certifications = []
    for line in lines:
        cert = {
            'name': '',
            'issuer': '',
            'year': ''
        }

        # Try to extract year
        year_match = re.search(r'\b(20|19)\d{2}\b', line)
        if year_match:
            cert['year'] = year_match.group(0)

        # Try to split by separator
        if '|' in line:
            parts = line.split('|')
            cert['name'] = parts[0].strip()
            if len(parts) > 1:
                cert['issuer'] = parts[1].strip()
        elif ' – ' in line or ' - ' in line:
            parts = re.split(r'\s*[–-]\s*', line, maxsplit=1)
            cert['name'] = parts[0].strip()
            if len(parts) > 1:
                cert['issuer'] = parts[1].strip()
        else:
            cert['name'] = line

        if cert['name']:
            certifications.append(cert)

    return certifications


def parse_single_language(text):
    """Parse a single language entry from text."""
    lang = {
        'language': '',
        'proficiency': ''
    }

    # Try to extract language and proficiency from parentheses
    # Format: "Language (Proficiency)"
    paren_match = re.match(r'^([^(]+)\(([^)]+)\)', text)
    if paren_match:
        lang['language'] = paren_match.group(1).strip()
        lang['proficiency'] = paren_match.group(2).strip()
    elif ' - ' in text:
        sub_parts = text.split(' - ')
        lang['language'] = sub_parts[0].strip()
        if len(sub_parts) > 1:
            lang['proficiency'] = sub_parts[1].strip()
    else:
        lang['language'] = text

    if lang['language']:
        return lang
    return None


def parse_languages(lines):
    """Parse languages from lines."""
    languages = []
    for line in lines:
        # Split by | first to handle multiple languages on one line
        if '|' in line:
            parts = line.split('|')
            for part in parts:
                part = part.strip()
                if part:
                    lang = parse_single_language(part)
                    if lang:
                        languages.append(lang)
        else:
            lang = parse_single_language(line)
            if lang:
                languages.append(lang)

    return languages


def parse_summary(lines):
    """Parse summary/profile text from lines."""
    return ' '.join(lines).strip()


def parse_pdf_resume(file_path):
    """
    Main function: Parse a PDF resume file and return structured data.

    Returns a dictionary with keys:
        full_name, job_title, email, phone, address, about,
        experiences, educations, skills, certifications, languages
    """
    # Extract text
    raw_text = extract_text_from_pdf(file_path)
    if not raw_text:
        return None

    # Clean and split into lines
    lines = clean_text(raw_text)

    # Initialize result
    result = {
        'full_name': '',
        'job_title': '',
        'email': '',
        'phone': '',
        'address': '',
        'about': '',
        'experiences': [],
        'educations': [],
        'skills': [],
        'certifications': [],
        'languages': []
    }

    # Extract contact info from all lines
    email, phone = extract_contact_info(lines)
    result['email'] = email
    result['phone'] = phone

    # Extract name
    result['full_name'] = extract_name(lines)

    # Extract job title
    result['job_title'] = extract_job_title(lines, result['full_name'])

    # Extract address
    result['address'] = extract_address(lines)

    # Split lines into sections
    sections = {}
    current_section = 'header'
    sections[current_section] = []

    for line in lines:
        section = detect_section(line)
        if section:
            current_section = section
            if current_section not in sections:
                sections[current_section] = []
        else:
            if current_section not in sections:
                sections[current_section] = []
            sections[current_section].append(line)

    # Parse each section
    if 'summary' in sections:
        result['about'] = parse_summary(sections['summary'])

    if 'experience' in sections:
        result['experiences'] = parse_experience(sections['experience'])

    if 'education' in sections:
        result['educations'] = parse_education(sections['education'])

    if 'skills' in sections:
        result['skills'] = parse_skills(sections['skills'])

    if 'certifications' in sections:
        result['certifications'] = parse_certifications(sections['certifications'])

    if 'languages' in sections:
        result['languages'] = parse_languages(sections['languages'])

    # If no summary section found, try to use header lines
    if not result['about'] and 'header' in sections:
        header_lines = sections['header']
        # Skip name, email, phone lines
        summary_lines = []
        for line in header_lines:
            if line != result['full_name'] and email not in line and not PHONE_PATTERN.search(line):
                if not EMAIL_PATTERN.search(line):
                    summary_lines.append(line)
        if summary_lines:
            result['about'] = ' '.join(summary_lines[:5])

    return result
