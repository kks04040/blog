/**
 * 게시글 상세 페이지 서버 로직
 * 
 * 마크다운 파일을 읽어서 HTML로 변환하고, 메타데이터를 추출합니다.
 * 서버 사이드에서 실행되어 OG 메타데이터를 가져옵니다.
 */

import type { PageServerLoad, EntryGenerator } from './$types';
import { error } from '@sveltejs/kit';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFootnotes from 'remark-footnotes';
import remarkMath from 'remark-math';
import remarkDeflist from 'remark-deflist';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeLinkCards from '$lib/rehype-link-cards.js';
import rehypeCodeHighlight from '$lib/rehype-code-highlight.js';

/**
 * 링크 메타데이터 캐시
 * 동일한 URL에 대한 중복 fetch를 방지합니다.
 */
const metadataCache = new Map<string, any>();

/**
 * 모든 마크다운 파일을 동적으로 가져옵니다.
 * - query: '?raw': 원본 텍스트로 가져오기
 * - import: 'default': 기본 export 가져오기
 */
const modules = import.meta.glob('../../../content/**/*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

/**
 * 정적 사이트 생성을 위한 엔트리 포인트 생성
 * adapter-static이 어떤 페이지를 미리 렌더링할지 알려줍니다.
 */
export const entries: EntryGenerator = () => {
	return Object.keys(modules).map(path => ({
		slug: path.split('/').pop()?.replace('.md', '') || ''
	}));
};

/**
 * URL의 OG 메타데이터를 가져오는 함수
 * 서버 사이드에서만 실행되어 CORS 문제를 우회합니다.
 * 
 * @param url - 메타데이터를 가져올 URL
 * @returns OG 메타데이터 (title, description, image, favicon)
 */
async function fetchLinkMetadata(url: string) {
	// 캐시된 데이터가 있으면 반환
	if (metadataCache.has(url)) {
		return metadataCache.get(url);
	}

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
			},
			signal: AbortSignal.timeout(5000) // 5초 타임아웃
		});
		const html = await response.text();

		/**
		 * 메타 태그 추출 헬퍼 함수
		 * property 또는 name 속성으로 메타 태그를 찾습니다.
		 */
		const getMeta = (property: string) => {
			const match = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'));
			return match ? match[1] : null;
		};

		// OG 메타데이터 추출 (우선순위: og > twitter > 기본 태그)
		const title = getMeta('og:title') || getMeta('twitter:title') || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '';
		const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || '';
		const image = getMeta('og:image') || getMeta('twitter:image') || '';
		const favicon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i)?.[1] || '';

		const metadata = { title, description, image, favicon };
		metadataCache.set(url, metadata); // 캐시에 저장
		return metadata;
	} catch (e) {
		// 에러 발생 시 빈 메타데이터 반환
		return { title: '', description: '', image: '', favicon: '' };
	}
}

/**
 * 페이지 데이터 로드 함수
 * 마크다운 파일을 읽어서 HTML로 변환하고 메타데이터를 추출합니다.
 */
export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const path = `../../../content/${slug}.md`;
	
	// 파일이 없으면 404 에러
	if (!modules[path]) {
		error(404, `Post not found: ${slug}`);
	}
	
	// 마크다운 원본 내용 가져오기
	const markdown = await modules[path]();
	
	/**
	 * YAML frontmatter 파싱
	 * 형식: ---\ntitle: 제목\ndate: 2024-01-01\n---\n본문
	 */
	const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	let metadata = { title: slug, date: new Date().toISOString(), description: '' };
	let content = markdown;
	
	if (frontmatterMatch) {
		const yaml = frontmatterMatch[1];
		content = frontmatterMatch[2];
		
		// frontmatter의 각 라인을 파싱하여 key-value로 저장
		yaml.split('\n').forEach(line => {
			const colonIndex = line.indexOf(':');
			if (colonIndex > 0) {
				const key = line.slice(0, colonIndex).trim();
				const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
				if (key && value) {
					metadata[key as keyof typeof metadata] = value;
				}
			}
		});
	}
	
	/**
	 * 목차(TOC) 추출
	 * ## 및 ### 헤딩을 찾아서 목차 목록을 생성합니다.
	 */
	const toc: Array<{ level: number; text: string; id: string }> = [];
	const headingRegex = /^(#{2,3})\s+(.+)$/gm;
	let match;
	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length;
		const text = match[2];
		// 인라인 코드 제거
		const plainText = text.replace(/`([^`]*)`/g, '$1');
		// ID 생성: 소문자, 특수문자는 하이픈으로, 앞뒤 하이픈 제거
		const id = plainText.toLowerCase().replace(/[^\w가-힣]+/g, '-').replace(/^-+|-+$/g, '');
		toc.push({ level, text, id });
	}
	
	/**
	 * 마크다운을 HTML로 변환
	 * unified 파이프라인을 사용하여 여러 플러그인을 순차적으로 적용합니다.
	 */
	const processor = unified()
		.use(remarkParse)          // 마크다운 파싱
		.use(remarkGfm)            // GitHub Flavored Markdown 지원 (테이블, 취소선 등)
		.use(remarkFootnotes)      // 각주 지원
		.use(remarkMath)           // 수학 공식 파싱 ($...$, $$...$$)
		.use(remarkDeflist)        // 정의 목록 지원 (용어\n: 정의 문법을 <dl>로 변환)
		.use(remarkRehype, { allowDangerousHtml: true }) // 마크다운 AST를 HTML AST로 변환 (인라인 HTML 보존)
		.use(rehypeLinkCards)      // URL을 링크 카드로 변환
		.use(rehypeCodeHighlight)  // 코드 블록 하이라이팅
		.use(rehypeRaw)            // HTML 태그 처리
		.use(rehypeKatex)          // 수학 공식 렌더링
		.use(rehypeStringify, { allowDangerousHtml: true }); // HTML 문자열로 변환
	
	const result = await processor.process(content);
	let html = String(result);
	
	/**
	 * HTML 헤딩 태그에 id 속성 추가
	 * 목차에서 링크 클릭 시 해당 위치로 스크롤하기 위해 필요합니다.
	 */
	html = html.replace(/<h([23])>(.*?)<\/h[23]>/g, (match, level, text) => {
		const plainText = text.replace(/<[^>]*>/g, '');
		const id = plainText.toLowerCase().replace(/[^\w가-힣]+/g, '-').replace(/^-+|-+$/g, '');
		return `<h${level} id="${id}">${text}</h${level}>`;
	});
	
	/**
	 * 링크 카드 플레이스홀더 찾기
	 * rehypeLinkCards 플러그인이 생성한 플레이스홀더를 찾습니다.
	 */
	const placeholderRegex = /<div class="link-card-placeholder" data-url="([^"]+)">[^<]*<\/div>/g;
	const matches = [...html.matchAll(placeholderRegex)];
	
	/**
	 * 모든 링크의 메타데이터 가져오기
	 * 각 URL에 대해 OG 메타데이터를 fetch하여 클라이언트로 전달합니다.
	 */
	const linkMetadata: Record<string, any> = {};
	for (const match of matches) {
		const url = match[1];
		if (!linkMetadata[url]) {
			linkMetadata[url] = await fetchLinkMetadata(url);
		}
	}
	
	/**
	 * 관련 글 계산
	 * 현재 글을 제외하고 날짜 기준으로 가까운 3개를 선택합니다.
	 */
	const allPosts: Array<{ slug: string; title: string; date: string }> = [];
	for (const [modulePath, moduleLoader] of Object.entries(modules)) {
		const moduleMarkdown = await moduleLoader();
		const moduleFrontmatterMatch = moduleMarkdown.match(/^---\n([\s\S]*?)\n---\n/);
		if (moduleFrontmatterMatch) {
			const yaml = moduleFrontmatterMatch[1];
			const postMeta: any = { title: '', date: '' };
			yaml.split('\n').forEach(line => {
				const colonIndex = line.indexOf(':');
				if (colonIndex > 0) {
					const key = line.slice(0, colonIndex).trim();
					const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
					if (key && value) {
						postMeta[key] = value;
					}
				}
			});
			const moduleSlug = modulePath.split('/').pop()?.replace('.md', '') || '';
			if (moduleSlug !== slug) {
				allPosts.push({ slug: moduleSlug, title: postMeta.title, date: postMeta.date });
			}
		}
	}
	
	// 현재 글의 날짜와 가장 가까운 3개 선택
	allPosts.sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		const currentDate = new Date(metadata.date).getTime();
		return Math.abs(dateA - currentDate) - Math.abs(dateB - currentDate);
	});
	
	const relatedPosts = allPosts.slice(0, 3);
	
	// 클라이언트로 전달할 데이터 반환
	return {
		slug,
		title: metadata.title,
		date: metadata.date,
		description: metadata.description,
		content: html,
		toc,
		relatedPosts,
		linkMetadata
	};
};
