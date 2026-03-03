<<<<<<< HEAD
# seoyoung



## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://203.234.62.175:5443/animal/seoyoung.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://203.234.62.175:5443/animal/seoyoung/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
=======
# 🐾 반려동물 통합 지식그래프 대시보드

> 14개 공공 데이터셋 기반 반려동물 지식그래프 연구 대시보드  
> React + FastAPI + PostgreSQL 풀스택

---

## 📦 버전 정보 (중요!)

| 구분 | 기술 | 버전 |
|------|------|------|
| **Runtime** | Node.js | `20.x LTS` |
| **Runtime** | Python | `3.11.x` |
| **Frontend** | React | `18.3.1` |
| **Frontend** | Vite | `5.4.x` |
| **Frontend** | Tailwind CSS | `3.4.x` |
| **Frontend** | React Router DOM | `6.x` |
| **Frontend** | @tanstack/react-query | `5.x` |
| **Frontend** | Axios | `1.7.x` |
| **Frontend** | D3.js | `7.9.x` |
| **Backend** | FastAPI | `0.115.x` |
| **Backend** | Uvicorn | `0.30.x` |
| **Backend** | SQLAlchemy | `2.0.x` |
| **Backend** | Alembic | `1.13.x` |
| **Backend** | asyncpg | `0.29.x` |
| **Backend** | pyproj | `3.6.x` |
| **Backend** | Pydantic | `2.7.x` |
| **Database** | PostgreSQL | `16.x` |
| **Container** | Docker | `25.x` |
| **Container** | Docker Compose | `v2.x` |

---

## 🚀 빠른 시작

### 1. 사전 요구사항 설치
```bash
# Node.js 20 LTS
# https://nodejs.org 에서 다운로드

# Python 3.11
# https://python.org 에서 다운로드

# Docker Desktop
# https://docker.com 에서 다운로드
```

### 2. 레포 클론
```bash
git clone https://gitlab.com/YOUR_ID/petgraph.git
cd petgraph
```

### 3. PostgreSQL 실행 (Docker)
```bash
docker-compose up -d db
```

### 4. 백엔드 실행
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # 환경변수 설정
uvicorn app.main:app --reload --port 8000
```

### 5. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### 6. 접속
- **프론트엔드:** http://localhost:5173
- **API 서버:** http://localhost:8000
- **API 문서(Swagger):** http://localhost:8000/docs

---

## 📁 프로젝트 구조
```
petgraph/
├── backend/
│   ├── app/
│   │   ├── main.py           ← FastAPI 진입점
│   │   ├── database.py       ← PostgreSQL 연결
│   │   ├── models/           ← SQLAlchemy ORM
│   │   ├── schemas/          ← Pydantic 응답 스키마
│   │   ├── routers/          ← API 엔드포인트 (폴더 → API화)
│   │   └── services/         ← 비즈니스 로직
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              ← Axios 클라이언트
│   │   ├── pages/            ← 4개 페이지
│   │   ├── components/       ← 재사용 컴포넌트
│   │   └── hooks/            ← React Query 훅
│   └── package.json
├── db/
│   └── init.sql              ← 테이블 초기화
└── docker-compose.yml
```
>>>>>>> e3acda0 (Initial commit for petgraph)
