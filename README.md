# ESP32 Access Control Dashboard

Dashboard สำหรับ ESP32 + RC522 + Relay + Electric Door Lock

## ฟังก์ชัน
- Dashboard สถานะ ESP32 / ประตู / RFID
- Attendance Logs
- จัดการผู้ใช้และ UID
- ค้นหาประวัติ
- ตั้งค่า IP ของ ESP32
- เตรียม REST API สำหรับเชื่อม ESP32
- เตรียมต่อ Google Sheets / Google Apps Script

## GitHub Pages
1. อัปโหลดไฟล์ทั้งหมดเข้า repository
2. ไปที่ Settings > Pages
3. เลือก Deploy from a branch
4. เลือก branch main และ folder root
5. เปิด URL GitHub Pages

ตอนนี้ข้อมูลในหน้าเว็บเก็บด้วย localStorage และมีการเพิ่มข้อมูลจริงจาก ESP32 ได้ในขั้นต่อไปผ่าน REST API