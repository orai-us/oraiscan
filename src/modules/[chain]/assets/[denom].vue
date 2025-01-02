<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { getListAssetOnChainAndRegistry, getPriceByIds } from "@/service/assetsService";
import DetailAsset from "@/components/assets/DetailAsset.vue";
import HolderAssetNativeToken from "@/components/assets/HolderAssetNativeToken.vue";
import TransactionsAsset from "@/components/assets/TransactionsAsset.vue";
import { RouterLink, useRoute } from "vue-router";
import { LIST_COIN } from '@/constants';
import { useBlockchain } from '@/stores';
import HolderAssetCw20 from '@/components/assets/HolderAssetCw20.vue';

enum SECTOR {
  TRANSACTIONS = 'transactions',
  HOLDERS = 'holders'
}

const props = defineProps(["denom", "chain"]);

const chainStore = useBlockchain();
const endpointAddress = chainStore.connErr || chainStore.endpoint.address;
const assets = ref([] as Array<any>);
const asset = ref({} as any);
const route = useRoute();
const sector = computed(() => {
  if (route.query.sector) return route.query.sector;
  else return SECTOR.TRANSACTIONS;
});

const coingeckoSymbols = Object.values(LIST_COIN);
const coingeckoIds = Object.keys(LIST_COIN);

onMounted(async () => {
  try {
    assets.value = await getListAssetOnChainAndRegistry(endpointAddress, props.chain);
  } catch (error) {
    console.log({ error });
  }
});
watch([() => props.denom, () => assets.value], async () => {
  const info = assets.value.find((item) => item.base === props.denom);
  const id = info?.coingecko_id || coingeckoIds[coingeckoSymbols.indexOf(info?.display)];
  if (id) {
    // const res = await getInfoToken({ ids: id });
    const res = await getPriceByIds({ ids: id });
    const infoToken = {
      id,
      current_price: res[id]?.usd
    };
    asset.value = { ...infoToken, ...info };
    // // console.log({ res, res1 })
    // if (Array.isArray(infoToken))
    //   asset.value = { ...infoToken, ...info };
    // else asset.value = info;
  } else {
    asset.value = info;
  }
});

</script>
<template>
  <div>
    <DetailAsset :asset="asset" />
    <div class="m-4 md:m-6 border border-base-400 bg-base-100 rounded-2xl p-5 flex gap-2 flex-col">
      <div class="flex gap-5">
        <RouterLink :to="`/${chain}/assets/${encodeURIComponent(denom)}?sector=${SECTOR.TRANSACTIONS}`"
          class="font-bold text-lg hover:cursor-pointer"
          :class="{ 'border-b-2 border-[#CBAEFF] text-white': sector === SECTOR.TRANSACTIONS }">
          <div>Transactions</div>
        </RouterLink>
        <RouterLink :to="`/${chain}/assets/${encodeURIComponent(denom)}?sector=${SECTOR.HOLDERS}`"
          class="font-bold text-lg hover:cursor-pointer"
          :class="{ 'border-b-2 border-[#CBAEFF] text-white': sector === SECTOR.HOLDERS }">
          <div>Holders</div>
        </RouterLink>
      </div>
      <div class="w-full h-[1px] bg-base-300"></div>
      <div v-show="sector === SECTOR.TRANSACTIONS">
        <TransactionsAsset :denom="denom" :chain="chain" />
      </div>
      <div v-show="sector === SECTOR.HOLDERS">
        <div v-if="denom.includes('cw20:')">
          <HolderAssetCw20 :denom="denom" :chain="chain" :currentPrice="asset.current_price" :decimals="asset.denom_units?.slice(-1)[0].exponent || 6" />
        </div>
        <div v-else>
          <HolderAssetNativeToken :denom="denom" :chain="chain" :currentPrice="asset.current_price" :decimals="asset.denom_units?.slice(-1)[0].exponent || 6" />
        </div>
      </div>
    </div>
  </div>
</template>
