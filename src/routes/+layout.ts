/**
 * 레이아웃 데이터 로드 함수
 * 
 * 이 파일은 모든 페이지에서 공통으로 사용되는 데이터를 로드합니다.
 * 주로 글 목록을 생성하여 검색 기능에서 사용합니다.
 */

import type { LayoutLoad } from './$types';

/**
 * 정적 사이트 생성을 위한 설정
 * 모든 페이지를 빌드 시점에 미리 렌더링합니다.
 */
export const prerender = true;

/**
 * 마크다운 파일들을 동적으로 가져옵니다.
 * - import.meta.glob: Vite의 glob 패턴으로 파일 가져오기
 * - eager: true: 빌드 시점에 모든 파일을 즉시 로드
 * - query: '?raw': 원본 텍스트로 가져오기 (파싱하지 않음)
 */
const modules = import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

/**
 * 마크다운 문법을 제거하여 순수 텍스트만 추출하는 함수
 * 검색 기능에서 마크다운 기호(**, #, - 등)를 제거하고 내용만 검색하기 위해 사용합니다.
 * 
 * @param text - 마크다운 원본 텍스트
 * @returns 마크다운 문법이 제거된 순수 텍스트
 */
function stripMarkdown(text: string): string {
	return text
		.replace(/```[\s\S]*?```/g, '') // 코드 블록 제거 (```로 감싼 부분)
		.replace(/`([^`]+)`/g, '$1') // 인라인 코드 (`로 감싼 부분) - 텍스트만 남김
		.replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거 (![alt](url) 형식)
		.replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // 링크 - URL 제거하고 텍스트만 남김
		.replace(/#{1,6}\s+/g, '') // 헤딩 제거 (# ## ### 등)
		.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // 강조/기울임 제거 (**텍스트**, *텍스트*, __텍스트__)
		.replace(/~~([^~]+)~~/g, '$1') // 취소선 제거 (~~텍스트~~)
		.replace(/^\s*[-*+]\s+/gm, '') // 리스트 마커 제거 (-, *, +)
		.replace(/^\s*\d+\.\s+/gm, '') // 순번 리스트 마커 제거 (1., 2., 3.)
		.replace(/^\s*>\s+/gm, '') // 인용 마커 제거 (>)
		.replace(/\|.*\|/g, '') // 테이블 제거 (|로 감싼 부분)
		.replace(/\n+/g, ' ') // 줄바꿈을 공백으로 변환
		.replace(/\s+/g, ' ') // 연속된 공백을 하나로 정리
		.trim(); // 앞뒤 공백 제거
}

/**
 * 레이아웃 데이터 로드 함수
 * 모든 마크다운 파일을 읽어서 글 목록을 생성합니다.
 * 이 데이터는 검색 모달(SearchModal)에서 사용됩니다.
 */
export const load: LayoutLoad = async () => {
	// 모든 마크다운 파일을 배열로 변환
	const posts = Object.entries(modules).map(([path, raw]) => {
		// YAML frontmatter 파싱 (---로 감싼 부분)
		// 형식: ---\ntitle: 제목\ndate: 2024-01-01\n---\n본문
		const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		const metadata: Record<string, string> = {};
		let content = '';

		if (match) {
			// frontmatter의 각 라인을 파싱하여 key-value로 저장
			match[1].split('\n').forEach(line => {
				const colonIndex = line.indexOf(':');
				if (colonIndex > 0) {
					const key = line.slice(0, colonIndex).trim();
					const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
					if (key && value) {
						metadata[key] = value;
					}
				}
			});
			// frontmatter 이후의 본문 내용
			content = match[2];
		}

		// 파일 경로에서 slug 추출 (파일명에서 .md 제거)
		// 예: '../content/my-post.md' -> 'my-post'
		const slug = path.split('/').pop()?.replace('.md', '') || '';

		return {
			slug, // URL 경로에 사용 (예: /posts/my-post)
			title: metadata.title || slug, // 제목 (없으면 slug 사용)
			description: metadata.description || '', // 설명
			date: metadata.date || '', // 작성일
			content: stripMarkdown(content) // 검색용 순수 텍스트 (마크다운 문법 제거)
		};
	});

	return { posts };
};
