import { visit } from 'unist-util-visit';
import { codeToHtml } from 'shiki';

export default function rehypeCodeHighlight() {
	return async (tree) => {
		const replacements = [];

		// 코드 블록 찾기 (부모 정보 포함)
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName === 'pre' && node.children[0]?.tagName === 'code') {
				const codeNode = node.children[0];
				const className = codeNode.properties?.className?.[0] || '';
				const lang = className.replace('language-', '') || 'text';
				const code = codeNode.children[0]?.value || '';

				// Shiki가 지원하지 않는 언어는 건너뛰기
				const unsupportedLanguages = ['math', 'latex', 'tex'];
				if (unsupportedLanguages.includes(lang)) {
					return;
				}

				replacements.push({ parent, index, lang, code });
			}
		});

		// 각 코드 블록을 하이라이트된 HTML로 변환
		for (const { parent, index, lang, code } of replacements) {
			try {
				const highlighted = await codeToHtml(code, {
					lang,
					themes: {
						light: 'github-light',
						dark: 'github-dark'
					}
				});

				// 라인 번호 추가
				const lines = code.split('\n');
				const lineNumbers = lines.map((_, i) => `<span class="line-number">${i + 1}</span>`).join('');

				// Shiki HTML에 라인 번호 래퍼 추가
				const wrappedHtml = highlighted
					.replace('<code>', `<code><span class="line-numbers">${lineNumbers}</span><span class="code-content">`)
					.replace('</code>', '</span></code>');

				// 원본 pre 노드를 raw HTML 노드로 교체
				parent.children[index] = {
					type: 'raw',
					value: wrappedHtml
				};
			} catch (error) {
				console.error(`Failed to highlight code block: ${error}`);
			}
		}
	};
}
