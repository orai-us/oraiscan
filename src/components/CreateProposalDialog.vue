<script lang="ts" setup>
import router from '@/router';
import { useBaseStore, useBlockchain, useGovStore, useWalletStore } from '@/stores';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { ProposalStatus } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { PageRequest } from '@/types';

const store = useGovStore();
// const base = useBaseStore();
// const chainId = base.latest?.block?.header?.chainId || 'Oraichain';
const chainStore = useBlockchain();
// const urlRpc = chainStore.connErr || chainStore.endpoint.address || 'https://rpc.orai.io';
const currentAddress = useWalletStore().currentAddress || "";
const pageRequest = ref(new PageRequest());

// const denom = ref("orai");
// onMounted(async () => {
//   const assetListJson = await axios.get('https://registry.ping.pub/oraichain/assetlist.json');
//   denom.value = assetListJson?.data.assets[0]?.denom_units[1]?.denom;
//   console.log({ denom_value:  assetListJson?.data.assets[0]?.denom_units[1]?.denom})

// })

const viewTransaction = (tx: any) => {
  router.push({
    path: `/${chainStore.chainName}/tx/${tx.detail.txhash}`,
  });
}

const viewProposal = () => {
  store
    .fetchProposals(ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, pageRequest.value)
    .then((x) => {
      const proposals = x.proposals;
      const proposalId = proposals.find((item) => item?.proposer === currentAddress)?.proposalId?.toString()
      router.push({
        path: `/${chainStore.chainName}/gov/${proposalId}`,
      });
    })
}

</script>
<template>
  <ping-create-proposal
    :denom="'orai'"
    :sender="currentAddress"
    :chain-id="'Oraichain-fork'"
    :url-rpc="'http://134.209.164.196:20057'"
    @viewTraction="viewTransaction"
    @viewProposal="viewProposal"
  ></ping-create-proposal>
</template>
