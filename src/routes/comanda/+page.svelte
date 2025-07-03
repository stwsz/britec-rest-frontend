<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { BarsOutline } from 'flowbite-svelte-icons';
	import { Button, Modal } from 'flowbite-svelte';
	import DrawerMenu from '$lib/components/general/DrawerMenu.svelte';
	import { userInfo } from '$lib/store/user';
	import { comanda } from '$lib/store/comanda';
	import Toast from '$lib/components/general/Toast.svelte';
	import { slide } from 'svelte/transition';

	const restLogo = import.meta.env.VITE_ESTABELECIMENTO_LOGO;
	const restName = import.meta.env.VITE_ESTABELECIMENTO_NOME;

	let atendente = '';
	let hiddenDrawer = true;

	$: comandaInput = '';

	let toastStatus = false;
	let toastMessage = '';
	let toastType: 'info' | 'error' | 'success' = 'info';

	$: responseModal = {
		id: '',
		orderId: '',
		status: ''
	};
	$: modalComandasFechadas = false;

	onMount(async () => {
		const storedUser = sessionStorage.getItem('user');
		if (storedUser) {
			userInfo.set(JSON.parse(storedUser));
			atendente = $userInfo.username || '';
		} else {
			goto('/');
		}
	});

	async function getComandas() {
		const reqComanda = await fetch(
			`http://26.204.212.174:8080/api/tables/check/${comandaInput.trim()}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		responseModal = await reqComanda.json();
	}

	function showToast(message: string, type: typeof toastType) {
		toastMessage = message;
		toastType = type;
		toastStatus = true;
	}
</script>

<svelte:head>
	<title>{atendente} - Comandas</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 py-10">
	<div
		class="flex w-full max-w-md flex-col gap-4 space-y-6 rounded-lg bg-white p-10 text-center shadow-xl"
	>
		<div>
			<div class="flex flex-col items-center gap-4">
				{#if restLogo}
					<img src={restLogo} alt="Logo do estabelecimento" class="h-20 object-contain" />
				{/if}
				{#if restName}
					<h1 class="text-base-dark text-2xl font-bold">{restName}</h1>
				{/if}
			</div>

			<h2 class="mt-4 text-lg font-medium text-gray-700">
				Atendente: <span class="font-semibold">{atendente}</span>
			</h2>
		</div>

		<div class="flex flex-col items-start">
			<label for="comanda" class="font-semibold text-gray-700"> Comanda </label>

			<input
				type="text"
				placeholder="Digite o número da comanda"
				id="comanda"
				class="focus:border-primary focus:ring-primary mt-2 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
				bind:value={comandaInput}
			/>
		</div>

		<button
			class="bg-primary text-base-light hover:bg-primary/90 mt-4 block w-full cursor-pointer rounded py-2.5 text-sm font-semibold transition-colors"
			onclick={async (e) => {
				if (comandaInput.trim() !== '') {
					await getComandas();

					if (responseModal.status === 'closed') {
						modalComandasFechadas = true;
					} else if (responseModal.status === 'opened') {
						comanda.set({
							comanda: responseModal.id,
							pedido: responseModal.orderId
						});

						localStorage.setItem(
							'comanda',
							JSON.stringify({
								comanda: responseModal.id,
								pedido: responseModal.orderId
							})
						);

						goto('./../sistema');
					} else {
						e.preventDefault;
						showToast('Comanda não encontrada ou inválida.', 'error');
					}
				} else {
					e.preventDefault();
					showToast('Por favor, preencha o número da comanda.', 'error');
				}
			}}
		>
			Abrir comanda
		</button>
	</div>
</main>

<BarsOutline
	class="text-primary absolute top-3 right-2 h-7 w-7 p-0"
	onclick={() => (hiddenDrawer = false)}
/>

<DrawerMenu bind:hiddenDrawer />

<Toast bind:toastStatus {toastMessage} {toastType} position="top-4 left-4" />

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
			onclick={() => {
				comanda.set({
					comanda: responseModal.id,
					pedido: ''
				});

				modalComandasFechadas = false;
				goto('./../sistema');
			}}
		>
			Sim, abrir comanda
		</Button>
		<Button color="alternative" class="text-sm">Cancelar</Button>
	</div>
</Modal>
