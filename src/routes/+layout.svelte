<script lang="ts">
	import '../app.css';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	export let data;

	let isDark = false;
	let searchModal: SearchModal;

	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}

	function openSearch() {
		searchModal?.open();
	}

	// 초기 테마 설정
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem('theme');
		if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			isDark = true;
			document.documentElement.setAttribute('data-theme', 'dark');
		}
	}
</script>

<header class="site-header">
	<div class="container">
		<a href="{base}/" class="site-title">내 블로그</a>
		<div class="header-actions">
			<button class="search-trigger" on:click={openSearch}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>
				<span>검색</span>
				<kbd>⌘K</kbd>
			</button>
			<button class="theme-toggle" on:click={toggleTheme}>
				{#if isDark}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="5"></circle>
						<line x1="12" y1="1" x2="12" y2="3"></line>
						<line x1="12" y1="21" x2="12" y2="23"></line>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
						<line x1="1" y1="12" x2="3" y2="12"></line>
						<line x1="21" y1="12" x2="23" y2="12"></line>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</header>

<main>
	<slot />
</main>

<SearchModal posts={data.posts} bind:this={searchModal} />

<footer class="site-footer">
	<div class="container">
		<p>&copy; 2026 내 블로그</p>
	</div>
</footer>

<style>
	.site-header {
		border-bottom: 1px solid var(--color-border);
		padding: 1.5rem 0;
		margin-bottom: 3rem;
	}

	.site-header .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.site-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.site-title:hover {
		text-decoration: none;
		color: var(--color-link);
	}

	.header-actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.search-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-bg);
		color: var(--color-text-light);
		cursor: pointer;
		transition: all 0.2s;
	}

	.search-trigger:hover {
		border-color: var(--color-link);
		color: var(--color-link);
	}

	.search-trigger kbd {
		font-size: 0.75rem;
		padding: 0.125rem 0.375rem;
		background: var(--color-code-bg);
		border-radius: 4px;
	}

	.theme-toggle {
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-bg);
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.2s;
	}

	.theme-toggle:hover {
		border-color: var(--color-link);
		color: var(--color-link);
	}

	main {
		min-height: calc(100vh - 200px);
	}

	.site-footer {
		border-top: 1px solid var(--color-border);
		padding: 2rem 0;
		margin-top: 4rem;
		text-align: center;
		color: var(--color-text-light);
		font-size: 0.9rem;
	}
</style>
