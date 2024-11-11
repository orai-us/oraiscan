import { defineStore } from 'pinia';
import { useWalletStore } from './useWalletStore';

let CALLBACK: any = null;

export const useProposalDialog = defineStore('proposalDialog', {
  state: () => {
    return {
      sender: '',
      denom: '',
    };
  },
  getters: {
    walletAddress() {
      return useWalletStore().currentAddress;
    },
  },
  actions: {
    open(denom: string, callback?: Function) {
      this.sender = this.walletAddress;
      this.denom = denom;
      if (callback) {
        CALLBACK = callback;
      } else {
        CALLBACK = undefined;
      }
    },
  },
});
