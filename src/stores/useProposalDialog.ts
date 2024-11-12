import { defineStore } from 'pinia';
import { useWalletStore } from './useWalletStore';

let CALLBACK: any = null;

export const useProposalDialog = defineStore('proposalDialog', {
  state: () => {
    return {
      sender: '',
      denom: '',
      chainId: '',
    };
  },
  getters: {
    walletAddress() {
      return useWalletStore().currentAddress;
    },
  },
  actions: {
    open(chainId: string, denom: string, callback?: Function) {
      this.chainId = chainId;
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
