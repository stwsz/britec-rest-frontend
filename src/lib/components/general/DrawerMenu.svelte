<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		Drawer,
		Accordion,
		AccordionItem,
		CloseButton,
		Modal,
		Button,
		Card
	} from 'flowbite-svelte';
	import {
		ArrowLeftToBracketOutline,
		ExclamationCircleOutline,
		PenOutline,
		CheckPlusCircleOutline
	} from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	import type { comanda } from '$lib/types/comanda';

	export let hiddenDrawer: boolean;

	let transitionParamsRight = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	let signOutModal = false;
	let comandasAbertasModal = false;
	let comandasFechadasModal = false;

	let comandasAbertas: comanda[] = [];
	let comandasFechadas: comanda[] = [];

	onMount(async () => {
		const reqComandasAbertas = await fetch('http://26.204.212.174:8080/api/tables/opened');
		const reqComandasFechadas = await fetch('http://26.204.212.174:8080/api/tables/closed');

		comandasAbertas = await reqComandasAbertas.json();
		comandasFechadas = await reqComandasFechadas.json();
	});
</script>

<Drawer
	placement="right"
	transitionParams={transitionParamsRight}
	class="flex w-72 flex-col justify-between bg-white p-5 shadow-xl"
	bind:hidden={hiddenDrawer}
>
	<div class="py flex items-center justify-between border-b-2 border-gray-200 pb-5">
		<p class="text-xl font-semibold text-gray-800">Menu</p>
		<CloseButton
			class="m-0 rounded-xs border-2 border-gray-200 p-1"
			aria-label="Fechar menu"
			onclick={() => (hiddenDrawer = true)}
		/>
	</div>

	<Accordion flush class="mt-6">
		<AccordionItem class="border-none py-3">
			{#snippet header()}
				<span class="text-lg text-gray-700">Comandas</span>
			{/snippet}

			<ul class="mt-2 flex flex-col gap-4.5 ps-4">
				<li>
					<button
						onclick={() => (comandasAbertasModal = true)}
						class="block rounded text-sm text-gray-700 transition">Comandas em aberto</button
					>
				</li>
				<li>
					<button
						onclick={() => (comandasAbertasModal = true)}
						class="block rounded text-sm text-gray-700 transition">Comandas fechadas</button
					>
				</li>
			</ul>
		</AccordionItem>
	</Accordion>

	<div class="mt-auto">
		<button
			onclick={() => (signOutModal = true)}
			class="mx-auto flex w-fit items-center gap-2 rounded-md bg-gray-300 px-6 py-3 text-sm text-gray-900 transition hover:bg-gray-200"
		>
			<ArrowLeftToBracketOutline class="h-5 w-5 rotate-180" />
			Sair do sistema
		</button>
	</div>
</Drawer>

<Modal
	bind:open={signOutModal}
	size="xs"
	autoclose
	transition={slide}
	class="w-11/12 bg-[var(--color-base-light)]"
>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400" />

		<p class="mb-5 text-lg font-normal text-[var(--color-base-dark-default)]">
			Tem certeza que deseja sair do sistema?
		</p>

		<Button
			class="me-2 bg-[var(--color-error)] text-white"
			onclick={() => {
				localStorage.removeItem('user');
				goto('/');
			}}
		>
			Sim, desejo sair
		</Button>

		<Button
			class="bg-[var(--color-base-default)] text-[var(--color-primary)]"
			onclick={() => {
				signOutModal = false;
			}}
		>
			Cancelar
		</Button>
	</div>
</Modal>

<Modal
	title="Comandas abertas"
	bind:open={comandasAbertasModal}
	autoclose
	class={`w-11/12 ${comandasAbertas.length > 0 ? 'h-2/3' : 'h-fit'}`}
>
	{#if comandasAbertas.length > 0}
		{#each comandasAbertas as comanda}
			<Card size="lg" class="flex flex-row items-center justify-between p-4">
				<p>{comanda.id}</p>

				<PenOutline class="text-primary h-5 w-5" />
			</Card>
		{/each}
	{:else}
		<p class="text-gray-500">Nenhuma comanda aberta no momento.</p>
	{/if}
</Modal>

<Modal
	title="Comandas fechadas"
	bind:open={comandasFechadasModal}
	autoclose
	class={`w-11/12 ${comandasFechadas.length > 0 ? 'h-2/3' : 'h-fit'}`}
>
	{#if comandasFechadas.length > 0}
		{#each comandasFechadas as comanda}
			<Card size="lg" class="flex flex-row items-center justify-between p-4">
				<p>{comanda.id}</p>

				<CheckPlusCircleOutline class="text-primary h-5 w-5" />
			</Card>
		{/each}
	{:else}
		<p class="text-gray-500">Nenhuma comanda fechada no momento.</p>
	{/if}
</Modal>
