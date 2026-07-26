import type { LayoutLoad } from './$types';

export const prerender = true;

const modules = import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

function stripMarkdown(text: string): string {
	return text
		.replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
		.replace(/`([^`]+)`/g, '$1') // 인라인 코드
		.replace(/!\[.*?\]\(.*?\)/g, '') // 이미지
		.replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // 링크 (텍스트만 남김)
		.replace(/#{1,6}\s+/g, '') // 헤딩
		.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // 강조/기울임
		.replace(/~~([^~]+)~~/g, '$1') // 취소선
		.replace(/^\s*[-*+]\s+/gm, '') // 리스트
		.replace(/^\s*\d+\.\s+/gm, '') // 순번 리스트
		.replace(/^\s*>\s+/gm, '') // 인용
		.replace(/\|.*\|/g, '') // 테이블
		.replace(/\n+/g, ' ') // 줄바꿈을 공백으로
		.replace(/\s+/g, ' ') // 연속 공백 정리
		.trim();
}

export const load: LayoutLoad = async () => {
	const posts = Object.entries(modules).map(([path, raw]) => {
		const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		const metadata: Record<string, string> = {};
		let content = '';

		if (match) {
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
			content = match[2];
		}

		const slug = path.split('/').pop()?.replace('.md', '') || '';

		return {
			slug,
			title: metadata.title || slug,
			description: metadata.description || '',
			date: metadata.date || '',
			content: stripMarkdown(content)
		};
	});

	return { posts };
};
