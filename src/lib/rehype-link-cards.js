/**
 * 링크 카드 Rehype 플러그인
 * 
 * 마크다운의 URL을 링크 카드로 변환합니다.
 * 단락 안에 URL만 있는 경우 OG 메타데이터를 가져와서 카드 형태로 표시합니다.
 */

import { visit } from 'unist-util-visit';

/**
 * Rehype 플러그인 메인 함수
 * AST를 순회하면서 링크를 찾아 카드 플레이스홀더로 변환합니다.
 */
export default function rehypeLinkCards() {
	return (tree) => {
		/**
		 * 단락(<p>) 안의 링크 찾기
		 * 단락 안에 URL만 있는 경우 카드로 변환합니다.
		 */
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName === 'p' && parent) {
				// 케이스 1: 단락 안에 텍스트만 있고, 그것이 URL인 경우
				if (node.children.length === 1 && node.children[0].type === 'text') {
					const text = node.children[0].value.trim();
					// URL 패턴 매칭 (http:// 또는 https://로 시작)
					if (text.match(/^https?:\/\/[^\s]+$/)) {
						// URL을 링크 카드 플레이스홀더로 변환
						node.children = [{
							type: 'element',
							tagName: 'div',
							properties: { 
								className: ['link-card-placeholder'],
								dataUrl: text
							},
							children: [{ type: 'text', value: text }]
						}];
					}
				}
				// 케이스 2: 단락 안에 <a> 태그만 있고, href가 URL인 경우
				// (remark-gfm이 자동 변환한 링크)
				else if (node.children.length === 1 && node.children[0].type === 'element' && node.children[0].tagName === 'a') {
					const link = node.children[0];
					const href = link.properties?.href;
					if (href && href.match(/^https?:\/\/[^\s]+$/)) {
						// 링크를 카드 플레이스홀더로 변환
						node.children = [{
							type: 'element',
							tagName: 'div',
							properties: { 
								className: ['link-card-placeholder'],
								dataUrl: href
							},
							children: [{ type: 'text', value: href }]
						}];
					}
				}
			}
		});
	};
}
