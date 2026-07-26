import { visit } from 'unist-util-visit';

// 링크 카드 플러그인 - 마크다운의 URL을 링크 카드로 변환
export default function rehypeLinkCards() {
	return (tree) => {
		// 단락 안에 있는 단일 URL 또는 링크 찾기
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName === 'p' && parent) {
				// 케이스 1: 단락 안에 텍스트만 있고, 그것이 URL인 경우
				if (node.children.length === 1 && node.children[0].type === 'text') {
					const text = node.children[0].value.trim();
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
				// 케이스 2: 단락 안에 <a> 태그만 있고, href가 URL인 경우 (remark-gfm이 자동 변환)
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
