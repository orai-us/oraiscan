<script lang="ts" setup>
import { ref, toRaw, watch, watchEffect } from 'vue';
import Pagination from './pagination/Pagination.vue';
import { shortenTxHash } from '@/utils';
import { useFormatter } from '@/stores';
import { CHAIN_INDEXS } from '@/constants';
import { formatTitle } from '@/libs/utils';

const props = defineProps(['transactions', 'chain', 'txTotal', 'limit', 'handlePagination', 'displayStatus']);
const format = useFormatter();
const txs = ref([] as Array<any>)

watchEffect(() => {
  if (!!props?.transactions?.length) {
    if (CHAIN_INDEXS.includes(props.chain)) {
      txs.value = props?.transactions?.map((item: any) => {
        const message = item.messages?.nodes[0]?.subType || format.messages(item.messages?.nodes.map((item: any) =>
          ({ "@type": item.type, typeUrl: item.type })
        ))
        return {
          txhash: item?.id,
          result: item.code === 0 ? "Success" : "Failed",
          message: formatTitle(message),
          height: item.blockNumber,
          fee: `${Number(item.fee[0].amount) / 1e6} ${item?.fee[0].denom?.toUpperCase()}`,
          timestamp: format.toLocaleDate(new Date(Number(item.timestamp))),
          state: item.state
        }
      });
    } else {
      txs.value = props.transactions
    }
  }
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="table w-full text-sm" v-if="txs?.length > 0">
      <thead>
        <tr>
          <th>Tx Hash</th>
          <th>Result</th>
          <th>Message</th>
          <th>Height</th>
          <th>Fee</th>
          <th v-if="displayStatus">Status</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody class="text-sm">
        <tr v-if="txs?.length === 0">
          <td colspan="10">
            <div class="text-center">
              {{ $t('account.no_transactions') }}
            </div>
          </td>
        </tr>
        <tr v-for="(v, index) in txs" :key="index">
          <td class="truncate py-3" style="max-width: 200px">
            <RouterLink :to="`/${chain}/tx/${v.txhash}`" class="text-primary dark:text-link">
              {{ shortenTxHash(v.txhash) }}
            </RouterLink>
          </td>
          <td class="text-sm py-3 !break-normal" :class="`${v.result === 'Success' ? 'text-[#39DD47]' : 'text-error'
            }`">
            {{ v.result }}
          </td>
          <td class="py-3 !break-normal">
            <span
              class="bg-[rgba(180,183,187,0.10)] rounded px-2 py-[1px] h-full w-fit flex justify-center items-center">{{ v.message }}</span>
          </td>
          <td class="text-sm py-3 !break-normal">
            <RouterLink :to="`/${chain}/block/${v.height}`" class="text-primary dark:text-link">{{
              v.height }}
            </RouterLink>
          </td>
          <td class="py-3 !break-normal">
            <span>{{ v.fee || "-" }}</span>
          </td>
          <td v-if="displayStatus">
            <button class="btn btn-xs  border rounded-lg " v-if="v.state"
            :class="{'!bg-[rgba(39,120,77,0.20)] !text-[#39DD47] border-[rgba(39,120,77,0.20)]': v.state ==='IN', 
                     '!bg-[rgba(255,82,82,0.20)] !text-[#FF5252] border-[rgba(255,82,82,0.20)]': v.state ==='OUT'}">
             {{ v.state }}
           </button>
           <div v-else>-</div>
          </td>
          <td class="!break-normal">{{ v.timestamp || "-" }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="flex items-center justify-center w-full h-full">
      <td>No Transactions</td>
    </div>
  </div>

  <div class="mt-4 text-center" v-if="txTotal">
    <Pagination :totalItems="txTotal" :limit="limit" :onPagination="handlePagination" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'TransactionTable',
};
</script>
