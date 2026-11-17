"""Read-only extraction of Murai's four licensed Excel downloads.

Requires openpyxl. Scripture quotation columns and lexical quotations are omitted.
Output is the portable, checked-in input for import-structures.mjs, not a workbook.
"""
import hashlib
import json
import re
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts/cache/structures"
OUT = ROOT / "scripts/structure-sources"
OUT.mkdir(exist_ok=True)
records = []
inputs = []
locked = json.loads((OUT / "source-lock.json").read_text(encoding="utf-8"))
for testament in ("OT", "NT"):
    list_name = f"LiteraryStructureoftheBible_PericopeList_{testament}.xlsx"
    structure_name = f"LiteraryStructureoftheBible_PericopeStructure_{testament}.xlsx"
    for name in (list_name, structure_name):
        digest = hashlib.sha256((CACHE / name).read_bytes()).hexdigest()
        if not any(item["file"] == name and item["sha256"] == digest for item in locked["inputs"]):
            raise ValueError("Unreviewed upstream input: " + name)
        inputs.append({"file": name, "url": "http://www.bible.literarystructure.info/bible/" + name,
                       "sha256": digest})
    lists = openpyxl.load_workbook(CACHE / list_name, read_only=True, data_only=True)
    book = openpyxl.load_workbook(CACHE / structure_name, read_only=True, data_only=True)
    for sheet in book:
        titles = {str(row[0]): str(row[2]) for row in lists[sheet.title].values
                  if len(row) > 2 and row[2]}
        current = None
        pericope = ""
        for number, row in enumerate(sheet.values, 1):
            a, b, c = (list(row) + [None] * 3)[:3]
            a = str(a).strip() if a is not None else ""
            b = str(b).strip() if b is not None else ""
            c = str(c).strip() if c is not None else ""
            header = re.fullmatch(r"\[(\d+)\]", a)
            extra = not a and re.match(r"(?:[1-3]?[A-Za-z]+\s*)?\d+:\d+", b)
            if header or extra:
                if header:
                    pericope = header[1]
                current = {"sheet": sheet.title, "testament": testament, "row": number,
                           "pericope": pericope, "reference": b,
                           "title": titles.get(pericope, sheet.title + " " + b),
                           "positions": [], "relationships": [], "issues": []}
                records.append(current)
            elif a and current:
                # Retain only position and reference. B/C on these rows quote
                # copyrighted translations; neither is copied to the dataset.
                current["positions"].append({"position": a, "row": number})
            elif c and current and re.match(r"[A-Za-z][\w']*\s*:", c):
                current["relationships"].append(c)
            elif b and not a and not c and current and not re.search(r"[ぁ-んァ-ン一-龯]", b):
                current["issues"].append("Unclassified source row " + str(number))
    lists.close()
    book.close()

payload = {"collection": "Murai OT/NT downloadable pericope collection, 2022-02-24",
           "license": "CC BY 4.0", "inputs": inputs, "records": records}
(OUT / "murai.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Extracted {len(records)} source outlines; retained all outlines, including unresolved ones.")
