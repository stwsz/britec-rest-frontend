<script lang="ts">
	import { userInfo } from '$lib/store/user';
	import { comanda } from '$lib/store/comanda';

	import type { Item } from '$lib/types/Item';
	import type { itemComanda } from '$lib/types/itemComanda';

	const ip = import.meta.env.VITE_IP;

	export let item: Item;
	export let produtos = [] as itemComanda[];
	export let showToast: (message: string, type: 'info' | 'error' | 'success') => void;

	let quantidade = 0;

	function incrementar() {
		quantidade++;
	}

	function decrementar() {
		if (quantidade > 0) {
			quantidade--;
		}
	}
</script>

<div class="mb-4 flex flex-col gap-4 rounded bg-white p-4 shadow-sm dark:bg-gray-800">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-1.5">
			<p class="text-xs font-bold text-gray-800 dark:text-white">{item.description}</p>
			<p>-</p>
			<p class="text-xs text-gray-600">
				R$ {item.price} /<span class="text-[10px]">{item.unit}</span>
			</p>
		</div>
	</div>
	<div class="flex items-center justify-between gap-4">
		{#if item.unit === 'UN'}
			<div class="flex items-center overflow-hidden rounded border">
				<button class="bg-gray-200 px-2 pb-1" onclick={() => decrementar()}>-</button>
				<span class="px-3.5 pb-0.5 text-sm">{quantidade}</span>
				<button class="bg-gray-200 px-2 pb-1" onclick={() => incrementar()}>+</button>
			</div>
		{:else}
			<div class="flex items-center gap-2 text-sm">
				<input
					type="number"
					class="w-20 rounded-md border px-2 py-1"
					min="0"
					bind:value={quantidade}
				/>
				<p class="text-[10px]">{item.unit}</p>
			</div>
		{/if}

		<button
			class="bg-primary rounded px-4 py-2 text-xs text-white"
			onclick={async (e) => {
				if (quantidade > 0) {
					const reqAddProduto = await fetch(`${ip}/api/orders/${$comanda.pedido}/products`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							barCode: item.barCode ?? '',
							description: item.description,
							quantity: quantidade,
							price: Number(item.price).toFixed(2),
							unit: item.unit,
							employee: $userInfo?.username
						})
					});

					if (reqAddProduto.ok) {
						const reqProdutos = await fetch(`${ip}/api/orders/${$comanda.pedido}/products`);
						const responseProdutos = await reqProdutos.json();

						if (!responseProdutos.message) {
							produtos = responseProdutos.map((produto: any) => ({
								employee: produto.employee,
								id: produto.id,
								nome: produto.description,
								preco: parseFloat(produto.price),
								quantidade: parseFloat(produto.quantity),
								unidade: produto.unit,
								barCode: produto.barCode ?? ''
							}));
						}

						quantidade = 0;
					}
				} else {
					e.preventDefault();
					showToast('Quantidade deve ser maior que zero', 'error');
				}
			}}
		>
			Adicionar ao pedido
		</button>
	</div>
</div>
