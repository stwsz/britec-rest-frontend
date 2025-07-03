<script lang="ts">
	import { slide } from 'svelte/transition';
	import { CheckCircleOutline, InfoCircleOutline, BanOutline } from 'flowbite-svelte-icons';

	export let toastStatus: boolean = false;
	export let toastMessage: string = '';
	export let toastType: 'info' | 'error' | 'success' = 'info';
	export let position: string;

	let counter = 4;

	$: if (toastStatus) {
		counter = 4;
		timeout();
	}

	function timeout() {
		if (--counter > 0) return setTimeout(timeout, 1000);
		toastStatus = false;
	}
</script>

<div
	transition:slide
	class={`fixed z-[9999] flex w-[90%] max-w-xs items-center gap-3 rounded-xs px-5 py-4 text-sm shadow-lg sm:text-base md:max-w-sm ${position}
		${toastType === 'success' ? 'bg-success/10 text-success border-success/30 border' : ''}
		${toastType === 'error' ? 'bg-error/10 text-error border-error/30 border' : ''}
		${toastType === 'info' ? 'bg-warning/10 text-warning border-warning/30 border' : ''}
	`}
	aria-live="polite"
	aria-atomic="true"
	role="status"
	hidden={!toastStatus}
>
	{#if toastType === 'error'}
		<BanOutline class="mt-0.5 h-5 w-5 shrink-0" />
	{:else if toastType === 'success'}
		<CheckCircleOutline class="mt-0.5 h-5 w-5 shrink-0" />
	{:else}
		<InfoCircleOutline class="mt-0.5 h-5 w-5 shrink-0" />
	{/if}

	<span class="block text-xs leading-snug font-medium">{toastMessage}</span>
</div>
