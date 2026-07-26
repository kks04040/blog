<script lang="ts">
	/**
	 * 게시글 상세 페이지 컴포넌트
	 * 
	 * 3컬럼 레이아웃으로 게시글을 표시합니다:
	 * - 왼쪽: 목차(TOC) 사이드바
	 * - 가운데: 게시글 본문
	 * - 오른쪽: 관련 글 사이드바
	 * 
	 * 클라이언트 사이드에서:
	 * - 링크 카드 플레이스홀더를 실제 카드로 변환
	 * - 코드 블록에 복사 버튼 추가
	 */

	import type { Post } from '$lib/types';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import Giscus from '$lib/components/Giscus.svelte';

	// 서버에서 전달받은 게시글 데이터 (HTML 변환된 content 포함)
	export let data: Post & { linkMetadata?: Record<string, any> };

	/**
	 * 컴포넌트 마운트 후 클라이언트 사이드 초기화
	 * - 링크 카드 플레이스홀더를 실제 카드로 변환
	 * - 코드 블록에 복사 버튼 추가
	 */
	onMount(() => {
		// 1. 링크 카드 플레이스홀더 처리
		// 서버 사이드에서 생성된 플레이스홀더를 찾아 실제 카드로 교체
		const placeholders = document.querySelectorAll('.link-card-placeholder');
	
		for (const placeholder of Array.from(placeholders)) {
			const url = placeholder.getAttribute('data-url');
			if (!url) continue;

			// 서버에서 미리 가져온 OG 메타데이터 사용
			const metadata = data.linkMetadata?.[url] || { title: '', description: '', image: '', favicon: '' };
		
			// 링크 카드 DOM 요소 생성 및 교체
			const card = createLinkCard(url, metadata);
			placeholder.replaceWith(card);
		}

		// 2. 코드 블록에 복사 버튼 추가
		// Shiki로 하이라이트된 코드 블록(pre.shiki)에 복사 버튼을 동적으로 추가
		const codeBlocks = document.querySelectorAll('pre.shiki');
		for (const block of Array.from(codeBlocks)) {
			const button = document.createElement('button');
			button.className = 'code-copy-button';
			button.textContent = '복사';
		
			// 복사 버튼 클릭 핸들러
			button.addEventListener('click', async () => {
				const code = block.querySelector('code');
				if (code) {
					try {
						// 클립보드에 코드 내용 복사
						await navigator.clipboard.writeText(code.textContent || '');
						// 복사 성공 시 피드백 표시
						button.textContent = '복사됨!';
						button.classList.add('copied');
						setTimeout(() => {
							button.textContent = '복사';
							button.classList.remove('copied');
						}, 2000);
					} catch (err) {
						console.error('복사 실패:', err);
					}
				}
			});
		
			block.appendChild(button);
		}
	});

	/**
	 * 링크 카드 DOM 요소 생성 함수
	 * OG 메타데이터를 사용하여 시각적 링크 카드를 생성합니다.
	 * 
	 * @param url - 링크 대상 URL
	 * @param metadata - OG 메타데이터 (title, description, image, favicon)
	 * @returns 생성된 링크 카드 DOM 요소
	 */
	function createLinkCard(url: string, metadata: any) {
		const card = document.createElement('div');
		card.className = 'link-card';

		const hostname = new URL(url).hostname;

		card.innerHTML = `
			<a href="${url}" target="_blank" rel="noopener noreferrer" class="link-card-inner">
				<div class="link-card-content">
					<div class="link-card-title">${metadata.title || hostname}</div>
					${metadata.description ? `<div class="link-card-description">${metadata.description}</div>` : ''}
					<div class="link-card-meta">
						${metadata.favicon ? `<img src="${metadata.favicon}" alt="" class="link-card-favicon" loading="lazy">` : ''}
						<span class="link-card-domain">${hostname}</span>
					</div>
				</div>
				${metadata.image ? `
					<div class="link-card-image">
						<img src="${metadata.image}" alt="${metadata.title}" loading="lazy">
					</div>
				` : ''}
			</a>
		`;

		return card;
	}
</script>

<svelte:head>
	<title>{data.title} - 내 블로그</title>
	{#if data.description}
		<meta name="description" content={data.description} />
	{/if}
</svelte:head>

<div class="post-layout">
	<!-- 왼쪽 사이드바: 목차 -->
	<aside class="toc-sidebar">
		{#if data.toc && data.toc.length > 0}
			<nav class="toc">
				<h3>목차</h3>
				<ul>
					{#each data.toc as item}
						<li class="toc-level-{item.level}">
							<a href="#{item.id}">{item.text}</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	</aside>

	<!-- 가운데: 글 내용 -->
	<article class="post-main">
		<header class="post-header">
			<h1>{data.title}</h1>
			<time datetime={data.date}>
				{new Date(data.date).toLocaleDateString('ko-KR', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</time>
		</header>

		<div class="post-content">
			{@html data.content}
		</div>

		<!-- 댓글 섹션 (Giscus 설정 후 활성화) -->
		<!-- <Giscus 
			repo="your-username/your-repo"
			repoId="your-repo-id"
			category="General"
			categoryId="your-category-id"
		/> -->
	</article>

	<!-- 오른쪽 사이드바: 관련 글 -->
	<aside class="related-sidebar">
		{#if data.relatedPosts && data.relatedPosts.length > 0}
			<nav class="related-posts">
				<h3>관련 글</h3>
				<ul>
					{#each data.relatedPosts as post}
						<li>
							<a href="{base}/posts/{post.slug}">{post.title}</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	</aside>
</div>

<style>
	.post-layout {
		display: grid;
		grid-template-columns: 240px 1fr 240px;
		gap: 3rem;
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.toc-sidebar,
	.related-sidebar {
		position: sticky;
		top: 2rem;
		align-self: start;
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
	}

	.toc h3,
	.related-posts h3 {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-light);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.toc ul,
	.related-posts ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.toc li {
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.toc-level-2 {
		font-size: 0.9rem;
	}

	.toc-level-3 {
		font-size: 0.85rem;
		padding-left: 1rem;
		color: var(--color-text-light);
	}

	.toc a {
		color: var(--color-text);
		text-decoration: none;
		transition: color 0.2s;
	}

	.toc a:hover {
		color: var(--color-link);
	}

	.related-posts li {
		margin-bottom: 1rem;
	}

	.related-posts a {
		color: var(--color-text);
		text-decoration: none;
		font-size: 0.95rem;
		line-height: 1.5;
		transition: color 0.2s;
	}

	.related-posts a:hover {
		color: var(--color-link);
	}

	.post-main {
		min-width: 0;
	}

	.post-header {
		margin-bottom: 3rem;
		text-align: center;
	}

	.post-header h1 {
		font-size: 2.5rem;
		line-height: 1.2;
		margin-bottom: 1rem;
	}

	.post-header time {
		display: block;
		color: var(--color-text-light);
		font-size: 0.95rem;
	}

	.post-content {
		font-size: 1.05rem;
		line-height: 1.8;
	}

	.post-content :global(h1) {
		font-size: 2rem;
		margin: 2.5rem 0 1rem;
	}

	.post-content :global(h2) {
		font-size: 1.6rem;
		margin: 2rem 0 0.8rem;
	}

	.post-content :global(h3) {
		font-size: 1.3rem;
		margin: 1.5rem 0 0.6rem;
	}

	.post-content :global(p) {
		margin-bottom: 1.2rem;
	}

	.post-content :global(ul),
	.post-content :global(ol) {
		margin-bottom: 1.2rem;
		padding-left: 2rem;
	}

	.post-content :global(li) {
		margin-bottom: 0.4rem;
	}

	.post-content :global(blockquote) {
		border-left: 4px solid var(--color-border);
		padding-left: 1.5rem;
		margin: 1.5rem 0;
		color: var(--color-text-light);
		font-style: italic;
	}

	.post-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.9em;
		background: var(--color-code-bg);
		padding: 0.2em 0.4em;
		border-radius: 3px;
	}

	.post-content :global(pre) {
		background: var(--color-code-bg);
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		margin: 1.5rem 0;
	}

	.post-content :global(pre.shiki) {
		position: relative;
		background: #f8f9fa !important;
		padding: 1rem !important;
		border-radius: 8px;
		border: 1px solid #e9ecef;
		margin: 1.5rem 0;
	}

	[data-theme="dark"] .post-content :global(pre.shiki) {
		background: #2b2d30 !important;
		border-color: #3a3d40;
	}

	.post-content :global(pre.shiki code) {
		display: flex;
		overflow-x: auto;
		background: transparent !important;
	}

	.post-content :global(.line-numbers) {
		display: flex;
		flex-direction: column;
		padding-right: 1rem;
		border-right: 1px solid #dee2e6;
		margin-right: 1rem;
		user-select: none;
		min-width: 2.5rem;
		text-align: right;
	}

	[data-theme="dark"] .post-content :global(.line-numbers) {
		border-right-color: #495057;
	}

	.post-content :global(.line-number) {
		color: #adb5bd;
		font-size: 0.85em;
		line-height: 1.5;
	}

	[data-theme="dark"] .post-content :global(.line-number) {
		color: #6c757d;
	}

	.post-content :global(.code-content) {
		flex: 1;
	}

	.post-content :global(.code-copy-button) {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		width: 32px;
		height: 32px;
		padding: 0;
		background: var(--color-bg);
		border: 1px solid var(--color-text);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 0;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
	}

	.post-content :global(pre.shiki:hover .code-copy-button) {
		opacity: 1;
	}

	.post-content :global(.code-copy-button:hover) {
		background: var(--color-text);
		color: var(--color-bg);
	}

	.post-content :global(.code-copy-button.copied) {
		background: #28a745;
		border-color: #28a745;
		color: white;
	}

	.post-content :global(.code-copy-button::before) {
		content: "📋";
		font-size: 16px;
	}

	.post-content :global(.code-copy-button.copied::before) {
		content: "✓";
	}

	.post-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.post-content :global(img) {
		max-width: 100%;
		height: auto;
		margin: 1.5rem 0;
		border-radius: 6px;
	}

	.post-content :global(a) {
		color: var(--color-link);
		text-decoration: underline;
	}

	.post-content :global(a:hover) {
		color: var(--color-link-hover);
	}

	.post-content :global(hr) {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: 2.5rem 0;
	}

	.post-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
		font-size: 0.95rem;
	}

	.post-content :global(thead) {
		background-color: var(--color-code-bg);
	}

	.post-content :global(th),
	.post-content :global(td) {
		border: 1px solid var(--color-border);
		padding: 0.75rem 1rem;
		text-align: left;
	}

	.post-content :global(th) {
		font-weight: 600;
	}

	.post-content :global(tbody tr:nth-child(even)) {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.post-content :global(tbody tr:hover) {
		background-color: rgba(0, 0, 0, 0.04);
	}

	.post-content :global(section.footnotes) {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border);
		font-size: 0.9rem;
		color: var(--color-text-light);
	}

	.post-content :global(section.footnotes h2) {
		font-size: 1.2rem;
		margin-bottom: 1rem;
	}

	.post-content :global(section.footnotes ol) {
		padding-left: 1.5rem;
	}

	.post-content :global(section.footnotes li) {
		margin-bottom: 0.5rem;
	}

	.post-content :global(sup) {
		font-size: 0.75em;
	}

	.post-content :global(sup a) {
		text-decoration: none;
	}

	.post-content :global(.data-footnote-backref) {
		text-decoration: none;
		margin-left: 0.25rem;
	}

	.post-content :global(.link-card) {
		margin: 1.5rem 0;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		transition: box-shadow 0.2s;
	}

	.post-content :global(.link-card:hover) {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.post-content :global(.link-card-inner) {
		display: flex;
		text-decoration: none;
		color: inherit;
	}

	.post-content :global(.link-card-content) {
		flex: 1;
		padding: 1rem;
		min-width: 0;
	}

	.post-content :global(.link-card-title) {
		font-weight: 600;
		font-size: 1rem;
		margin-bottom: 0.5rem;
		line-height: 1.4;
		color: var(--color-text);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.post-content :global(.link-card-description) {
		font-size: 0.85rem;
		color: var(--color-text-light);
		line-height: 1.5;
		margin-bottom: 0.75rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.post-content :global(.link-card-meta) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--color-text-light);
	}

	.post-content :global(.link-card-favicon) {
		width: 16px;
		height: 16px;
	}

	.post-content :global(.link-card-image) {
		width: 120px;
		flex-shrink: 0;
		background-color: var(--color-code-bg);
	}

	.post-content :global(.link-card-image img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		margin: 0;
		border-radius: 0;
	}

	/* 반응형: 작은 화면에서는 사이드바 숨김 */
	@media (max-width: 1200px) {
		.post-layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.toc-sidebar,
		.related-sidebar {
			position: static;
			max-height: none;
		}
	}
</style>
