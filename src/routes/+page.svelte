<script lang="ts">
	import type { Post } from '$lib/types';

	export let data: { posts: Post[] };
</script>

<svelte:head>
	<title>내 블로그</title>
	<meta name="description" content="개인 블로그" />
</svelte:head>

<div class="container">
	<h1>최근 글</h1>
	
	<div class="post-list">
		{#each data.posts as post}
			<article class="post-item">
				<h2 class="post-title">
					<a href="/posts/{post.slug}">{post.title}</a>
				</h2>
				<time class="post-date" datetime={post.date}>
					{new Date(post.date).toLocaleDateString('ko-KR', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
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
