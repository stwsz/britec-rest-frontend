<script lang="ts">
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
		ArrowUpRightFromSquareOutline
	} from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { comanda } from '$lib/store/comanda';

	import type { typeComanda } from '$lib/types/comanda';
	import { userInfo } from '$lib/store/user';

	const ip = import.meta.env.VITE_IP;

	export let hiddenDrawer: boolean;

	let transitionParamsRight = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	let signOutModal = false;
	let comandasAbertasModal = false;
	let comandasFechadasModal = false;
	let modalComandasFechadas = false;

	let comandasAbertas: typeComanda[] = [];
	let comandasFechadas: typeComanda[] = [];

	let closedComanda = {
		id: '',
		orderId: ''
	};

	async function getComandas() {
		const reqComandasAbertas = await fetch(`${ip}/api/tables/opened`);
		const reqComandasFechadas = await fetch(`${ip}/api/tables/closed`);

		comandasAbertas = await reqComandasAbertas.json();
		comandasFechadas = await reqComandasFechadas.json();
	}

	getComandas();
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
						onclick={() => (comandasFechadasModal = true)}
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
				sessionStorage.removeItem('user');
				sessionStorage.removeItem('comanda');
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
		{#each comandasAbertas as keyComanda}
			<Card size="lg" class="flex flex-row items-center justify-between p-4">
				<p>{keyComanda.id}</p>

				<button
					onclick={() => {
						comanda.set({
							comanda: String(keyComanda.id),
							pedido: String(keyComanda.orderId)
						});

						sessionStorage.setItem('comanda', JSON.stringify($comanda));

						hiddenDrawer = true;
						comandasAbertasModal = false;

						goto('./../sistema');
					}}
				>
					<PenOutline class="text-primary h-5 w-5" />
				</button>
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

				<button
					onclick={() => {
						closedComanda.id = String(comanda.id);

						modalComandasFechadas = true;
					}}
				>
					<ArrowUpRightFromSquareOutline class="text-primary h-5 w-5 rotate-360" />
				</button>
			</Card>
		{/each}
	{:else}
		<p class="text-gray-500">Nenhuma comanda fechada no momento.</p>
	{/if}
</Modal>

<Modal
	bind:open={modalComandasFechadas}
	size="xs"
	autoclose
	transition={slide}
	class="w-11/12 text-sm"
>
	<div class="mt-10 text-center">
		<h3 class="mb-5 font-normal text-gray-600">
			Esta comanda está atualmente fechada. Deseja reabri-la para fazer um novo pedido?
		</h3>
		<Button
			class="bg-primary me-2 text-sm"
			onclick={async () => {
				const reqPedido = await fetch(`${ip}/api/orders`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						tableId: Number(closedComanda.id),
						employee: $userInfo.username
					})
				});
				const resPedido = await reqPedido.json();

				closedComanda.orderId = resPedido.order.id;

				comanda.set({
					comanda: closedComanda.id,
					pedido: closedComanda.orderId
				});

				sessionStorage.setItem('comanda', JSON.stringify($comanda));

				modalComandasFechadas = false;
				hiddenDrawer = true;
				comandasFechadasModal = false;

				goto('./../sistema');
			}}
		>
			Sim, abrir comanda
		</Button>
		<Button color="alternative" class="text-sm">Cancelar</Button>
	</div>
</Modal>
