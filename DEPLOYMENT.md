# Cloudflare Pages 배포 설정

## 빌드 명령어
npm run build

## 빌드 출력 디렉토리
build

## 환경 변수
없음

## 배포 방법
1. GitHub에 코드 푸시
2. Cloudflare Pages에서 새 프로젝트 생성
3. GitHub 저장소 연결
4. 빌드 설정:
   - Framework preset: SvelteKit
   - Build command: npm run build
   - Build output directory: build
5. 배포 시작

## 로컬 빌드 테스트
```bash
npm run build
npm run preview
```
