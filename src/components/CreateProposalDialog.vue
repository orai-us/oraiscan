<script lang="ts" setup>
import { useBlockchain, useProposalDialog } from '@/stores';
const store = useProposalDialog();
const chainStore = useBlockchain()
</script>
<template>
  <ping-create-proposal
    :denom="store.denom"
    :sender="store.sender"
    :registry-name="chainStore.current?.prettyName || chainStore.chainName"
  ></ping-create-proposal>
</template>
