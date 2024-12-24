<script lang="ts" setup>
import { shortenTxHash } from '@/utils';
import Pagination from '../pagination/Pagination.vue';

const props = defineProps(["txs", "chain", "txTotal", "limit", "handlePagination"]);

</script>
<template>
  <div class="bg-base-100 overflow-x-auto rounded-2xl p-5">
    <div class="overflow-x-auto">
      <table class="table w-full text-sm" v-if="txs?.length > 0">
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>Result</th>
            <th>Message</th>
            <th>Height</th>
            <th>Fee</th>
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
                class="bg-[rgba(180,183,187,0.10)] rounded px-2 py-[1px] h-full w-fit flex justify-center items-center">{{
                  v.message }}</span>
            </td>
            <td class="text-sm py-3 !break-normal">
              <RouterLink :to="`/${chain}/block/${v.height}`" class="text-primary dark:text-link">{{
                v.height }}
              </RouterLink>
            </td>
            <td class="py-3 !break-normal">
              <span>{{ v.fee || "-" }}</span>
            </td>
            <td class="!break-normal">{{ v.timestamp || "-" }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="flex items-center justify-center w-full h-full">
        <td>No Transactions</td>
      </div>
    </div>
  </div>
  <div class="mt-4 text-center" v-if="txTotal">
    <Pagination :totalItems="txTotal" :limit="limit" :onPagination="handlePagination" />
  </div>
</template>
