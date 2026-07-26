/**
 * 타입 정의 파일
 * 
 * 블로그에서 사용되는 데이터 구조를 정의합니다.
 */

/**
 * 게시글 데이터 인터페이스
 * 마크다운 파일에서 파싱된 게시글의 모든 메타데이터를 포함합니다.
 */
export interface Post {
	/** URL 경로에 사용되는 고유 식별자 (파일명에서 .md 제거) */
	slug: string;
	/** 게시글 제목 */
	title: string;
	/** 작성일 (ISO 8601 형식: YYYY-MM-DD) */
	date: string;
	/** 게시글 설명 (SEO 및 목록 페이지에서 사용) */
	description?: string;
	/** 게시글 내용 (HTML 또는 마크다운) */
	content?: string;
	/** 목차 항목 목록 (자동 생성) */
	toc?: TocItem[];
	/** 관련 게시글 목록 (날짜 기준으로 가까운 3개) */
	relatedPosts?: Array<{ slug: string; title: string; date: string }>;
}

/**
 * 목차 항목 인터페이스
 * 게시글의 헤딩을 기반으로 자동 생성됩니다.
 */
export interface TocItem {
	/** 헤딩 레벨 (2: ##, 3: ###) */
	level: number;
	/** 헤딩 텍스트 */
	text: string;
	/** 앵커 링크 ID (소문자, 공백은 하이픈으로 변환) */
	id: string;
}
