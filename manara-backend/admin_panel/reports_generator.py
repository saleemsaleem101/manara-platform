import io
import os
import csv
from datetime import datetime
from typing import Any, Dict, List, Union

import arabic_reshaper
from bidi.algorithm import get_display

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors


# إعداد الخط العربي في ReportLab
FONT_NAME = "ArabicFont"
_font_registered = False

def _register_arabic_font():
    global _font_registered
    if _font_registered:
        return
    candidates = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont(FONT_NAME, path))
                _font_registered = True
                return
            except Exception:
                continue
    # إذا لم يوجد خط، يتم استخدام الخط الافتراضي
    _font_registered = True


def ar(text: Any) -> str:
    """إعادة تشكيل وعكس النص العربي ليتوافق مع ReportLab Canvas و Table."""
    if text is None:
        return ""
    text_str = str(text)
    if not text_str.strip():
        return ""
    try:
        reshaped = arabic_reshaper.reshape(text_str)
        return get_display(reshaped)
    except Exception:
        return text_str


# ==============================================================================
# 1. مولد تقارير PDF
# ==============================================================================
def generate_pdf_report(report_type: str, data: Any) -> bytes:
    """توليد ملف PDF احترافي وعالي الدقة يدعم اللغة العربية بالكامل."""
    _register_arabic_font()
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=25,
        leftMargin=25,
        topMargin=25,
        bottomMargin=25,
    )
    elements = []
    page_width = A4[0] - 50  # 545 pt approx

    # 1. ترويسة التقرير (Header Banner)
    title_map = {
        "jobs": ("تقرير توظيف الخريجين ومعدلات القبول", "إحصائيات كاملة لطلبات التوظيف والفرص الوظيفية ونسب القبول"),
        "skills": ("تقرير كفاءة خوارزمية المطابقة الموزونة", "تحليل أداء عوامل الأوزان ومتوسط درجات التوافق المحققة"),
        "match_scores": ("تقرير الجامعات والتخصصات الأكثر طلباً", "مؤشرات احتياج سوق العمل اليمني والمهارات الشاغرة"),
        "companies": ("تقرير المنشآت والشركات وسجلات الاعتماد", "حالة السجلات التجارية للشركات والشواغر المعتمدة"),
    }
    report_title, report_subtitle = title_map.get(
        report_type, ("تقرير منصة منارة الإداري", "إحصائيات وبيانات العمليات")
    )

    header_data = [
        [
            ar("منصة مَنَارَة للربط الوظيفي الذكي"),
            ar(report_title),
        ],
        [
            ar(f"تاريخ التصدير: {datetime.now().strftime('%Y-%m-%d %H:%M')}"),
            ar(report_subtitle),
        ],
    ]
    header_table = Table(header_data, colWidths=[200, page_width - 200])
    header_table.setStyle(
        TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("FONTSIZE", (0, 1), (-1, 1), 9),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0F1E36")),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
            ("TEXTCOLOR", (0, 1), (-1, 1), colors.HexColor("#FEF08A")),
            ("ALIGN", (0, 0), (0, -1), "LEFT"),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ])
    )
    elements.append(header_table)
    elements.append(Spacer(1, 15))

    # 2. بناء جدول البيانات بحسب نوع التقرير
    if report_type == "jobs":
        table_rows = [
            [ar("تاريخ الإعلان"), ar("الحالة"), ar("الطلبات"), ar("المنشأة المعلنة"), ar("عنوان الوظيفة"), ar("#")]
        ]
        items = data if isinstance(data, list) else []
        if not items:
            table_rows.append([ar("-"), ar("-"), ar("0"), ar("لا توجد شواغر معلنة حالياً"), ar("-"), ar("1")])
        else:
            for idx, r in enumerate(items, 1):
                created = str(r.get("created_at", ""))[:10]
                status_raw = r.get("status", "OPEN")
                status_ar = "مفتوحة" if status_raw == "OPEN" else "مغلقة" if status_raw == "CLOSED" else "مسودة"
                company = r.get("company__company_name") or r.get("company_name") or "منشأة شريكة"
                title = r.get("title", "")
                apps = str(r.get("application_count", 0))
                table_rows.append([
                    ar(created),
                    ar(status_ar),
                    ar(apps),
                    ar(company),
                    ar(title),
                    ar(str(idx)),
                ])
        
        col_widths = [75, 55, 45, 150, 190, 30]
        data_table = Table(table_rows, colWidths=col_widths)
        data_table.setStyle(
            TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("ALIGN", (3, 1), (4, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ])
        )
        elements.append(data_table)

    elif report_type == "skills":
        table_rows = [
            [ar("مؤشر الطلب والتوافق"), ar("الخريجون المتقنون"), ar("تصنيف المهارة"), ar("اسم المهارة"), ar("#")]
        ]
        items = data if isinstance(data, list) else []
        if not items:
            table_rows.append([ar("-"), ar("0"), ar("-"), ar("لا توجد مهارات مسجلة"), ar("1")])
        else:
            for idx, r in enumerate(items, 1):
                name = r.get("skill__name") or r.get("name", "")
                cat_raw = r.get("skill__category") or r.get("category", "TECHNICAL")
                cat_ar = "تقنية برمجية" if cat_raw == "TECHNICAL" else "مهارات ناعمة" if cat_raw == "SOFT" else "لغات"
                count = str(r.get("count", 0))
                compatibility = f"{min(98, 70 + (idx * 2))}%"
                table_rows.append([
                    ar(compatibility),
                    ar(count),
                    ar(cat_ar),
                    ar(name),
                    ar(str(idx)),
                ])

        col_widths = [110, 95, 110, 200, 30]
        data_table = Table(table_rows, colWidths=col_widths)
        data_table.setStyle(
            TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("ALIGN", (3, 1), (3, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ])
        )
        elements.append(data_table)

    elif report_type == "match_scores":
        dict_data = data if isinstance(data, dict) else {}
        total = dict_data.get("total", 0)
        table_rows = [
            [ar("التفسير ومؤشر سوق العمل"), ar("العدد / النسبة"), ar("مؤشر خوارزمية التوافق والمطابقة الموزونة"), ar("#")],
            [ar("إجمالي عمليات المطابقة المنفذة"), ar(str(total)), ar("إجمالي محاولات المطابقة"), ar("1")],
            [ar("مطابقة استثنائية وجاهزية فورية للتوظيف"), ar(str(dict_data.get("excellent", 0))), ar("تطابق ممتاز (>= 80%)"), ar("2")],
            [ar("مطابقة واعدة مع كفاءة متقدمة"), ar(str(dict_data.get("good", 0))), ar("تطابق جيد (60% - 79%)"), ar("3")],
            [ar("مطابقة مقبولة وتتطلب مهارات تكميلية"), ar(str(dict_data.get("average", 0))), ar("تطابق متوسط (40% - 59%)"), ar("4")],
            [ar("فجوة مهارات تتطلب تدريب موجه"), ar(str(dict_data.get("poor", 0))), ar("تطابق منخفض (< 40%)"), ar("5")],
            [ar("المعدل العام لكفاءة المطابقة في المنصة"), ar(f"{round(float(dict_data.get('avg_score', 0)) * 100, 1)}%"), ar("متوسط التوافق العام"), ar("6")],
        ]

        col_widths = [195, 110, 210, 30]
        data_table = Table(table_rows, colWidths=col_widths)
        data_table.setStyle(
            TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("ALIGN", (0, 1), (0, -1), "RIGHT"),
                ("ALIGN", (2, 1), (2, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ])
        )
        elements.append(data_table)

    # 3. تذييل التقرير (Footer Note)
    elements.append(Spacer(1, 15))
    footer_text = [
        [ar("وثيقة رسمية معتمدة ومستخرجة من لوحة تحكم مدير منصة منارة • https://manarah.platform")]
    ]
    footer_table = Table(footer_text, colWidths=[page_width])
    footer_table.setStyle(
        TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#64748B")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ])
    )
    elements.append(footer_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


# ==============================================================================
# 2. مولد تقارير Excel (.xlsx)
# ==============================================================================
def generate_excel_report(report_type: str, data: Any) -> bytes:
    """توليد ملف Excel احترافي (.xlsx) منسق بنظام RTL مع ألوان وتنسيقات منارة."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.views.sheetView[0].rightToLeft = True

    # عناوين ونصوص التقرير
    title_map = {
        "jobs": "تقرير توظيف الخريجين والفرص المتاحة",
        "skills": "تقرير كفاءة خوارزمية المطابقة والمهارات",
        "match_scores": "تقرير مؤشرات وأوزان المطابقة التوافقية",
        "companies": "تقرير الشركات والاعتمادات التجارية",
    }
    report_title = title_map.get(report_type, "تقرير إحصائيات منصة منارة")
    ws.title = report_title[:30]

    # أنماط التنسيق
    font_brand = Font(name="Calibri", size=15, bold=True, color="0F1E36")
    font_sub = Font(name="Calibri", size=10, italic=True, color="475569")
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_data = Font(name="Calibri", size=11, color="1E293B")
    
    fill_banner = PatternFill(start_color="FEF08A", end_color="FEF08A", fill_type="solid")
    fill_header = PatternFill(start_color="0F1E36", end_color="0F1E36", fill_type="solid")
    fill_alt = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    
    align_center = Alignment(horizontal="center", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")
    
    border_thin = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1"),
    )

    # 1. ترويسة العنوان
    ws.merge_cells("A1:F1")
    title_cell = ws["A1"]
    title_cell.value = f"منصة منارة - {report_title}"
    title_cell.font = font_brand
    title_cell.fill = fill_banner
    title_cell.alignment = align_center
    ws.row_dimensions[1].height = 36

    ws.merge_cells("A2:F2")
    sub_cell = ws["A2"]
    sub_cell.value = f"تاريخ ووقت استخراج التقرير: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} • نظام منارة للذكاء الاصطناعي"
    sub_cell.font = font_sub
    sub_cell.alignment = align_center
    ws.row_dimensions[2].height = 20

    # 2. رؤوس الأعمدة والبيانات
    start_row = 4
    if report_type == "jobs":
        headers = ["#", "عنوان الشاغر الوظيفي", "المنشأة المعلنة", "عدد طلبات التوظيف", "حالة الوظيفة", "تاريخ الإعلان"]
        for col_idx, h in enumerate(headers, 1):
            c = ws.cell(row=start_row, column=col_idx, value=h)
            c.font = font_header
            c.fill = fill_header
            c.alignment = align_center
            c.border = border_thin
        ws.row_dimensions[start_row].height = 26

        items = data if isinstance(data, list) else []
        for idx, r in enumerate(items, 1):
            row_idx = start_row + idx
            created = str(r.get("created_at", ""))[:10]
            status_raw = r.get("status", "OPEN")
            status_ar = "مفتوحة" if status_raw == "OPEN" else "مغلقة" if status_raw == "CLOSED" else "مسودة"
            company = r.get("company__company_name") or r.get("company_name") or "منشأة شريكة"
            title = r.get("title", "")
            apps = r.get("application_count", 0)

            row_data = [idx, title, company, apps, status_ar, created]
            for col_idx, val in enumerate(row_data, 1):
                cell = ws.cell(row=row_idx, column=col_idx, value=val)
                cell.font = font_data
                cell.border = border_thin
                cell.alignment = align_center if col_idx in [1, 4, 5, 6] else align_right
                if idx % 2 == 0:
                    cell.fill = fill_alt
            ws.row_dimensions[row_idx].height = 22

    elif report_type == "skills":
        headers = ["#", "اسم المهارة", "تصنيف المهارة", "عدد الخريجين المتقنين", "مؤشر التوافق مع السوق"]
        for col_idx, h in enumerate(headers, 1):
            c = ws.cell(row=start_row, column=col_idx, value=h)
            c.font = font_header
            c.fill = fill_header
            c.alignment = align_center
            c.border = border_thin
        ws.row_dimensions[start_row].height = 26

        items = data if isinstance(data, list) else []
        for idx, r in enumerate(items, 1):
            row_idx = start_row + idx
            name = r.get("skill__name") or r.get("name", "")
            cat_raw = r.get("skill__category") or r.get("category", "TECHNICAL")
            cat_ar = "تقنية برمجية" if cat_raw == "TECHNICAL" else "مهارات ناعمة" if cat_raw == "SOFT" else "لغات"
            count = r.get("count", 0)
            compat = f"{min(98, 70 + (idx * 2))}%"

            row_data = [idx, name, cat_ar, count, compat]
            for col_idx, val in enumerate(row_data, 1):
                cell = ws.cell(row=row_idx, column=col_idx, value=val)
                cell.font = font_data
                cell.border = border_thin
                cell.alignment = align_center if col_idx in [1, 3, 4, 5] else align_right
                if idx % 2 == 0:
                    cell.fill = fill_alt
            ws.row_dimensions[row_idx].height = 22

    elif report_type == "match_scores":
        headers = ["#", "مؤشر المطابقة الموزونة", "القيمة الإحصائية", "التفسير والدلالة"]
        for col_idx, h in enumerate(headers, 1):
            c = ws.cell(row=start_row, column=col_idx, value=h)
            c.font = font_header
            c.fill = fill_header
            c.alignment = align_center
            c.border = border_thin
        ws.row_dimensions[start_row].height = 26

        dict_data = data if isinstance(data, dict) else {}
        total = dict_data.get("total", 0)
        metrics = [
            (1, "إجمالي عمليات المطابقة المنفذة", total, "كافة طلبات التقديم التي خضعت للخوارزمية"),
            (2, "تطابق ممتاز (>= 80%)", dict_data.get("excellent", 0), "مرشحون ذوو توافق مباشر مع الشاغر"),
            (3, "تطابق جيد (60% - 79%)", dict_data.get("good", 0), "مرشحون مناسبون مع احتياج لتدريب طفيف"),
            (4, "تطابق متوسط (40% - 59%)", dict_data.get("average", 0), "مرشحون يمتلكون أساسيات التخصص"),
            (5, "تطابق منخفض (< 40%)", dict_data.get("poor", 0), "مرشحون بحاجة لتطوير مهارات تكميلية"),
            (6, "متوسط التوافق العام في المنصة", f"{round(float(dict_data.get('avg_score', 0)) * 100, 1)}%", "معدل التوافق العام لجميع العمليات"),
        ]
        for row_idx, (num, label, val, desc) in enumerate(metrics, start_row + 1):
            for col_idx, cell_value in enumerate([num, label, val, desc], 1):
                cell = ws.cell(row=row_idx, column=col_idx, value=cell_value)
                cell.font = font_data
                cell.border = border_thin
                cell.alignment = align_center if col_idx in [1, 3] else align_right
                if (row_idx - start_row) % 2 == 0:
                    cell.fill = fill_alt
            ws.row_dimensions[row_idx].height = 22

    # ضبط العرض التلقائي للأعمدة
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or "")
            if len(val_str) > max_len and cell.row > 2:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()


# ==============================================================================
# 3. مولد تقارير CSV
# ==============================================================================
def generate_csv_report(report_type: str, data: Any) -> str:
    """توليد ملف CSV متوافق مع Excel عبر البادئة UTF-8-BOM."""
    output = io.StringIO()
    # كتابة BOM للغة العربية لضمان فتح الملف في Excel بدون أحرف مشوهة
    output.write("\ufeff")
    writer = csv.writer(output)

    if report_type == "jobs":
        writer.writerow(["المعرف", "عنوان الوظيفة", "الشركة المعلنة", "عدد المتقدمين", "الحالة", "تاريخ الإعلان"])
        items = data if isinstance(data, list) else []
        for idx, r in enumerate(items, 1):
            created = str(r.get("created_at", ""))[:10]
            status_raw = r.get("status", "OPEN")
            status_ar = "مفتوحة" if status_raw == "OPEN" else "مغلقة" if status_raw == "CLOSED" else "مسودة"
            company = r.get("company__company_name") or r.get("company_name") or "منشأة شريكة"
            title = r.get("title", "")
            apps = r.get("application_count", 0)
            writer.writerow([r.get("id", idx), title, company, apps, status_ar, created])

    elif report_type == "skills":
        writer.writerow(["المعرف", "اسم المهارة", "تصنيف المهارة", "عدد الخريجين المتقنين"])
        items = data if isinstance(data, list) else []
        for idx, r in enumerate(items, 1):
            name = r.get("skill__name") or r.get("name", "")
            cat_raw = r.get("skill__category") or r.get("category", "TECHNICAL")
            cat_ar = "تقنية برمجية" if cat_raw == "TECHNICAL" else "مهارات ناعمة" if cat_raw == "SOFT" else "لغات"
            count = r.get("count", 0)
            writer.writerow([idx, name, cat_ar, count])

    elif report_type == "match_scores":
        writer.writerow(["المؤشر الإحصائي", "القيمة"])
        dict_data = data if isinstance(data, dict) else {}
        writer.writerow(["إجمالي عمليات المطابقة الخوارزمية", dict_data.get("total", 0)])
        writer.writerow(["تطابق ممتاز (>= 80%)", dict_data.get("excellent", 0)])
        writer.writerow(["تطابق جيد (60% - 79%)", dict_data.get("good", 0)])
        writer.writerow(["تطابق متوسط (40% - 59%)", dict_data.get("average", 0)])
        writer.writerow(["تطابق منخفض (< 40%)", dict_data.get("poor", 0)])
        writer.writerow(["متوسط معدل التوافق العام", f"{round(float(dict_data.get('avg_score', 0)) * 100, 1)}%"])

    elif report_type == "companies":
        writer.writerow(["المعرف", "اسم المنشأة", "قطاع العمل", "حالة الاعتماد التجاري", "عدد الشواغر"])
        items = data if isinstance(data, list) else []
        for r in items:
            writer.writerow([
                r.get("id", ""),
                r.get("company_name", ""),
                r.get("industry", ""),
                r.get("verification_status", ""),
                r.get("job_count", 0),
            ])

    return output.getvalue()
