import re
from typing import Optional

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    from pypdf import PdfReader
    import io
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = [p.extract_text() or "" for p in reader.pages]
    return "\n".join(pages)


def clean(text: str) -> str:
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text