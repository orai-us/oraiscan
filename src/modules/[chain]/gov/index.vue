<script lang="ts" setup>
import { useProposalDialog, useGovStore } from '@/stores';
import ProposalListItem from '@/components/ProposalListItem.vue';
import { ref, onMounted, toRaw } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
import { PageRequest } from '@/types';
import { ProposalStatus } from 'cosmjs-types/cosmos/gov/v1beta1/gov';

const tab = ref(ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD);
const store = useGovStore();
const pageRequest = ref(new PageRequest());
const proposalDialog = useProposalDialog();

onMounted(() => {
  store
    .fetchProposals(ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, pageRequest.value)
    .then((x) => {
      if (x?.proposals.length === 0) {
        tab.value = ProposalStatus.PROPOSAL_STATUS_PASSED;
        store.fetchProposals(ProposalStatus.PROPOSAL_STATUS_PASSED, pageRequest.value);
      }
      store.fetchProposals(ProposalStatus.PROPOSAL_STATUS_PASSED, pageRequest.value);
      store.fetchProposals(ProposalStatus.PROPOSAL_STATUS_REJECTED, pageRequest.value);
    });
});

const changeTab = (
  val:
    | ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
    | ProposalStatus.PROPOSAL_STATUS_PASSED
    | ProposalStatus.PROPOSAL_STATUS_REJECTED
) => {
  tab.value = val;
};

function page(p: number) {
  pageRequest.value.setPage(p);
  store.fetchProposals(tab.value, pageRequest.value);
}
</script>
<template>
  <div class="mx-6 section">
    <label for="CreateProposal" class="btn btn-sm btn-primary rounded-md mb-5" @click="proposalDialog.open('Oraichain','orai')">
      Create Proposal +
    </label>

    <div class="tabs tabs-boxed bg-transparent mb-4 text-center customTab">
      <a class="tab text-gray-400 uppercase" :class="{
        'tab-active': tab === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
      }" @click="changeTab(ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD)">{{ $t('gov.voting') }}</a>
      <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === ProposalStatus.PROPOSAL_STATUS_PASSED }"
        @click="changeTab(ProposalStatus.PROPOSAL_STATUS_PASSED)">{{ $t('gov.passed') }}</a>
      <a class="tab text-gray-400 uppercase" :class="{
        'tab-active': tab === ProposalStatus.PROPOSAL_STATUS_REJECTED,
      }" @click="changeTab(ProposalStatus.PROPOSAL_STATUS_REJECTED)">{{ $t('gov.rejected') }}</a>
    </div>
    <ProposalListItem :proposals="store?.proposals[tab]" />
    <PaginationBar :total="store?.proposals[tab]?.pagination?.total.toString()" :limit="pageRequest.limit"
      :callback="page" />
  </div>
</template>
<route>
  {
    meta: {
      i18n: 'governance',
      order: 2
    }
  }
</route>
