# Tử Vi Đẩu Số App

Web app lập lá số Tử Vi Đẩu Số (phái Tam Hợp) và luận giải bằng AI, giao diện tiếng Việt kèm chữ Hán.

Phần tính toán lá số dùng nguyên script `ziwei_cli.py` từ [FANzR-arch/Numerologist_skills](https://github.com/FANzR-arch/Numerologist_skills) (thư mục `api/_lib/`), đã được đối chiếu với thư viện [iztro](https://github.com/SylarLong/iztro).

## Chạy local

Yêu cầu: Node.js 20+, Python 3.10+.

```bash
npm install
pip install -r requirements.txt
npm run dev:api   # Python API ở cổng 8001
npm run dev       # Next.js ở cổng 3000
```

## Kiểm thử

```bash
npm run test:py
npm run lint
```

## Deploy

Deploy lên Vercel: Next.js cho giao diện, `api/chart.py` chạy dưới dạng Python Serverless Function.
