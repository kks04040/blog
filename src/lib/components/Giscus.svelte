<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let repo: string;
	export let repoId: string;
	export let category: string = 'General';
	export let categoryId: string;

	let theme = 'light';

	onMount(() => {
		// 테마 감지
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		theme = savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';

		// Giscus 스크립트 로드
		const script = document.createElement('script');
		script.src = 'https://giscus.app/client.js';
		script.setAttribute('data-repo', repo);
		script.setAttribute('data-repo-id', repoId);
		script.setAttribute('data-category', category);
		script.setAttribute('data-category-id', categoryId);
		script.setAttribute('data-mapping', 'pathname');
		script.setAttribute('data-strict', '0');
		script.setAttribute('data-reactions-enabled', '1');
		script.setAttribute('data-emit-metadata', '0');
		script.setAttribute('data-input-position', 'bottom');
		script.setAttribute('data-theme', theme);
		script.setAttribute('data-lang', 'ko');
		script.setAttribute('crossorigin', 'anonymous');
		script.async = true;

		document.body.appendChild(script);

		// 테마 변경 감지
		const observer = new MutationObserver(() => {
			const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
			if (newTheme !== theme) {
				theme = newTheme;
				// Giscus iframe에 테마 메시지 전송
				const iframe = document.querySelector('iframe.giscus-frame');
				if (iframe) {
					iframe.contentWindow?.postMessage(
						{ giscus: { setConfig: { theme: newTheme } } },
						'https://giscus.app'
					);
				}
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => {
			observer.disconnect();
			script.remove();
		};
	});
</script>

<div class="comments">
	<div class="giscus"></div>
</div>

<style>
	.comments {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}
</style>
