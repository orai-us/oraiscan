import { defineStore } from 'pinia';
import { useBlockchain } from './useBlockchain';

export const useDistributionStore = defineStore('distributionStore', {
  state: () => {
    return {};
  },
  getters: {
    blockchain() {
      return useBlockchain();
    },
  },
  actions: {
    async fetchCommunityPool() {
      try {
        return this.blockchain.rpc?.getDistributionCommunityPool();
      } catch (error) {
        return { pool: [] };
      }
    },
  },
});
