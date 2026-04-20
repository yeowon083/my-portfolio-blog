# My Portfolio Blog

Next.js와 Supabase로 만든 개인 포트폴리오 겸 기술 블로그입니다. 프로젝트 기록, 학습 글, 카테고리별 글 목록, 댓글, 관리자 작성 화면을 한곳에서 관리합니다.

## 주요 기능

- 포트폴리오 홈, 소개, 프로젝트 목록/상세 페이지
- 블로그 글 목록, 상세 페이지, 태그/카테고리 필터, 검색, 페이지네이션
- Supabase Auth 기반 관리자 로그인
- 관리자 전용 글/프로젝트/카테고리 작성, 수정, 삭제
- Markdown 렌더링, GFM 문법, 코드블럭 syntax highlighting
- 글/프로젝트 작성 화면의 라이브 Markdown 미리보기
- 댓글 작성, 수정, 삭제, 관리자 삭제
- 같은 기기에서 글 조회수 중복 증가 방지
- `robots.txt`, sitemap route 제공

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth / Database
- React Markdown, remark-gfm, rehype-sanitize
- React Syntax Highlighter

## 시작하기

의존성을 설치합니다.

```bash
npm install
```

환경 변수를 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 프로젝트 구조

```txt
app/
  admin/          관리자 페이지
  api/            댓글, 조회수 API
  blog/           블로그 목록/상세/카테고리 페이지
  projects/       프로젝트 목록/상세 페이지
components/       공용 UI와 클라이언트 컴포넌트
lib/              Supabase, 카테고리, 임시저장 유틸
supabase/         Supabase SQL 보조 파일
```

## Markdown 작성

블로그 글과 프로젝트 설명은 Markdown으로 작성합니다. 코드블럭은 언어를 지정하면 자동으로 색상이 적용됩니다.

````md
```tsx
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
}
```
````

HTML 입력은 `rehype-sanitize`를 통해 허용된 태그와 속성만 렌더링합니다.

## 관리자

관리자 페이지는 `/admin` 아래에 있습니다. Supabase Auth 로그인 후 지정된 관리자 계정만 접근하도록 각 관리자 페이지에서 검사합니다.

관리자 기능:

- 블로그 글 작성/수정/삭제
- 프로젝트 작성/수정/삭제
- 카테고리 작성/수정/삭제
- 작성 중인 글/프로젝트 임시저장

## 댓글과 조회수

댓글은 이름, 비밀번호, 내용을 입력해 작성합니다. 작성자는 비밀번호로 댓글을 수정하거나 삭제할 수 있고, 관리자는 관리자 권한으로 삭제할 수 있습니다.

조회수는 글 상세 페이지 진입 시 증가합니다. 같은 브라우저/기기에서는 localStorage와 httpOnly 쿠키를 사용해 24시간 동안 같은 글의 조회수가 다시 증가하지 않도록 처리합니다.

## 참고

이 프로젝트는 Next.js 16을 사용합니다. Next.js 관련 코드를 수정할 때는 `node_modules/next/dist/docs/`의 현재 버전 문서를 기준으로 확인합니다.
