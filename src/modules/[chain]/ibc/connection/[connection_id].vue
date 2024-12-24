<script lang="ts" setup>
import { formatSeconds } from '@/libs/utils';
import { useBaseStore, useBlockchain } from '@/stores';
import { Icon } from '@iconify/vue';
import type { IdentifiedChannel } from 'cosmjs-types/ibc/core/channel/v1/channel';
import { State } from 'cosmjs-types/ibc/core/channel/v1/channel';
import type { IdentifiedClientState } from 'cosmjs-types/ibc/core/client/v1/client';
import type { ConnectionEnd } from 'cosmjs-types/ibc/core/connection/v1/connection';
import { ClientState as TendermintClientState } from 'cosmjs-types/ibc/lightclients/tendermint/v1/tendermint';
import { computed, onMounted, ref } from 'vue';
import { useIBCModule } from '../connStore';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import { JsonViewer } from 'vue3-json-viewer';
import { wrapBinary } from '@/libs/utils';
import router from '@/router';

const props = defineProps(['chain', 'connection_id']);
const chainStore = useBlockchain();
const baseStore = useBaseStore();
const ibcStore = useIBCModule();
const conn = ref({} as ConnectionEnd | undefined);
const clientState = ref(
  {} as (IdentifiedClientState & TendermintClientState) | undefined
);
const channels = ref([] as IdentifiedChannel[]);
const encoder = new TextEncoder();

const connId = computed(() => {
  return props.connection_id || 0;
});

const STATE = {
  "1": "INIT",
  "2": "TRY OPEN",
  "3": "OPEN",
  "4": "CLOSED",
  "-1": "UNRECOGNIZED"
}

const ORDERING = {
  "0":"NONE UNSPECIFIED",
  "1":"UNORDERED",
  "2":"ORDERED",
  "-1":"UNRECOGNIZED",
}

onMounted(() => {
  if (connId.value) {
    chainStore.rpc.getIBCConnectionsById(connId.value).then((x) => {
      conn.value = x.connection;
    });
    chainStore.rpc.getIBCConnectionsClientState(connId.value).then((x) => {
      // @ts-ignore
      clientState.value = x.identifiedClientState;
      if (x.identifiedClientState?.clientState) {
        Object.assign(
          clientState.value!,
          TendermintClientState.decode(
            x.identifiedClientState?.clientState.value
          )
        );
      }
    });
    chainStore.rpc.getIBCConnectionsChannels(connId.value).then((x) => {
      const channelOpens = x.channels.filter((item)=> item.state === State.STATE_OPEN);
      const channelNonOpens = x.channels.filter((item)=> item.state !== State.STATE_OPEN);
      const resChannels = [...channelOpens, ...channelNonOpens];
      channels.value = resChannels.map((channel)=>{
        let version: any = "";
        try {
          version = JSON.parse(channel.version);
        } catch (error) {
          version = channel.version;
        }

        console.log({ version })
        return {
          ...channel,
          version
        }
      })
    });
  }
});

function loadChannel(channel: string, port: string) {
  chainStore.rpc.getIBCChannelNextSequence(channel, port).then((x) => {
    console.log(x);
  });
}

function color(v: string) {
  if (v === "3") {
    return 'success';
  }
  return 'warning';
}
</script>
<template>
  <div class="mx-6">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
      <div
        class="col-span-1 md:col-span-2 px-4 pt-3 pb-4 rounded-[16px] shadow bg-[#141416] border border-[#242627] flex flex-col justify-center items-center bg-img-ibc"
      >
        <div
          class="box-border p-4 md:p-6 min-h-[112px] min-w-[256px] !rounded-[20px]"
        >
          <div>
            <div
              class="order-first text-3xl font-semibold text-center tracking-tight text-white mb-1"
            >
              {{ baseStore.latest?.block?.header?.chainId }}
            </div>
            <div
              class="text-sm text-gray-500 dark:text-gray-400 text-center mt-4"
            >
              {{ conn?.clientId }} {{ props.connection_id }}
            </div>
          </div>
        </div>
        <div class="flex w-full gap-2 items-center justify-between my-4">
          <div class="flex-1 border border-[#383B40]"></div>
          <div
            :class="{ 'text-[#39DD47]': conn?.state === State.STATE_OPEN }"
            class="inline-flex gap-2 whitespace-nowrap"
          >
            <!-- <span class="text-lg rounded-full">&#x21cc;</span> -->
            <Icon icon="mdi:swap-vertical" width="20" height="20" />
            <div class="text-center">
              {{ conn?.state !== State.STATE_OPEN ? 'Failed' : 'Open' }}
              ({{ conn?.state }})
            </div>
          </div>
          <div class="flex-1 border border-[#383B40]"></div>
        </div>
        <div
          class="box-border p-4 md:p-6 min-h-[112px] min-w-[256px] !rounded-[20px]"
        >
          <div
            class="order-first text-3xl font-semibold tracking-tight text-center text-white"
          >
            {{ clientState?.chainId }}
          </div>
          <div
            class="text-sm text-gray-500 dark:text-gray-400 text-center mt-4"
          >
            {{ conn?.counterparty?.connectionId }}
            {{ clientState?.clientId }}
          </div>
        </div>
      </div>

      <div class="section col-span-1 md:col-span-3 !mb-0">
        <h2 class="card-title overflow-hidden text-white ml-2">
          {{ $t('ibc.title_2') }}
        </h2>
        <span class="ml-2 text-sm text-break text-[#B4B7BB] mb-2">{{
          clientState?.clientState?.typeUrl
        }}</span>
        <br />
        <br />
        <div class="w-full border-b border-base-300 mb-2"></div>
        <div class="overflow-x-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <table class="table table-sm capitalize">
            <thead class="text-white font-semibold">
              <tr>
                <td colspan="3">{{ $t('ibc.trust_parameters') }}</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="w-52">{{ $t('ibc.trust_level') }}:</td>
                <td>
                  {{ clientState?.trustLevel?.numerator }}/{{
                    clientState?.trustLevel?.denominator
                  }}
                </td>
              </tr>
              <tr>
                <td class="w-52">{{ $t('ibc.trusting_period') }}:</td>
                <td>
                  {{ formatSeconds(clientState?.trustingPeriod) }}
                </td>
              </tr>
              <tr>
                <td class="w-52">{{ $t('ibc.unbonding_period') }}:</td>
                <td>
                  {{ formatSeconds(clientState?.unbondingPeriod) }}
                </td>
              </tr>
              <tr>
                <td class="w-52">{{ $t('ibc.max_clock_drift') }}:</td>
                <td>
                  {{ formatSeconds(clientState?.maxClockDrift) }}
                </td>
              </tr>
              <tr>
                <td class="w-52">{{ $t('ibc.frozen_height') }}:</td>
                <td>
                  {{ clientState?.frozenHeight?.revisionHeight.toString() }}
                </td>
              </tr>
              <tr>
                <td class="w-52">{{ $t('ibc.latest_height') }}:</td>
                <td>
                  {{ clientState?.latestHeight?.revisionHeight.toString() }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="md:hidden w-full border-b border-base-300 mb-2"></div>
          <table class="table table-sm text-sm w-full capitalize">
            <thead class="text-white font-semibold">
              <tr>
                <td colspan="2">{{ $t('ibc.upgrade_parameters') }}</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2">
                  <div class="flex justify-between">
                    <span>{{ $t('ibc.allow_update_after_expiry') }}:</span>
                    <span>{{ clientState?.allowUpdateAfterExpiry }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  <div class="flex justify-between">
                    <span
                      >{{ $t('ibc.allow_update_after_misbehaviour') }}:
                    </span>
                    <span>{{ clientState?.allowUpdateAfterMisbehaviour }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="w-52">{{ $t('ibc.upgrade_path') }}:</td>
                <td class="text-right text-break">
                  {{ clientState?.upgradePath?.join(', ') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="section">
      <h2 class="card-title text-white">{{ $t('ibc.channels') }}</h2>
      <div class="overflow-auto">
        <table class="table w-full mt-4">
          <thead>
            <tr class="text-white">
              <th style="position: relative; z-index: 2">
                {{ $t('ibc.channel_id') }}
              </th>
              <th>{{ $t('ibc.port_id') }}</th>
              <th>{{ $t('ibc.state') }}</th>
              <th>{{ $t('ibc.counterparty') }}</th>
              <th>{{ $t('ibc.hops') }}</th>
              <th>{{ $t('ibc.version') }}</th>
              <th class="text-right">{{ $t('ibc.ordering') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in channels" class="cursor-pointer" @click="router.push(`/${chain}/ibc/connection/${v.channelId}/${v.portId}`)">
              <td class="text-white">
                <a href="#" @click="loadChannel(v.channelId, v.portId)">{{
                  v.channelId
                }}</a>
              </td>
              <td class="text-white">{{ v.portId }}</td>
              <td>
                <div
                  class="text-x font-bold truncate relative py-2 px-4 rounded-full w-fit"
                  :class="`text-${color(v.state.toString())}`"
                >
                  <!-- <span
                    class="inset-x-0 inset-y-0 opacity-10 absolute"
                    :class="`bg-${color(v.state.toString())}`"
                  ></span> -->
                  {{ STATE[v.state||-1] }}
                </div>
              </td>
              <td>
                {{ v.counterparty?.portId }}/{{ v.counterparty?.channelId }}
              </td>
              <td class="text-white">{{ v.connectionHops.join(', ') }}</td>
              <td>
                {{ v.version }}
              </td>
              <td class="text-right text-white">{{ ORDERING[v.ordering] }}</td>
            </tr>
            <tr v-for="v in ibcStore.registryChannels" class="cursor-pointer" @click="router.push(`/${chain}/ibc/connection/${v[ibcStore.sourceField].channel_id}/${v[ibcStore.sourceField].port_id}`)">
              <td class="text-white">
                <a href="#">{{ v[ibcStore.sourceField].channel_id }}</a>
              </td>
              <td>{{ v[ibcStore.sourceField].port_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
