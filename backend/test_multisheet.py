import httpx, random, sys, io
from openpyxl import Workbook
BASE = "http://127.0.0.1:8001/api"
ok = True
def ck(n, c, x=""):
    global ok; ok &= c; print(("PASS" if c else "FAIL"), n, x)
with httpx.Client(timeout=20) as c:
    tok = c.post(BASE+"/auth/register", json={"email": f"ms_{random.randint(1,999999)}@x.com", "password":"secret123","name":"M"}).json()["token"]
    H = {"Authorization":"Bearer "+tok}
    wb = Workbook()
    s1 = wb.active; s1.title = "Сангийн лент"
    s1.append([None,"Сангийн материал",None,None,None])
    s1.append(["д/д","Материалын нэр","Хэмжих нэгж","тоо ширхэг","Нэгж үнэ"])
    s1.append([1,"Сангийн лент /улаан/","ширхэг",23,2500])
    s1.append([2,"Сангийн лент /ногоон/","ширхэг",14,2500])
    s2 = wb.create_sheet("Цэвэр ус")
    s2.append(["д/д","Материалын нэр","Хэмжих нэгж","тоо ширхэг","Нэгж үнэ"])
    s2.append([1,"PPR 20 давуулагч","ширхэг",48,1500])
    s2.append([2,"PPR 20*20 булан","ширхэг",4,500])
    bio = io.BytesIO(); wb.save(bio); xb = bio.getvalue()
    r = c.post(BASE+"/import", headers=H, files={"file":("multi.xlsx",xb,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}, data={"kind":"materials","month":"2026-06","confirm":"false"})
    j = r.json()
    names = [p["name"] for p in j.get("preview",[])]
    print("total:", j.get("total"), "names:", names)
    ck("multi_sheet_combined_4", j["total"]==4, str(j.get("total")))
    ck("has_both_sheets", "Сангийн лент /улаан/" in names and "PPR 20 давуулагч" in names)
print("\n=>", "ALL PASS" if ok else "FAILED")
sys.exit(0 if ok else 1)
