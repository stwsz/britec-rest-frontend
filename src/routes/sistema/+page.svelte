<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Tabs, TabItem, Input, ButtonGroup, Button, Modal } from 'flowbite-svelte';
	import {
		CloseCircleOutline,
		BarsOutline,
		AngleUpOutline,
		PenOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';

	import type { Item } from '$lib/types/Item';
	import type { itemComanda } from '$lib/types/itemComanda';
	import type { Section } from '$lib/types/section';

	import ItemCard from '$lib/components/sistema/ItemCard.svelte';
	import DrawerMenu from '$lib/components/general/DrawerMenu.svelte';
	import Toast from '$lib/components/general/Toast.svelte';

	import { userInfo } from '$lib/store/user';
	import { comanda } from '$lib/store/comanda';

	const ip = import.meta.env.VITE_IP;

	let categorias: Section[] = [];

	let termosBusca: Record<number, string> = {};
	let hiddenDrawer = true;
	let hiddenInfoProducts = false;
	let modalEditProduct = false;

	let toastStatus = false;
	let toastMessage = '';
	let toastType: 'info' | 'error' | 'success' = 'info';

	let editProduto: itemComanda | null = null;

	$: produtos = [] as itemComanda[];

	let date: string = '';
	let hour: string = '';

	let atendente = '';

	onMount(async () => {
		if (userInfo) {
			atendente = $userInfo.username || '';
		} else {
			goto('/');
		}

		let storedComanda = sessionStorage.getItem('comanda');

		if (storedComanda) {
			$comanda = JSON.parse(storedComanda);
		}

		if ($comanda.pedido === '') {
			const reqPedido = await fetch(`${ip}/api/orders`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					tableId: $comanda.comanda,
					employee: atendente
				})
			});

			const responsePedidos = await reqPedido.json();
			
			const formattedDate = responsePedidos.order.date.split('-').reverse().join('/');

			date = formattedDate;
			hour = responsePedidos.order.hour;

			$comanda.pedido = responsePedidos.order.id;
		} else {
			const reqPedido = await fetch(`${ip}/api/orders/${$comanda.pedido}`);

			const responsePedidos = await reqPedido.json();

			const dateObj = new Date(responsePedidos[0].date);

			hour = responsePedidos[0].hour;
			
			date = dateObj.toLocaleDateString('pt-BR');
		}

		const reqProdutos = await fetch(
			`${ip}/api/orders/${$comanda.pedido}/products`
		);
		const responseProdutos = await reqProdutos.json();

		if (!responseProdutos.message) {
			produtos = responseProdutos.map((produto: any) => ({
				id: produto.id,
				nome: produto.description,
				preco: parseFloat(produto.price),
				quantidade: parseFloat(produto.quantity),
				unidade: produto.unit,
				barCode: produto.barCode ?? ''
			}));
		}

		const reqSections = await fetch(`${ip}/api/sections`);

		if (reqSections.ok) {
			const novasCategorias = await reqSections.json();

			for (const categoria of novasCategorias) {
				const reqProdutos = await fetch(`${ip}/api/products/${categoria.id}`);

				if (reqProdutos.ok) {
					const produtos = await reqProdutos.json();
					categoria.items = produtos.map((produto: any) => ({ ...produto })) as Item[];
				} else {
					console.error(
						`Erro ao carregar produtos da seção ${categoria.description}:`,
						reqProdutos.statusText
					);
				}
			}
			categorias = [...novasCategorias];
		} else {
			console.error('Erro ao carregar seções:', reqSections.statusText);
		}
	});

	function filtrarItens(categoria: Section): Item[] {
		const termo = termosBusca[categoria.id]?.toLowerCase() || '';
		if (!termo) return categoria.items;

		return categoria.items.filter((item) => item.description.toLowerCase().includes(termo));
	}

	function showToast(message: string, type: typeof toastType) {
		toastMessage = message;
		toastType = type;
		toastStatus = true;
	}
</script>

<main class="p-4 pb-32">
	<div class="mb-4 flex items-center justify-between">
		<div class="flex flex-col gap-0.5">
			<p class="text-xl font-semibold text-gray-800 dark:text-white">{atendente}</p>
			<p class="text-sm text-gray-600">
				<span class="font-medium">Comanda:</span>
				{$comanda.comanda}
			</p>
			<p class="text-sm text-gray-600">
				<span class="font-medium">Pedido:</span>
				{$comanda.pedido}
			</p>
			<p class="text-sm text-gray-600">
				{date} - {hour}
			</p>
		</div>

		<Button onclick={() => (hiddenDrawer = false)} class="text-primary absolute top-3 right-2 p-0"
			><BarsOutline class="h-7 w-7" /></Button
		>
	</div>

	<Tabs>
		{#each categorias as categoria}
			{#if categoria.id === 1}
				<TabItem open title={categoria.description}>
					<ButtonGroup class="relative mb-1 w-full">
						<Input
							value={termosBusca[categoria.id] || ''}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								termosBusca = {
									...termosBusca,
									[categoria.id]: target.value
								};
							}}
							placeholder="Digite o nome do item"
						/>

						{#if termosBusca[categoria.id]}
							<button>
								<CloseCircleOutline
									class="text-primary absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 cursor-pointer"
									onclick={() => {
										termosBusca[categoria.id] = '';
									}}
								/>
							</button>
						{/if}
					</ButtonGroup>

					{#if categoria.items.length > 0}
						{#key termosBusca[categoria.id]}
							<div class="mt-2">
								{#each filtrarItens(categoria) as item}
									<ItemCard {item} bind:produtos {showToast} />
								{/each}
							</div>
						{/key}
					{:else}
						<p class="text-center text-gray-500">Nenhum item encontrado</p>
					{/if}
				</TabItem>
			{:else}
				<TabItem title={categoria.description}>
					<ButtonGroup class="relative mb-1 w-full">
						<Input
							value={termosBusca[categoria.id] || ''}
							oninput={(e) => {
								const target = e.target as HTMLInputElement;
								termosBusca = {
									...termosBusca,
									[categoria.id]: target?.value
								};
							}}
							placeholder="Digite o nome do item"
						/>

						{#if termosBusca[categoria.id]}
							<button>
								<CloseCircleOutline
									class="text-primary absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 cursor-pointer"
									onclick={() => {
										termosBusca[categoria.id] = '';
									}}
								/>
							</button>
						{/if}
					</ButtonGroup>

					{#if categoria.items.length > 0}
						{#key termosBusca[categoria.id]}
							<div class="mt-2">
								{#each filtrarItens(categoria) as item}
									<ItemCard {item} bind:produtos {showToast} />
								{/each}
							</div>
						{/key}
					{:else}
						<p class="py-2 text-center text-gray-500">Nenhum item encontrado para essa sessão!</p>
					{/if}
				</TabItem>
			{/if}
		{/each}
	</Tabs>
</main>

<div
	class="bg-primary fixed right-0 bottom-0 left-0 z-50 flex flex-col gap-4 px-4! py-5! text-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
>
	<button
		onclick={() => {
			hiddenInfoProducts = !hiddenInfoProducts;
		}}
	>
		<AngleUpOutline
			class={`h-5 w-5 transition-all ${hiddenInfoProducts === true ? 'rotate-180' : 'rotate-0'}`}
		/>
	</button>
	<div
		class={`${hiddenInfoProducts === true ? 'block' : 'hidden'} rounded-xl bg-white p-4 shadow-lg`}
	>
		{#if produtos.length > 0}
			<ul class="space-y-3">
				{#each produtos as produto}
					<li
						class="text-primary flex items-center justify-between rounded-lg bg-gray-100 px-4 py-2 text-sm dark:text-gray-100"
					>
						<div class="flex flex-col">
							<span class="font-medium">{produto.nome}</span>
							<div class="flex items-center gap-2 text-xs">
								<span class="font-semibold text-gray-700">
									R$ {produto.preco.toFixed(2)}
								</span>

								<span> • </span>

								<span class="text-gray-600">
									{produto.quantidade}
									{produto.unidade}
								</span>
							</div>
						</div>

						{#if $userInfo.admin === 1}
							<div class="flex items-center gap-4">
								<Button
									class="text-primary p-0 focus:ring-0 focus:outline-none"
									onclick={() => {
										modalEditProduct = true;
										editProduto = produto;
									}}
								>
									<PenOutline class="h-5 w-5" />
								</Button>

								<Button
									class="p-0 text-red-500 focus:ring-0 focus:outline-none"
									onclick={async () => {
										await fetch(
											`${ip}/api/orders/${$comanda.pedido}/products/${produto.id}`,
											{
												method: 'DELETE'
											}
										);

										produtos = produtos.filter((p) => p.id !== produto.id);
									}}
								>
									<TrashBinOutline class="h-5 w-5" />
								</Button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-center text-sm text-gray-500 dark:text-gray-400">Nenhum produto adicionado.</p>
		{/if}
	</div>
	<div class="flex items-center justify-between">
		<div class="flex flex-col leading-tight">
			<p class="text-lg">Total:</p>
			<p class="text-lg font-semibold">
				R$ {produtos.reduce((total, produto) => total + produto.preco * produto.quantidade, 0).toFixed(2)}
			</p>
		</div>
		<button
			class="text-primary rounded-sm bg-white px-5 py-2 text-sm font-semibold shadow-sm transition hover:bg-gray-100"
			onclick={() => {
				goto('./../comanda');
			}}
		>
			Fechar
		</button>
	</div>
</div>

<DrawerMenu bind:hiddenDrawer />

<Toast bind:toastStatus {toastMessage} {toastType} position="top-10 right-3" />

<Modal title="Editar produto" bind:open={modalEditProduct} class="w-11/12">
	{#if editProduto}
		<div class="flex flex-col gap-4">
			<div>
				<label
					for="edit-quantidade"
					class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Quantidade</label
				>
				<input
					id="edit-quantidade"
					type="number"
					min="1"
					class="w-full rounded border px-3 py-2 text-gray-900"
					bind:value={editProduto.quantidade}
				/>
			</div>

			<div class="flex justify-end gap-2 pt-4">
				<Button
					onclick={async (e: any) => {
						console.log(produtos);

						if (editProduto?.quantidade) {
							if (editProduto.quantidade > 0) {
								const editQuantity = await fetch(
									`${ip}/api/orders/${$comanda.pedido}/products/${editProduto.id}`,
									{
										method: 'PUT',
										headers: {
											'Content-Type': 'application/json'
										},
										body: JSON.stringify({
											quantity: editProduto.quantidade
										})
									}
								);

								if (editQuantity.ok) {
									produtos = produtos.map((p) =>
										p.id === editProduto?.id
											? { ...p, quantidade: Number(editProduto?.quantidade ?? 0) }
											: p
									);

									modalEditProduct = false;
									editProduto = null;
								}
							} else {
								e.preventDefault();
							}
						}
					}}
					class="bg-primary hover:bg-primary-600 focus:ring-primary-300 dark:focus:ring-primary-900 text-white focus:ring-4"
				>
					Salvar
				</Button>

				<Button
					color="gray"
					onclick={() => {
						modalEditProduct = false;
						editProduto = null;
					}}
				>
					Cancelar
				</Button>
			</div>
		</div>
	{/if}
</Modal>
