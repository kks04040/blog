/**
 * 코드 하이라이팅 Rehype 플러그인
 * 
 * Shiki를 사용하여 코드 블록에 구문 하이라이팅을 적용합니다.
 * 마크다운의 코드 블록을 HTML로 변환하고, 라인 번호를 추가합니다.
 */

import { visit } from 'unist-util-visit';
import { codeToHtml } from 'shiki';

/**
 * Rehype 플러그인 메인 함수
 * AST를 순회하면서 코드 블록을 찾아 하이라이트된 HTML로 변환합니다.
 */
export default function rehypeCodeHighlight() {
	return async (tree) => {
		const replacements = [];

		/**
		 * AST 순회하며 코드 블록 찾기
		 * <pre><code> 구조를 찾습니다.
		 */
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName === 'pre' && node.children[0]?.tagName === 'code') {
				const codeNode = node.children[0];
				// 언어 클래스에서 언어명 추출 (예: 'language-javascript' -> 'javascript')
				const className = codeNode.properties?.className?.[0] || '';
				const lang = className.replace('language-', '') || 'text';
				// 코드 내용 추출
				const code = codeNode.children[0]?.value || '';

				// Shiki가 지원하지 않는 언어는 건너뛰기 (수학 공식 등)
				const unsupportedLanguages = ['math', 'latex', 'tex'];
				if (unsupportedLanguages.includes(lang)) {
					return;
				}

				// 변환할 코드 블록 정보 저장
				replacements.push({ parent, index, lang, code });
			}
		});

		/**
		 * 각 코드 블록을 하이라이트된 HTML로 변환
		 * Shiki로 구문 강조를 적용하고 라인 번호를 추가합니다.
		 */
		for (const { parent, index, lang, code } of replacements) {
			try {
				// Shiki로 코드 하이라이팅 (라이트/다크 테마 지원)
				const highlighted = await codeToHtml(code, {
					lang,
					themes: {
						light: 'github-light',
						dark: 'github-dark'
					}
				});

				// 라인 번호 생성
				const lines = code.split('\n');
				const lineNumbers = lines.map((_, i) => `<span class="line-number">${i + 1}</span>`).join('');

				// Shiki HTML에 라인 번호 래퍼 추가
				const wrappedHtml = highlighted
					.replace('<code>', `<code><span class="line-numbers">${lineNumbers}</span><span class="code-content">`)
					.replace('</code>', '</span></code>');

				// 원본 pre 노드를 하이라이트된 HTML로 교체
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
