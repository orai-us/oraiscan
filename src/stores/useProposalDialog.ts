import { defineStore } from 'pinia';
import { useWalletStore } from './useWalletStore';

let CALLBACK: any = null;

export const useProposalDialog = defineStore('proposalDialog', {
  state: () => {
    return {
      sender: '',
      denom: '',
      chainId: '',
      baseUrlRpc: '',
    };
  },
  getters: {
    walletAddress() {
      return useWalletStore().currentAddress;
    },
  },
  actions: {
    open(
      baseUrlRpc: string,
      chainId: string,
      denom: string,
      callback?: Function
    ) {    
      this.sender = this.walletAddress;
      this.denom = denom;
      this.baseUrlRpc = baseUrlRpc;
      this.chainId = chainId;
      if (callback) {
        CALLBACK = callback;
      } else {
        CALLBACK = undefined;
      }
    },
  },
});
