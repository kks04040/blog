import type { Post } from '$lib/types';

const modules = import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

function parseFrontmatter(markdown: string) {
	const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	const metadata: Record<string, string> = {};
	let content = markdown;

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

	return { metadata, content };
}

export async function load() {
	const posts: Post[] = Object.entries(modules).map(([path, raw]) => {
		const { metadata } = parseFrontmatter(raw);
		const slug = path.split('/').pop()?.replace('.md', '') || '';

		return {
			slug,
			title: metadata.title || slug,
			date: metadata.date || new Date().toISOString(),
			description: metadata.description || ''
		} as Post;
	});

	posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { posts };
}
