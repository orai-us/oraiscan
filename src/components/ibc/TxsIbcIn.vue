<script lang="ts" setup>
import { useBlockchain, useFormatter } from '@/stores';
import { onMounted, ref } from 'vue';
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

function fetchRecevingTxs(channel: string, port: string, pageNum = 0) {
  page.value.setPage(pageNum);
  chainStore.rpc
    .getTxs(
      [
        {
          key: 'recv_packet.packet_dst_channel',
          value: channel,
        },
        {
          key: 'recv_packet.packet_dst_port',
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
  fetchRecevingTxs(props.channel, props.port);
});

function handlePagination(page: number) {
  fetchRecevingTxs(props.channel, props.port, page + 1);
}

</script>

<template>
  <div class="m-4 md:m-6 border border-base-400 bg-base-100 rounded-2xl h-full py-5">
    <div class="px-5">
      <h3 class="card-title capitalize">
        Transactions In
      </h3>
    </div>
    <TxsIbcTable :txs="txs" :txTotal="txTotal" :limit="page.limit" :handlePagination="handlePagination" :chain="chain" />
  </div>
</template>
