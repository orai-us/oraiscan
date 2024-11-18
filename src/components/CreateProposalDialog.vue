<script lang="ts" setup>
import { useBaseStore, useBlockchain, useWalletStore } from '@/stores';
import axios from 'axios';
import { onMounted, ref } from 'vue';

// const base = useBaseStore();
// const chainId = base.latest?.block?.header?.chainId || 'Oraichain';
// console.log({ chainId })
// const chainStore = useBlockchain();
// const urlRpc = chainStore.connErr || chainStore.endpoint.address || 'https://rpc.orai.io';
const currentAddress = useWalletStore().currentAddress || "";

// const denom = ref("orai");
// onMounted(async () => {
//   const assetListJson = await axios.get('https://registry.ping.pub/oraichain/assetlist.json');
//   denom.value = assetListJson?.data.assets[0]?.denom_units[1]?.denom;
//   console.log({ denom_value:  assetListJson?.data.assets[0]?.denom_units[1]?.denom})

// })
// console.log({ denom })


</script>
<template>
  <ping-create-proposal
    :denom="'orai'"
    :sender="currentAddress"
    :chain-id="'Oraichain-fork'"
    :url-rpc="'http://134.209.164.196:20057'"
  ></ping-create-proposal>
</template>
