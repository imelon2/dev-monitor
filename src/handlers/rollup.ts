import { Address, BlockNumber, BlockTag } from 'viem';
import { ClientHandler } from '../libs/client';
import { RollupCore__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupCore__factory';

export class RollupHandler {
  clientHandler: ClientHandler;
  rollupAddress: Address;

  constructor(clientHandler: ClientHandler, rollupAddress: Address) {
    this.clientHandler = clientHandler;
    this.rollupAddress = rollupAddress;
  }

  async getSystemContract<T extends ('bridge' | 'inbox' | 'sequencerInbox' | 'outbox')[]>(
    contracts: T,
  ): Promise<{ [K in T[number]]: string }> {
    const address = await Promise.all(
      contracts.map(async (functionName) => {
        return await this.clientHandler.readContract(
          'parent',
          this.rollupAddress,
          [...RollupCore__factory.abi],
          functionName,
        );
      }),
    );
    const result: any = {};
    contracts.forEach((key, i) => {
      result[key] = address[i];
    });
    return result;
  }

  async searchRollupInitializedEvent(
    fromBlock: BlockNumber | BlockTag = "earliest",
    toBlock: BlockNumber | BlockTag = "latest",
  ) {
    return await this.clientHandler.getLogs(
      'parent',
      this.rollupAddress,
      RollupCore__factory.abi.filter(
        (abiItem) => abiItem.type == 'event' && abiItem.name == 'RollupInitialized',
      )[0],
      undefined,
      fromBlock,
      toBlock,
    );
  }
}
