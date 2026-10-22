import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manara_backend.settings')
django.setup()

from profiles.models import Skill

FACULTY_SKILLS = [
    # ==========================================
    # 1. Core Programming Languages (لغات البرمجة الأساسية)
    # ==========================================
    ("Python", "TECHNICAL"),
    ("Java", "TECHNICAL"),
    ("C", "TECHNICAL"),
    ("C++", "TECHNICAL"),
    ("C# (.NET)", "TECHNICAL"),
    ("JavaScript", "TECHNICAL"),
    ("TypeScript", "TECHNICAL"),
    ("Go (Golang)", "TECHNICAL"),
    ("Rust", "TECHNICAL"),
    ("PHP", "TECHNICAL"),
    ("Kotlin", "TECHNICAL"),
    ("Swift", "TECHNICAL"),
    ("Dart", "TECHNICAL"),
    ("Ruby", "TECHNICAL"),
    ("R Language", "TECHNICAL"),
    ("MATLAB", "TECHNICAL"),
    ("Scala", "TECHNICAL"),
    ("Shell Scripting (Bash / PowerShell)", "TECHNICAL"),
    ("Assembly (x86 / ARM)", "TECHNICAL"),
    ("VHDL & Verilog (Hardware Description)", "TECHNICAL"),
    ("SQL (Structured Query Language)", "TECHNICAL"),
    ("HTML5 & CSS3", "TECHNICAL"),

    # ==========================================
    # 2. Software Engineering & Web Development (هندسة البرمجيات والويب)
    # ==========================================
    ("React.js", "TECHNICAL"),
    ("Next.js", "TECHNICAL"),
    ("Vue.js", "TECHNICAL"),
    ("Angular", "TECHNICAL"),
    ("Node.js & Express", "TECHNICAL"),
    ("Django & DRF", "TECHNICAL"),
    ("FastAPI", "TECHNICAL"),
    ("Flask", "TECHNICAL"),
    ("ASP.NET Core", "TECHNICAL"),
    ("Spring Boot", "TECHNICAL"),
    ("Laravel (PHP)", "TECHNICAL"),
    ("Tailwind CSS", "TECHNICAL"),
    ("Bootstrap", "TECHNICAL"),
    ("GraphQL", "TECHNICAL"),
    ("RESTful APIs", "TECHNICAL"),
    ("WebSockets", "TECHNICAL"),
    ("Microservices Architecture", "TECHNICAL"),
    ("Design Patterns & SOLID Principles", "TECHNICAL"),
    ("Clean Code & Software Architecture", "TECHNICAL"),
    ("Software Testing & QA (Unit/Integration)", "TECHNICAL"),
    ("Automated Testing (Selenium / Cypress)", "TECHNICAL"),
    ("Agile & Scrum Methodologies", "TECHNICAL"),
    ("Git & GitHub Version Control", "TECHNICAL"),

    # ==========================================
    # 3. Artificial Intelligence & Data Science (الذكاء الاصطناعي وعلم البيانات)
    # ==========================================
    ("Machine Learning (ML)", "TECHNICAL"),
    ("Deep Learning (DL)", "TECHNICAL"),
    ("Artificial Intelligence (AI)", "TECHNICAL"),
    ("Natural Language Processing (NLP)", "TECHNICAL"),
    ("Computer Vision (OpenCV)", "TECHNICAL"),
    ("TensorFlow & PyTorch", "TECHNICAL"),
    ("Scikit-Learn", "TECHNICAL"),
    ("Data Analysis (Pandas & NumPy)", "TECHNICAL"),
    ("Big Data Analytics (Spark & Hadoop)", "TECHNICAL"),
    ("Business Intelligence & Power BI", "TECHNICAL"),
    ("Data Mining & Warehousing", "TECHNICAL"),
    ("Large Language Models (LLMs) & Prompting", "TECHNICAL"),

    # ==========================================
    # 4. Databases & Storage (قواعد البيانات وهندسة نظم البيانات)
    # ==========================================
    ("PostgreSQL", "TECHNICAL"),
    ("MySQL", "TECHNICAL"),
    ("Microsoft SQL Server", "TECHNICAL"),
    ("Oracle Database", "TECHNICAL"),
    ("SQLite", "TECHNICAL"),
    ("MongoDB (NoSQL)", "TECHNICAL"),
    ("Redis (In-Memory Cache)", "TECHNICAL"),
    ("Firebase & Supabase", "TECHNICAL"),
    ("Database Design & Normalization", "TECHNICAL"),

    # ==========================================
    # 5. Cybersecurity & Information Security (الأمن السيبراني وأمن المعلومات)
    # ==========================================
    ("Cybersecurity & InfoSec", "TECHNICAL"),
    ("Penetration Testing & Ethical Hacking", "TECHNICAL"),
    ("Network Security & Firewalls", "TECHNICAL"),
    ("Web Application Security (OWASP Top 10)", "TECHNICAL"),
    ("Cryptography & Encryption Protocols", "TECHNICAL"),
    ("SOC & Incident Response", "TECHNICAL"),
    ("Vulnerability Assessment & Nessus", "TECHNICAL"),
    ("Digital Forensics", "TECHNICAL"),
    ("Kali Linux & Penetration Tools", "TECHNICAL"),

    # ==========================================
    # 6. Computer Networks & Infrastructure (هندسة الشبكات والاتصالات)
    # ==========================================
    ("Computer Networking (TCP/IP & OSI)", "TECHNICAL"),
    ("Cisco Networking (CCNA / CCNP Routing & Switching)", "TECHNICAL"),
    ("Network Administration & Wireshark", "TECHNICAL"),
    ("VPN & Remote Access Technologies", "TECHNICAL"),
    ("VoIP & Telecommunication Systems", "TECHNICAL"),

    # ==========================================
    # 7. Computer Engineering, Embedded Systems & IoT (هندسة الحاسوب والأنظمة المدمجة والإنترنت الصناعي)
    # ==========================================
    ("Embedded Systems & Embedded C/C++", "TECHNICAL"),
    ("Internet of Things (IoT & Protocols MQTT/CoAP)", "TECHNICAL"),
    ("Microcontrollers (Arduino, STM32, PIC, ESP32)", "TECHNICAL"),
    ("Single-Board Computers (Raspberry Pi)", "TECHNICAL"),
    ("RTOS (Real-Time Operating Systems)", "TECHNICAL"),
    ("Digital Logic Design & Circuits", "TECHNICAL"),
    ("Computer Organization & Architecture", "TECHNICAL"),
    ("FPGA & Digital Systems Design", "TECHNICAL"),
    ("Robotics & Control Systems (ROS)", "TECHNICAL"),
    ("Industrial Automation (PLC & SCADA)", "TECHNICAL"),
    ("Sensors, Actuators & Signal Processing", "TECHNICAL"),

    # ==========================================
    # 8. Cloud Computing & DevOps (الحوسبة السحابية وهندسة العمليات)
    # ==========================================
    ("DevOps & Automation", "TECHNICAL"),
    ("Docker & Containerization", "TECHNICAL"),
    ("Kubernetes (K8s)", "TECHNICAL"),
    ("CI/CD Pipelines (GitHub Actions / GitLab CI)", "TECHNICAL"),
    ("Linux System Administration", "TECHNICAL"),
    ("AWS Cloud Services", "TECHNICAL"),
    ("Microsoft Azure", "TECHNICAL"),
    ("Google Cloud Platform (GCP)", "TECHNICAL"),
    ("Infrastructure as Code (Terraform)", "TECHNICAL"),
    ("Nginx & Reverse Proxy Architecture", "TECHNICAL"),

    # ==========================================
    # 9. Mobile App Development (تطوير تطبيقات الهواتف الذكية)
    # ==========================================
    ("Flutter & Dart", "TECHNICAL"),
    ("React Native", "TECHNICAL"),
    ("Android Native (Kotlin)", "TECHNICAL"),
    ("iOS Native (Swift)", "TECHNICAL"),
    ("Mobile UI/UX Design & Figma", "TECHNICAL"),

    # ==========================================
    # 10. Soft & Engineering Professional Skills (المهارات الهندسية والشخصية)
    # ==========================================
    ("حل المشكلات والخوارزميات (Problem Solving)", "SOFT"),
    ("العمل الجماعي والتعاون البرمجي (Teamwork)", "SOFT"),
    ("إدارة المشاريع الهندسية والتقنية (Project Management)", "SOFT"),
    ("التفكير التحليلي والمنطقي (Analytical Thinking)", "SOFT"),
    ("التواصل الفعال وعرض المشاريع (Effective Communication)", "SOFT"),
    ("القيادة وتحمل المسؤولية (Leadership & Initiative)", "SOFT"),
    ("كتابة التوثيق والتقارير الفنية (Technical Writing)", "SOFT"),
    ("إدارة الوقت والمهام (Time Management)", "SOFT"),
    ("التفكير النقدي واتخاذ القرار (Critical Thinking)", "SOFT"),
    ("أخلاقيات مهنة الهندسة والحاسوب (Engineering Ethics)", "SOFT"),
]

def seed_faculty_skills():
    created_count = 0
    updated_count = 0
    for name, cat in FACULTY_SKILLS:
        obj, created = Skill.objects.get_or_create(
            name=name,
            defaults={'category': cat}
        )
        if created:
            created_count += 1
        else:
            if obj.category != cat:
                obj.category = cat
                obj.save()
                updated_count += 1
                
    total = Skill.objects.count()
    print(f"✓ تم تحديث قاعدة بيانات Supabase بنجاح:")
    print(f"  - مهارات جديدة أضيفت: {created_count}")
    print(f"  - مهارات محدثة: {updated_count}")
    print(f"  - إجمالي المهارات المهيكلة المعتمدة في النظام: {total}")

if __name__ == "__main__":
    seed_faculty_skills()
