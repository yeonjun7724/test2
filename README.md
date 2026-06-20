# 김연준 포트폴리오 — Railway 배포 가이드

## 구조
```
.
├── app.py                 # Flask 엔트리포인트
├── requirements.txt       # Flask, gunicorn
├── Procfile                # web: gunicorn app:app --bind 0.0.0.0:$PORT
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    └── js/main.js
```

## 로컬 실행
```bash
pip install -r requirements.txt
python app.py
# http://localhost:5000
```

## Railway 배포
1. 이 폴더를 GitHub 레포로 push (혹은 Railway CLI로 바로 배포)
2. Railway 대시보드 → New Project → Deploy from GitHub repo
3. Railway가 `Procfile`을 자동 인식해서 `gunicorn app:app`으로 실행합니다.
   (Nixpacks가 Python 프로젝트로 자동 감지하며, 별도 빌드 설정 불필요)
4. `PORT` 환경변수는 Railway가 자동 주입하므로 따로 설정할 필요 없습니다.
5. 배포 후 생성되는 `*.up.railway.app` 도메인으로 바로 접속 가능합니다.
   커스텀 도메인은 Settings → Networking → Custom Domain에서 연결하세요.

## 콘텐츠 수정
- 텍스트/경력/수상 내역: `templates/index.html`
- 색상/타이포/레이아웃: `static/css/style.css` 상단 `:root` 토큰
- 등고선 애니메이션·스크롤 인터랙션: `static/js/main.js`
