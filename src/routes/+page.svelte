<script lang="ts">
	/**
	 * 홈 페이지 컴포넌트
	 * 
	 * 최신 게시글 목록을 표시합니다.
	 * 각 게시글은 제목, 날짜, 설명을 포함합니다.
	 */

	import type { Post } from '$lib/types';
	import { base } from '$app/paths';

	// 서버에서 전달받은 게시글 데이터
	export let data: { posts: Post[] };
</script>

<!-- SEO 메타 태그 -->
<svelte:head>
	<title>내 블로그</title>
	<meta name="description" content="개인 블로그" />
</svelte:head>

<div class="container">
	<h1>최근 글</h1>
	
	<!-- 게시글 목록 -->
	<div class="post-list">
		{#each data.posts as post}
			<article class="post-item">
				<h2 class="post-title">
					<!-- 게시글 상세 페이지로 이동하는 링크 -->
					<a href="{base}/posts/{post.slug}">{post.title}</a>
				</h2>
				<!-- 작성일 (한국어 형식으로 포맷팅) -->
				<time class="post-date" datetime={post.date}>
					{new Date(post.date).toLocaleDateString('ko-KR', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
				<!-- 게시글 설명 (있는 경우만 표시) -->
				{#if post.description}
					<p class="post-description">{post.description}</p>
				{/if}
			</article>
		{/each}
	</div>
</div>

<style>
	h1 {
		font-size: 2rem;
		margin-bottom: 2rem;
	}

	.post-list {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.post-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.post-title {
		font-size: 1.5rem;
		line-height: 1.3;
	}

	.post-title a {
		color: var(--color-text);
	}

	.post-title a:hover {
		color: var(--color-link);
	}

	.post-date {
		font-size: 0.9rem;
		color: var(--color-text-light);
	}

	.post-description {
		color: var(--color-text-light);
		line-height: 1.6;
	}
</style>
