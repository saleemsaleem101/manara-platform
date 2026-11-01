import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manara_backend.settings')
django.setup()

from profiles.models import Skill

# All skills from TAXONOMY_TRACKS in Frontend
FRONTEND_TRACKS = {
    'LANGUAGES': [
        'Python', 'Java', 'C', 'C++', 'C# (.NET)', 'JavaScript', 'TypeScript', 'Go (Golang)', 'Rust',
        'PHP', 'Kotlin', 'Swift', 'Dart', 'Ruby', 'R Language', 'MATLAB', 'Scala',
        'Shell Scripting (Bash / PowerShell)', 'Assembly (x86 / ARM)', 'VHDL & Verilog (Hardware Description)',
        'SQL (Structured Query Language)', 'HTML5 & CSS3'
    ],
    'SOFTWARE': [
        'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js & Express', 'Django & DRF',
        'FastAPI', 'Flask', 'ASP.NET Core', 'Spring Boot', 'Laravel (PHP)', 'Tailwind CSS',
        'Bootstrap', 'GraphQL', 'RESTful APIs', 'WebSockets', 'Microservices Architecture',
        'Design Patterns & SOLID Principles', 'Clean Code & Software Architecture',
        'Software Testing & QA (Unit/Integration)', 'Automated Testing (Selenium / Cypress)',
        'Agile & Scrum Methodologies', 'Git & GitHub Version Control'
    ],
    'AI_DATA': [
        'Machine Learning (ML)', 'Deep Learning (DL)', 'Artificial Intelligence (AI)',
        'Natural Language Processing (NLP)', 'Computer Vision (OpenCV)', 'TensorFlow & PyTorch',
        'Scikit-Learn', 'Data Analysis (Pandas & NumPy)', 'Big Data Analytics (Spark & Hadoop)',
        'Business Intelligence & Power BI', 'Data Mining & Warehousing', 'Large Language Models (LLMs) & Prompting'
    ],
    'CYBER_NET': [
        'Cybersecurity & InfoSec', 'Penetration Testing & Ethical Hacking', 'Network Security & Firewalls',
        'Web Application Security (OWASP Top 10)', 'Cryptography & Encryption Protocols',
        'SOC & Incident Response', 'Vulnerability Assessment & Nessus', 'Digital Forensics',
        'Kali Linux & Penetration Tools', 'Computer Networking (TCP/IP & OSI)',
        'Cisco Networking (CCNA / CCNP Routing & Switching)', 'Network Administration & Wireshark',
        'VPN & Remote Access Technologies', 'VoIP & Telecommunication Systems'
    ],
    'EMBEDDED_IOT': [
        'Embedded Systems & Embedded C/C++', 'Internet of Things (IoT & Protocols MQTT/CoAP)',
        'Microcontrollers (Arduino, STM32, PIC, ESP32)', 'Single-Board Computers (Raspberry Pi)',
        'RTOS (Real-Time Operating Systems)', 'Digital Logic Design & Circuits',
        'Computer Organization & Architecture', 'FPGA & Digital Systems Design',
        'Robotics & Control Systems (ROS)', 'Industrial Automation (PLC & SCADA)',
        'Sensors, Actuators & Signal Processing'
    ],
    'DATABASES_CLOUD': [
        'PostgreSQL', 'MySQL', 'Microsoft SQL Server', 'Oracle Database', 'SQLite',
        'MongoDB (NoSQL)', 'Redis (In-Memory Cache)', 'Firebase & Supabase',
        'Database Design & Normalization', 'DevOps & Automation', 'Docker & Containerization',
        'Kubernetes (K8s)', 'CI/CD Pipelines (GitHub Actions / GitLab CI)', 'Linux System Administration',
        'AWS Cloud Services', 'Microsoft Azure', 'Google Cloud Platform (GCP)',
        'Infrastructure as Code (Terraform)', 'Nginx & Reverse Proxy Architecture', 'Flutter & Dart',
        'React Native', 'Android Native (Kotlin)', 'iOS Native (Swift)'
    ],
    'SOFT': [
        'حل المشكلات والخوارزميات (Problem Solving)', 'العمل الجماعي والتعاون البرمجي (Teamwork)',
        'إدارة المشاريع الهندسية والتقنية (Project Management)', 'التفكير التحليلي والمنطقي (Analytical Thinking)',
        'التواصل الفعال وعرض المشاريع (Effective Communication)', 'القيادة وتحمل المسؤولية (Leadership & Initiative)',
        'كتابة التوثيق والتقارير الفنية (Technical Writing)', 'إدارة الوقت والمهام (Time Management)',
        'التفكير النقدي واتخاذ القرار (Critical Thinking)', 'أخلاقيات مهنة الهندسة والحاسوب (Engineering Ethics)'
    ]
}

created_count = 0
for track_id, skills in FRONTEND_TRACKS.items():
    cat = 'SOFT' if track_id == 'SOFT' else 'TECHNICAL'
    for sk in skills:
        obj, created = Skill.objects.get_or_create(name=sk, defaults={'category': cat})
        if created:
            created_count += 1

print(f"Sync complete. New created: {created_count}. Total in DB: {Skill.objects.count()}")

