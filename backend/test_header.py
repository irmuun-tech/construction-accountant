import httpx, random, sys, io
from openpyxl import Workbook
BASE = "http://127.0.0.1:8001/api"
ok = True
def ck(n, c, x=""):
    global ok; ok &= c; print(("PASS" if c else "FAIL"), n, x)
with httpx.Client(timeout=20) as c:
    tok = c.post(BASE+"/auth/register", json={"email": f"hdr_{random.randint(1,999999)}@x.com", "password":"secret123","name":"H"}).json()["token"]
    H = {"Authorization":"Bearer "+tok}
    # Build an xlsx exactly like the user's: empty row, title row, header on row 3, data + a category row
    wb = Workbook(); ws = wb.active
    ws.append([None, None, None, None, None, None])                                  # row1 empty
    ws.append([None, "Сангийн материал", None, None, None, None])                    # row2 title (merged look)
    ws.append(["д/д", "Материалын  нэр", "Хэмжих нэгж", "тоо ширхэг", "Нэгж үнэ", "Нийт үнэ"])  # row3 header
    ws.append([1, "Сангийн лент /улаан/", "ширхэг", 23, 2500, 57500])
    ws.append([2, "Сангийн лент /ногоон/", "ширхэг", 14, 2500, 35000])
    ws.append([None, "Цэвэр ус", None, None, None, None])                            # category label row
    ws.append([1, "PPR 20 давуулагч", "ширхэг", 48, 1500, 72000])
    bio = io.BytesIO(); wb.save(bio); xb = bio.getvalue()

    r = c.post(BASE+"/import", headers=H, files={"file":("mat.xlsx",xb,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}, data={"kind":"materials","month":"2026-06","confirm":"false"})
    j = r.json()
    print("columns:", j.get("columns"))
    print("preview:", [(p["name"], p["unit"], p["price"], p["quantity"]) for p in j.get("preview",[])])
    ck("found_3_real_materials_skipped_category", j["total"]==3, str(j["total"]))
    p0 = j["preview"][0]
    ck("name_correct", p0["name"]=="Сангийн лент /улаан/", p0["name"])
    ck("unit_price_not_total", p0["price"]==2500, str(p0["price"]))   # Нэгж үнэ, not Нийт үнэ
    ck("quantity_correct", p0["quantity"]==23, str(p0["quantity"]))
    ck("category_row_skipped", all(p["name"]!="Цэвэр ус" for p in j["preview"]))
print("\n=>", "ALL PASS" if ok else "FAILED")
sys.exit(0 if ok else 1)
