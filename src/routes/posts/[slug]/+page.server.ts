import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFootnotes from 'remark-footnotes';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeLinkCards from '$lib/rehype-link-cards.js';
import rehypeCodeHighlight from '$lib/rehype-code-highlight.js';

// 링크 메타데이터 캐시
const metadataCache = new Map<string, any>();

async function fetchLinkMetadata(url: string) {
	if (metadataCache.has(url)) {
		return metadataCache.get(url);
	}

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
			},
			signal: AbortSignal.timeout(5000)
		});
		const html = await response.text();

		const getMeta = (property: string) => {
			const match = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'));
			return match ? match[1] : null;
		};

		const title = getMeta('og:title') || getMeta('twitter:title') || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '';
		const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || '';
		const image = getMeta('og:image') || getMeta('twitter:image') || '';
		const favicon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i)?.[1] || '';

		const metadata = { title, description, image, favicon };
		metadataCache.set(url, metadata);
		return metadata;
	} catch (e) {
		return { title: '', description: '', image: '', favicon: '' };
	}
}

const modules = import.meta.glob('../../../content/**/*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	const path = `../../../content/${slug}.md`;
	
	if (!modules[path]) {
		error(404, `Post not found: ${slug}`);
	}
	
	const markdown = await modules[path]();
	
	// YAML frontmatter 파싱
	const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	let metadata = { title: slug, date: new Date().toISOString(), description: '' };
	let content = markdown;
	
	if (frontmatterMatch) {
		const yaml = frontmatterMatch[1];
		content = frontmatterMatch[2];
		
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
	
	// 목차(TOC) 추출
	const toc: Array<{ level: number; text: string; id: string }> = [];
	const headingRegex = /^(#{2,3})\s+(.+)$/gm;
	let match;
	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length;
		const text = match[2];
		const plainText = text.replace(/`([^`]*)`/g, '$1');
		const id = plainText.toLowerCase().replace(/[^\w가-힣]+/g, '-').replace(/^-+|-+$/g, '');
		toc.push({ level, text, id });
	}
	
	// 마크다운을 HTML로 변환
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkFootnotes)
		.use(remarkMath)
		.use(remarkRehype)
		.use(rehypeLinkCards)
		.use(rehypeCodeHighlight)
		.use(rehypeRaw)
		.use(rehypeKatex)
		.use(rehypeStringify, { allowDangerousHtml: true });
	
	const result = await processor.process(content);
	let html = String(result);
	
	// HTML 헤딩 태그에 id 속성 추가
	html = html.replace(/<h([23])>(.*?)<\/h[23]>/g, (match, level, text) => {
		const plainText = text.replace(/<[^>]*>/g, '');
		const id = plainText.toLowerCase().replace(/[^\w가-힣]+/g, '-').replace(/^-+|-+$/g, '');
		return `<h${level} id="${id}">${text}</h${level}>`;
	});
	
	// HTML에서 링크 카드 플레이스홀더 찾기
	const placeholderRegex = /<div class="link-card-placeholder" data-url="([^"]+)">[^<]*<\/div>/g;
	const matches = [...html.matchAll(placeholderRegex)];
	
	// 모든 링크의 메타데이터 가져오기
	const linkMetadata: Record<string, any> = {};
	for (const match of matches) {
		const url = match[1];
		if (!linkMetadata[url]) {
			linkMetadata[url] = await fetchLinkMetadata(url);
		}
	}
	
	// 관련 글 (현재 글 제외하고 날짜순으로 가까운 3개)
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
	
	allPosts.sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		const currentDate = new Date(metadata.date).getTime();
		return Math.abs(dateA - currentDate) - Math.abs(dateB - currentDate);
	});
	
	const relatedPosts = allPosts.slice(0, 3);
	
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
