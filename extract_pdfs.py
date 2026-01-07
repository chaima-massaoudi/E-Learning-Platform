import pdfplumber
import os

pdf_files = [
    "exam.pdf",
    "MERN1.pdf",
    "MERN1P.pdf",
    "MERN1 4.pdf",
    "MERN1 5.pdf",
    "MERN1 (5).pdf",
    "MERN1 (6).pdf",
    "MERN1 (8).pdf",
    "MERN1 S6.pdf",
    "MERN2.pdf",
    "MERN3.pdf",
    "React_js_IsitCom 0.pdf",
    "React_js_IsitCom routers.pdf"
]

for pdf_file in pdf_files:
    print(f"\n{'='*80}")
    print(f"FILE: {pdf_file}")
    print('='*80)
    try:
        with pdfplumber.open(pdf_file) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    print(f"\n--- Page {i+1} ---")
                    print(text)
    except Exception as e:
        print(f"Error reading {pdf_file}: {e}")
