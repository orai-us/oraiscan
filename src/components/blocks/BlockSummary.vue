<script lang="ts" setup>
import { useIndexModule } from '@/modules/[chain]/indexStore';
import { useBaseStore } from '@/stores';
import { computed, ref, watch, watchEffect } from 'vue';


const indexModule = useIndexModule();
const store = useBaseStore();
const blockTime = ref();

const blockSummary = computed(()=>{
  return indexModule.stats
})

watch(blockSummary,async () => {
  const heightNew = Number(blockSummary.value[0]?.stats);
  if (heightNew > 5) {
    const heightOld = Number(heightNew) - 5;
    const [blockOld, blockNew] = await Promise.all([
      store.fetchBlock(heightOld),
      store.fetchBlock(heightNew),
    ])
    const blockTimeNew = new Date(blockNew.block?.header?.time?.toString()).getTime();
    const blockTimeOld = new Date(blockOld.block?.header?.time?.toString()).getTime();

    blockTime.value = (blockTimeNew - blockTimeOld) / 5000 + " s"
  }
})
</script>

<template>
  <div class="m-4 md:m-6 border border-base-400 bg-base-100 rounded-2xl p-5 flex xl:gap-5 gap-2 flex-col">
    <div class="text-white font-bold text-lg">Block Summary</div>
    <div class="grid grid-cols-1 xl:gap-5 gap-2 xl:grid-cols-4">
      <div class="border border-[#383B40] rounded-lg p-4 flex xl:flex-col flex-row xl:gap-0 gap-2">
        <span>Block Height</span>
        <span class="text-white text-16 font-semibold">{{ !!blockSummary[0]?.stats ? blockSummary[0]?.stats : "-"
          }}</span>
      </div>
      <div class="border border-[#383B40] rounded-lg p-4 flex xl:flex-col flex-row xl:gap-0 gap-2">
        <span>Bonded Tokens</span>
        <span class="text-white text-16 font-semibold">{{ blockSummary[3]?.stats }}</span>
      </div>
      <div class="border border-[#383B40] rounded-lg p-4 flex xl:flex-col flex-row xl:gap-0 gap-2">
        <span>Inflation</span>
        <span class="text-white text-16 font-semibold">{{ blockSummary[4]?.stats }}</span>
      </div>
      <div class="border border-[#383B40] rounded-lg p-4 flex xl:flex-col flex-row xl:gap-0 gap-2">
        <span>Block Time</span>
        <span class="text-white text-16 font-semibold">{{ blockTime ? blockTime : "-" }}</span>
      </div>
    </div>

  </div>
</template>
