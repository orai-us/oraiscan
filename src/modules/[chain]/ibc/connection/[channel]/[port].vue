<script lang="ts" setup>
import TxsIbcIn from '@/components/ibc/TxsIbcIn.vue';
import TxsIbcOut from '@/components/ibc/TxsIbcOut.vue';

const props = defineProps(['channel', 'port', 'chain']);

</script>
<template>
  <div>
    <div class="m-4 md:m-6 border border-base-400 bg-base-100 rounded-2xl h-full py-5">
      <div class="px-5">
        <h3 class="card-title capitalize">
          Transactions ({{ props.channel }} {{ props.port }})
        </h3>
      </div>
    </div>
    <TxsIbcIn :channel="channel" :port="port" :chain="chain" />
    <TxsIbcOut :channel="channel" :port="port" :chain="chain" />
  </div>
</template>
