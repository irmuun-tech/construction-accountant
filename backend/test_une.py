import httpx, random, sys
BASE = "http://127.0.0.1:8001/api"
ok = True
def ck(n, c, x=""):
    global ok; ok &= c; print(("PASS" if c else "FAIL"), n, x)
with httpx.Client(timeout=20) as c:
    tok = c.post(BASE+"/auth/register", json={"email": f"une_{random.randint(1,999999)}@x.com", "password":"secret123","name":"U"}).json()["token"]
    H = {"Authorization":"Bearer "+tok}

    # Ledger with "Үнэ" instead of "Дүн"
    csv1 = "Огноо,Төрөл,Үнэ,Тайлбар\n2026-06-05,Орлого,5000000,Гэрээ\n2026-06-06,Зарлага,555000,Цемент\n".encode("utf-8")
    r = c.post(BASE+"/import", headers=H, files={"file":("a.csv",csv1,"text/csv")}, data={"kind":"ledger","month":"2026-06","confirm":"false"})
    ck("ledger_une_header", r.status_code==200 and r.json()["total"]==2, str(r.status_code)+" "+str(r.json()))

    # Ledger with a weird unrecognized amount header -> numeric fallback
    csv2 = "Date,Note,XYZ\n2026-06-05,a,1000\n2026-06-06,b,2000\n".encode("utf-8")
    r = c.post(BASE+"/import", headers=H, files={"file":("b.csv",csv2,"text/csv")}, data={"kind":"ledger","confirm":"false"})
    ck("ledger_numeric_fallback", r.status_code==200 and r.json()["total"]==2, str(r.json()))

    # Materials with no recognized name header -> first column used
    csv3 = "Бараа,Үнэ,Тоо\nЦемент,18500,40\nАрматур,3200,455\n".encode("utf-8")
    r = c.post(BASE+"/import", headers=H, files={"file":("c.csv",csv3,"text/csv")}, data={"kind":"materials","confirm":"false"})
    j = r.json()
    ck("materials_name_fallback", r.status_code==200 and j["total"]==2 and j["preview"][0]["name"]=="Цемент", str(j))
print("\n=>", "ALL PASS" if ok else "FAILED")
sys.exit(0 if ok else 1)
