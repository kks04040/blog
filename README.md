# Personal Blog

SvelteKit과 마크다운 기반의 개인 블로그입니다.

## 🚀 주요 기능

- **3컬럼 레이아웃**: 목차(TOC), 본문, 관련 글 사이드바
- **마크다운 렌더링**: 코드 하이라이팅, 라인 번호, 복사 버튼
- **본문 검색**: Fuse.js를 사용한 전체 텍스트 검색
- **다크 모드**: 시스템 설정 기반 자동 전환
- **링크 카드**: URL 붙여넣기 시 OG 메타데이터 자동 추출
- **댓글 시스템**: Giscus 기반 (GitHub Discussions 연동)
- **정적 배포**: GitHub Pages 지원

## 📦 기술 스택

- **Framework**: SvelteKit
- **Markdown**: unified, remark, rehype
- **Code Highlighting**: Shiki
- **Search**: Fuse.js
- **Math**: KaTeX
- **Deployment**: GitHub Pages

## 🛠️ 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📝 글 작성 방법

`src/content/` 디렉토리에 마크다운 파일을 생성합니다.

```markdown
---
title: 글 제목
date: 2024-01-01
description: 글 설명
---

## 목차

본문 내용...
```

### 지원 문법

- GFM (GitHub Flavored Markdown)
- 코드 블록 (구문 강조, 라인 번호)
- 수학 공식 (KaTeX)
- 테이블
- 각주
- 링크 카드 (자동 미리보기)

## 🌐 배포

GitHub Actions를 통해 자동으로 배포됩니다.

```bash
# GitHub에 push하면 자동 배포
git add .
git commit -m "Update content"
git push
```

배포 URL: `https://<username>.github.io/blog/`

## 📁 프로젝트 구조

```
src/
├── content/              # 마크다운 글
├── lib/
│   ├── components/       # Svelte 컴포넌트
│   │   ├── SearchModal.svelte
│   │   └── Giscus.svelte
│   ├── rehype-code-highlight.js  # 코드 하이라이팅
│   ├── rehype-link-cards.js      # 링크 카드
│   └── types.ts
├── routes/
│   ├── +layout.svelte    # 글로벌 레이아웃
│   ├── +layout.ts        # 글 목록 로드
│   ├── +page.svelte      # 홈 페이지
│   └── posts/[slug]/     # 글 상세 페이지
└── app.css               # 글로벌 스타일
```

## ⚙️ 설정

### GitHub Pages

`svelte.config.js`에서 base path를 설정합니다:

```javascript
export default {
  kit: {
    paths: {
      base: process.env.BASE_PATH || ''
    }
  }
};
```

GitHub Actions는 자동으로 `BASE_PATH`를 설정합니다.

### Giscus 댓글

`src/lib/components/Giscus.svelte`에서 설정:

```javascript
const GISCUS_CONFIG = {
  repo: 'username/repo',
  repoId: 'your-repo-id',
  category: 'Announcements',
  categoryId: 'your-category-id'
};
```

## 📄 라이선스

MIT
