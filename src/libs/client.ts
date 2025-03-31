import { BlockNumber, BlockTag, PublicClient, createPublicClient, http, Address } from 'viem';
import { defineDkargoChainInformation, getChainInfoFromChainId } from "./utils";

export type ChainLayer = 'parent' | 'orbit';

export class ClientHandler {
  parentChainPublicClient: PublicClient;
  orbitPublicClient: PublicClient;

  constructor(
    parentChainId: number,
    orbitChainId: number,
    parentChainRpc: string,
    orbitChainRpc: string,
  ) {
    // Create parent chain client
    const parentChainInformation = getChainInfoFromChainId(parentChainId);
    this.parentChainPublicClient = createPublicClient({
      chain: parentChainInformation,
      transport: http(parentChainRpc,{timeout:1000000,retryCount:10,retryDelay:10000}),
      // transport: webSocket(parentChainRpc,{timeout:60000,retryCount:10}),
    });

    // Create orbit chain client
    const orbitChainInformation = defineDkargoChainInformation(orbitChainId, orbitChainRpc);
    this.orbitPublicClient = createPublicClient({
      chain: orbitChainInformation,
      transport: http(),
    })
  }

  readContract = async (
    chainLayer: ChainLayer,
    address: Address,
    abi: any,
    functionName: string,
    args: any[] = [],
  ) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;

    const result = await client.readContract({
      address,
      abi,
      functionName,
      args,
    });

    return result;
  };

  getLogs = async (
    chainLayer: ChainLayer,
    address: Address,
    eventAbi: any,
    args?: any,
    fromBlock?: BlockNumber | BlockTag,
    toBlock?: BlockNumber | BlockTag,
  ) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;

    const result = await client.getLogs({
      address,
      event: eventAbi,
      args,
      fromBlock,
      toBlock,
    });

    return result;
  };

  getTransaction = async (chainLayer: ChainLayer, transactionHash: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;

    const result = await client.getTransaction({
      hash: transactionHash,
    });    
    return result;
  };

  getTransactionReceipt = async (chainLayer: ChainLayer, transactionHash: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;

    const result = await client.getTransactionReceipt({
      hash: transactionHash,
    });    
    return result;
  };

  getBlockByHash = async (chainLayer: ChainLayer, blockHash: `0x${string}`) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;

    const result = await client.getBlock({
      blockHash,
    });    
    return result;
  };

  getBlockNumber = async (chainLayer: ChainLayer) => {
    const client = chainLayer === 'parent' ? this.parentChainPublicClient : this.orbitPublicClient;

    const result = await client.getBlockNumber();
    return result;
  };
}
