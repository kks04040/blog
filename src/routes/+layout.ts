import type { LayoutLoad } from './$types';

export const prerender = true;

const modules = import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

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
			content
		};
	});

	return { posts };
};
