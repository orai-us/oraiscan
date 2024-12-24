<script lang="ts" setup>
import { useBlockchain, useFormatter } from '@/stores';
import { onMounted, ref, watch } from 'vue';
import { PageRequest } from '@/types';
import { toHex } from '@cosmjs/encoding';
import { formatTitle } from '@/libs/utils';
import TxsIbcTable from './TxsIbcTable.vue';

const props = defineProps(['channel', 'port','chain']);

const chainStore = useBlockchain();
const format = useFormatter();
const txs = ref([] as Array<any>);
const txTotal = ref(0 as number);
const page = ref(new PageRequest());
page.value.limit = 5;

function parseTransaction(txs: Array<any>) {
  return txs.map(tx => {
    const amount = tx.txRaw?.authInfo?.fee?.amount;
    return {
      txhash: toHex(tx.hash),
      result: tx.result?.code === 0 ? "Success" : "Failed",
      message: formatTitle(format.messages(tx.txRaw?.body?.messages) || "-"),
      height: tx.height,
      fee: Array.isArray(amount) ? `${amount[0].amount} ${amount[0].denom}` : "-",
    };
  });
}

function fetchSendingTxs(channel: string, port: string, pageNum = 0) {
  page.value.setPage(pageNum);
  chainStore.rpc
    .getTxs(
      [
        {
          key: 'send_packet.packet_src_channel',
          value: channel,
        },
        {
          key: 'send_packet.packet_src_port',
          value: port,
        },
      ],
      page.value
    )
    .then((res) => {
      txs.value = parseTransaction(res.txs);
      txTotal.value = res.totalCount;
    });
}

onMounted(() => {
  fetchSendingTxs(props.channel, props.port);
});

function handlePagination(page: number) {
  fetchSendingTxs(props.channel, props.port, page + 1);
}

</script>

<template>
  <div class="m-4 md:m-6 border border-base-400 bg-base-100 rounded-2xl h-full py-5">
    <div class="px-5">
      <h3 class="card-title capitalize">
        Transactions Out
      </h3>
    </div>
    <TxsIbcTable :txs="txs" :txTotal="txTotal" :limit="page.limit" :handlePagination="handlePagination" :chain="chain" />
  </div>
</template>
