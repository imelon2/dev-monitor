import {
  Abi,
  Address,
  BlockNumber,
  BlockTag,
  decodeFunctionData,
  getAbiItem,
  Hex,
  parseEventLogs,
} from 'viem';
import { SequencerInbox__factory } from '@arbitrum/sdk/dist/lib/abi/factories/SequencerInbox__factory';
import { ClientHandler } from '../libs/client';
import { SequencerL2BatchFromOrigiParameters } from '../config/types';

export class SequencerInboxHandler {
  clientHandler: ClientHandler;
  sequencerInboxAddress: Address;

  constructor(clientHandler: ClientHandler, rollupAddress: Address) {
    this.clientHandler = clientHandler;
    this.sequencerInboxAddress = rollupAddress;
  }

  static decodeBatchPostingCalldata(input: Hex): SequencerL2BatchFromOrigiParameters {
    const { args } = decodeFunctionData({
      abi: SequencerInbox__factory.abi.filter(
        (abiItem) => abiItem.type == 'function' && abiItem.name == 'addSequencerL2BatchFromOrigin',
      ),
      data: input,
    });

    if (args == undefined) {
      throw new Error(`Not func addSequencerL2BatchFromOrigin() calldata`);
    }

    return {
      sequenceNumber: args[0] as bigint,
      data: args[1] as Hex,
      afterDelayedMessagesRead: args[2] as bigint,
      gasRefunder: args[3] as Address,
      prevMessageCount: args[4] as bigint,
      newMessageCount: args[5] as bigint,
    };
  }

  async callReadFunc<T extends ('batchCount'|'totalDelayedMessagesRead')[]>(
    contracts: T,
    args?: any[][],
  ): Promise<{ [K in T[number]]: string }> {
    const address = await Promise.all(
      contracts.map(async (functionName, i) => {
        return await this.clientHandler.readContract(
          'parent',
          this.sequencerInboxAddress,
          [...SequencerInbox__factory.abi],
          functionName,
          args ? args[i] : undefined,
        );
      }),
    );

    const result: any = {};
    contracts.forEach((key, i) => {
      result[key] = address[i];
    });
    return result;
  }

  async getSequencerBatchDeliveredEvent(
    fromBlock: BlockNumber | BlockTag = 'earliest',
    toBlock: BlockNumber | BlockTag = 'latest',
  ) {
    return await this.clientHandler.getLogs(
      'parent',
      this.sequencerInboxAddress,
      // parseAbi(SequencerInbox__factory.abi)    ,
      SequencerInbox__factory.abi.filter(
        (abiItem) => abiItem.type == 'event' && abiItem.name == 'SequencerBatchDelivered',
      )[0],
      undefined,
      fromBlock,
      toBlock,
    );
  }

  async parseEventLogs(txHash: `0x${string}`) {
    const txReceipt = await this.clientHandler.getTransactionReceipt('parent', txHash);
    if (!txReceipt) {
      throw new Error(`Not func addSequencerL2BatchFromOrigin() calldata`);
    }

    return parseEventLogs({
      abi: SequencerInbox__factory.abi,
      logs: txReceipt.logs,
    });
  }

  async decodeFunctionData(txHash: `0x${string}`) {
    const tx = await this.clientHandler.getTransaction('parent', txHash);
    if (!tx) {
      throw new Error(`Not func addSequencerL2BatchFromOrigin() calldata`);
    }

    const decoded = decodeFunctionData({
      abi: SequencerInbox__factory.abi,
      data: tx.input,
    });
    
    const is = getAbiItem({
      abi:SequencerInbox__factory.abi as Abi,
      name:decoded.functionName,
      args:decoded.args
    })

    console.log();
    
    // 3. decodeFunctionData는 { functionName, args } 형태로 반환합니다.
    // 이제, decoded.functionName을 사용해 해당 함수의 ABI를 찾아옵니다.
    // const functionEntry = SequencerInbox__factory.abi.find(
    //   (entry) => entry.type === 'function' && entry.name === decoded.functionName && entry.inputs.length == decoded.args!.length,
    // );

    if (!is) {
      throw new Error('디코딩된 함수에 해당하는 ABI를 찾을 수 없습니다.');
    }

    if (is.type !== "function"){
      throw new Error('디코딩된 함수에 해당하는 ABI를 찾을 수 없습니다.');
    }
    // if (!decoded.args) {
    //   return 
    // }
    // 4. ABI inputs 배열의 순서에 따라, args 배열의 각 값을 매핑하여 { paramName: value } 객체를 생성합니다.
    const mappedResult = is.inputs.reduce((acc, input, index) => {
      acc[input.name!] = decoded.args![index];
      return acc;
    }, {} as any);

    return mappedResult
  }
}
