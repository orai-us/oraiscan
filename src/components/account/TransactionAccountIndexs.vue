<script lang="ts" setup>
import { computed, onMounted, ref, watchEffect} from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { reactive } from "vue";

import TransactionTable from "../TransactionTable.vue";
import { labelInOutTxs } from "@/utils";
import { getTxsAccount } from "@/service/transactionsService";

const props = defineProps(['txs', 'chain', 'address']);

const transactions = ref([]);
const totalCount = ref();
const pagination = reactive({
  limit: 10,
  page: 1
});
const loading = ref(true);

watchEffect(() => {
  async function fetchTxs() {
    try {
      loading.value = true;
      const res = await getTxsAccount(props.address, { ...pagination, count: true });
      if (res) {
        const { data, options } = res;
        totalCount.value = options.totalCount;
        transactions.value = data;
      }
    } catch (error) {
      console.log({ error });
    } finally {
      loading.value = false;
    }
  }
  fetchTxs();
})

async function handlePagination(page: number) {
  try {
    const res = await getTxsAccount(props.address, { ...pagination, page, count: false });
    if (res) {
      transactions.value = res.data;
    }
  } catch (error) {
    console.log({ error });
  }
}

const txHashes = computed(()=>{
  return transactions.value?.map((tx: any) => tx.id);
})

const query = gql`
      query GetTransactions($filter: TransactionFilter!) {
        transactions(filter: $filter) {
          results: nodes {
            id
            messages {
              nodes {
                type
                subType
              }
            }
            tokenTransfers {
              nodes {
                denom
                from
                to
                amount
                type
              }
            }
          }
        }
      }
    `;

const variables = computed(() => {
  return {
    filter: {
      id: { in: txHashes.value }
    },
  };
});

const { result } = useQuery(query, variables);

const txsMerge = computed(()=>{
  const txsOptimal = transactions.value;
  const txsIndexer = result.value?.transactions?.results;

  const data = txsOptimal?.map((txOptimal: any) => {
    const searchTx = txsIndexer?.find((txIndexer: any) => txIndexer.id === txOptimal.id);
    const messages = searchTx?.messages;
    const tokenTransfers = searchTx?.tokenTransfers;

    return {
      ...txOptimal,
      messages,
      tokenTransfers
    };
  });

  return labelInOutTxs(data, props.address)
})

</script>
<template>
  <div>
    <div v-if="loading" class="w-full h-[200px] flex items-center justify-center">
      <div class="loading loading-spinner loading-lg !text-gray-400"></div>
    </div>
    <div v-else>
      <TransactionTable :transactions="txsMerge" :chain="chain" :txTotal="totalCount" :pagination="pagination"
        :handlePagination="handlePagination" :displayStatus="true" />
    </div>
  </div>
</template>
