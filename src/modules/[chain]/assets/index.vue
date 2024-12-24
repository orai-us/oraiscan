<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { getListAssetOnChainAndRegistry, getListSupply, getPriceByIds } from '@/service/assetsService';
import { LIST_COIN } from '@/constants';
import { formatNumber, shortenDenom } from '@/utils';
import Pagination from '@/components/pagination/Pagination.vue';
import TooltipComponent from '@/components/TooltipComponent.vue';
import router from '@/router';
import { useBlockchain } from '@/stores';

const chainStore = useBlockchain();
const endpointAddress = chainStore.connErr || chainStore.endpoint.address;
const props = defineProps(["chain"]);

const coingeckoSymbols = Object.values(LIST_COIN);
const coingeckoIds = Object.keys(LIST_COIN);

const assetsAll = ref([] as Array<any>);
const assetsSearch = ref([] as Array<any>);
const priceTokens = ref({} as any);
const pagination = reactive({
  limit: 10,
  offset: 0
});
const searchQuery = ref("");
const supplies = ref([] as Array<any>);

// onMounted(async () => {
//   try {
//     const assets = await getListAssetOnChainAndRegistry(endpointAddress, props.chain);
//     const assetsSupported = assets.filter(item => item.logo_URIs && item.symbol.length && coingeckoSymbols.includes(item.symbol.toLowerCase()))
//       .map(asset => ({ ...asset, id: coingeckoIds[coingeckoSymbols.indexOf(asset.display.toLowerCase())] }));
//     const assetsUnSupported = assets.filter(item => !(item.logo_URIs && item.symbol && coingeckoSymbols.includes(item.symbol.toLowerCase())));
//     assetsAll.value = [...assetsSupported, ...assetsUnSupported];
//     assetsSearch.value = [...assetsSupported, ...assetsUnSupported];
//     const ids = assetsSupported.map((item: any) => item?.id);
//     console.log({ ids })
//     if (ids?.length > 0) {
//       try {
//         const res = await getInfoToken({ ids: ids.join(",") });
//         const prices: any = {};
//         for (let item of res) {
//           prices[item.id] = item;
//         }
//         priceTokens.value = prices;
//       } catch (error) {
//         console.log({ error });
//       }
//     }
//   } catch (error) {
//     console.log({ error });
//   }

// });

onMounted(async () => {
  try {
    const assets = await getListAssetOnChainAndRegistry(endpointAddress, props.chain);
    const assetsSupported = assets.filter(item => item.logo_URIs && item.symbol.length && coingeckoSymbols.includes(item.symbol.toLowerCase()))
      .map(asset => ({ ...asset, id: coingeckoIds[coingeckoSymbols.indexOf(asset.display.toLowerCase())] }));

    const assetsUnSupported = assets.filter(item => !(item.logo_URIs && coingeckoSymbols.includes(item.symbol.toLowerCase())) && item.symbol);
    assetsAll.value = [...assetsSupported, ...assetsUnSupported];
    assetsSearch.value = [...assetsSupported, ...assetsUnSupported];
    
    const ids = assetsSupported.map((item: any) => item?.id);

    if (ids?.length > 0) {
      try {
        const res = await getPriceByIds({ ids: ids.join(",") });
        priceTokens.value = res;
      } catch (error) {
        console.log({ error });
      }
    }
  } catch (error) {
    console.log({ error });
  }
});

onMounted(async () => {
  try {
    const res = await getListSupply({ 'pagination.limit': 200, 'pagination.offset': 0 });
    supplies.value = res.supply;
  } catch (error) {
    console.log({ error });
  }
})

const totalAssets = computed(() => { return assetsSearch.value.length; });

function handlePagination(page: number) {
  pagination.offset = (page - 1) * pagination.limit;
}

const assets = computed(() => {
  return assetsSearch.value.slice(pagination.offset, pagination.offset + pagination.limit);
});

watch(searchQuery,()=>{
  handlePagination(1);
  const keyword = searchQuery.value.toLowerCase();
  if (keyword.length === 0) assetsSearch.value = assetsAll.value;
  assetsSearch.value = assetsAll.value.filter((item) => item.symbol?.toLowerCase().includes(keyword) || item.base?.toLowerCase().includes(keyword));
})

function findSupplyByDenom(denom: string) {
  return supplies.value.find(item => item.denom == denom)?.amount / Math.pow(10, 6);
}

</script>
<template>
  <div class="m-4 md:m-6 border border-base-400 bg-base-100 rounded-2xl p-5 flex gap-2 flex-col">
    <div class="text-white font-bold text-lg">Assets Dashboard</div>
    <div class="w-full h-[1px] bg-base-300"></div>
    <div class="flex flex-row justify-between items-center mt-2 mb-2">
      <span class="text-white font-bold">There are <span class="text-[#CBAEFF]">{{ formatNumber(totalAssets) }}</span> Assets</span>
      <input
        class="input w-[300px] !input-bordered bg-base text-[14px] font-normal h-[44px] focus:outline-none text-white"
        v-model="searchQuery" placeholder="Search by Name, Denom" />
    </div>

    <table class="table w-full text-sm" v-if="assets.length > 0">
      <thead>
        <tr>
          <th class="text-white font-bold text-sm">Name</th>
          <th class="text-white font-bold text-sm text-right"></th>
          <th class="text-white font-bold text-sm text-right">Denom</th>
          <th class="text-white font-bold text-sm text-right">Price</th>
          <th class="text-white font-bold text-sm text-right">Total Supply</th>
          <!-- <th class="text-white font-bold text-sm text-right">Circulating Supply</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(v, index) in assets" :key="v.base" class="cursor-pointer"
          @click="router.push(`/${chain}/assets/${encodeURIComponent(v.base)}`)">
          <td>
            <div class="flex flex-row items-center gap-3">
              <img :src="v.logo_URIs?.png || v.logo_URIs?.svg" alt="img" v-if="v.logo_URIs?.png || v.logo_URIs?.svg"
                class="w-8 h-8 rounded-full border border-blue-100 bg-white" />
              <div v-else class="w-8 h-8 rounded-full border border-blue-100 bg-white"></div>
              <span class="text-white text-sm" v-if="v.symbol">{{ shortenDenom(v.symbol) }}</span>
              <span v-else>-</span>
            </div>
          </td>
          <td class="text-right">
            <div v-if="v.verify">
              <div class="text-xs flex items-center justify-center !bg-[rgba(39,120,77,0.20)] !text-[#39DD47] border-[rgba(39,120,77,0.20)] p-2 rounded-lg w-fit">
                Verified</div>
            </div>
          </td>
          <td class="text-right w-fit">
            <TooltipComponent :value="shortenDenom(v.base)" :description="v.base" :copyValue="v.base" />
          </td>
          <td class="text-right">
            <span v-if="priceTokens[v.id]?.usd" class="text-white">
              $ {{ formatNumber(priceTokens[v.id].usd) }}
            </span>
            <span v-else>-</span>
          </td>
          <td class="text-right">
            <div v-if="findSupplyByDenom(v.base)" class="text-white">
              <div>{{ formatNumber(findSupplyByDenom(v.base)) }}</div>
              <span v-if="priceTokens[v.id]?.usd" class="text-xs text-gray-400">$ {{
                formatNumber(findSupplyByDenom(v.base) *
                priceTokens[v.id].usd) }}</span>
              <span v-else>-</span>
            </div>
            <span v-else>-</span>
          </td>
          <!-- <td class="text-right">
            <div v-if="priceTokens[v.id]?.circulating_supply" class="text-white">
              <div>{{ formatNumber(priceTokens[v.id].circulating_supply) }}
              </div>
              <span v-if="priceTokens[v.id]?.current_price" class="text-xs text-gray-400">$ {{
                formatNumber(priceTokens[v.id].circulating_supply *
                  priceTokens[v.id].current_price) }}</span>
              <span v-else>-</span>
            </div>
            <span v-else>-</span>
          </td> -->
        </tr>
      </tbody>
    </table>
    <div v-else class="w-full h-full justify-center items-center">
      No Assets
    </div>
    <div class="mt-4 text-center" v-if="totalAssets">
      <Pagination :totalItems="totalAssets" :limit="pagination.limit" :onPagination="handlePagination" />
    </div>
  </div>
</template>

<route>
  {
    meta: {
      i18n: 'assets',
      order: 7
    }
  }
</route>
