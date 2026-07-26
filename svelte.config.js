import adapter from '@sveltejs/adapter-static';
import fs from 'fs';
import path from 'path';

/**
 * 마크다운 파일에서 slug 목록을 동적으로 가져옵니다.
 * 새 글이 추가되어도 자동으로 반영됩니다.
 */
function getPostSlugs() {
	const contentDir = path.join(process.cwd(), 'src/content');
	const files = fs.readdirSync(contentDir);
	return files
		.filter(f => f.endsWith('.md'))
		.map(f => `/posts/${f.replace('.md', '')}`);
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		}),
		paths: {
			base: process.env.BASE_PATH || ''
		},
		prerender: {
			entries: ['/', ...getPostSlugs()],
			handleHttpError: 'warn'
		}
	}
};

export default config;
