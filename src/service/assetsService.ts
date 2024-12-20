import { NEW_ASSETS } from '@/constants';
import { api, METHODS } from './api';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { QueryClient, setupBankExtension } from '@cosmjs/stargate';
import {
  QueryDenomOwnersRequest,
  QueryDenomOwnersResponse,
  QueryDenomsMetadataRequest,
  QueryDenomsMetadataResponse,
} from 'cosmjs-types/cosmos/bank/v1beta1/query';

const baseMarketOrai = 'https://price.market.orai.io';
const baseCoingecko = 'https://api.coingecko.com/api/v3';
const baseLcdOraiBank = 'https://lcd.orai.io/cosmos/bank';
const baseCosmwasm = 'https://lcd.orai.io/cosmwasm/wasm';
const multiCallContractAddress =
  'orai1q7x644gmf7h8u8y6y8t9z9nnwl8djkmspypr6mxavsk9ual7dj0sxpmgwd';
export interface ParamsSimplePrice {
  ids: string;
}
const simplePrice = '/simple/price';
const coinsMarket = '/coins/markets';

export const getPriceByIds = async (params: ParamsSimplePrice) => {
  const config = {
    baseURL: baseMarketOrai,
    url: simplePrice,
    method: METHODS.GET,
    params: {
      ...params,
      vs_currencies: 'usd',
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true,
      include_last_updated_at: true,
    },
  };
  const res = await api.request(config);
  return res?.data;
};

export const getInfoToken = async (params: ParamsSimplePrice) => {
  const config = {
    baseURL: baseCoingecko,
    url: coinsMarket,
    method: METHODS.GET,
    params: {
      ...params,
      vs_currency: 'usd',
    },
  };
  const res = await api.request(config);
  return res?.data;
};

const urlBalances = '/v1beta1/balances';
export const getBalancesByAddessAccount = async (address: string) => {
  const config = {
    baseURL: baseLcdOraiBank,
    url: `${urlBalances}/${address}`,
    method: METHODS.GET,
  };
  const res = await api.request(config);
  return res?.data;
};

const urlSmartContract = '/v1/contract';
export const getSmartQueryByContract = async (
  addressContract: string,
  queryData: string
) => {
  const config = {
    baseURL: baseCosmwasm,
    url: `${urlSmartContract}/${addressContract}/smart/${queryData}`,
    method: METHODS.GET,
  };
  const res = await api.request(config);
  return res?.data;
};

export const getCw20Balances = async (
  address: string,
  denoms: Array<string>
) => {
  const multiCallUrl = `${urlSmartContract}/${multiCallContractAddress}/smart/`;
  const msgJson = {
    aggregate: {
      queries: denoms.map((denom) => ({
        address: denom,
        data: btoa(JSON.stringify({ balance: { address } })),
      })),
    },
  };
  const url = multiCallUrl + btoa(JSON.stringify(msgJson));
  const config = {
    baseURL: baseCosmwasm,
    url,
    method: METHODS.GET,
  };

  const res = await api.request(config);
  return res?.data;
};

export const getListAsset = async (chain: string) => {
  try {
    const config = {
      baseURL: 'https://registry.ping.pub',
      url: `${chain.toLowerCase()}/assetlist.json`,
      method: METHODS.GET,
    };
    const res = await api.request(config);
    const assets = res.data.assets as Array<any>;
    if (chain === 'oraichain') return [...assets, ...NEW_ASSETS];
    return assets;
  } catch (error) {
    console.log({ error });
    return NEW_ASSETS;
  }
};

export const getListAssetOnChainAndRegistry = async (endpointAddress: string, chain: string) => {
  try {
    const cometClient = await Tendermint37Client.connect(endpointAddress);
    const queryClient = QueryClient.withExtensions(
      cometClient as any,
      setupBankExtension
    );
    const requestData = Uint8Array.from(
      QueryDenomsMetadataRequest.encode(
        QueryDenomsMetadataRequest.fromPartial({})
      ).finish()
    );
    const { value } = await queryClient.queryAbci(
      '/cosmos.bank.v1beta1.Query/DenomsMetadata',
      requestData
    );
    const bankAssets = QueryDenomsMetadataResponse.decode(value);
    const registryAssets = await getListAsset(chain);
    const seenBase = new Set();
    return [...registryAssets, ...bankAssets.metadatas].filter((item) => {
      if (!seenBase.has(item.base)) {
        seenBase.add(item.base);
        return true;
      }
      return false;
    });
  } catch (error) {
    console.log({ error });
    return [];
  }
};

export const getListHolderAssets = async (pagination: any, denom: string, endpointAddress: string) => {
  try {
    const { offset, limit } = pagination;
    const cometClient = await Tendermint37Client.connect(endpointAddress);
    const queryClient = QueryClient.withExtensions(
      cometClient as any,
      setupBankExtension
    );
    const requestData = Uint8Array.from(
      QueryDenomOwnersRequest.encode(
        QueryDenomOwnersRequest.fromPartial({
          denom: denom,
          pagination: { offset: BigInt(offset), limit: BigInt(limit), countTotal: true },
        })
      ).finish()
    );
    const { value } = await queryClient.queryAbci(
      '/cosmos.bank.v1beta1.Query/DenomOwners',
      requestData
    );
    const res = QueryDenomOwnersResponse.decode(value);
    console.log({ res });
    return res;
  } catch (error) {
    console.log({ error });
    return { denomOwners: [], pagination: { total: 0 } };
  }
};
