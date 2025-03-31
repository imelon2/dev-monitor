import { Address } from "viem";
import { CHAIN_INFO, ROLLUP_ADDRESS } from "../config/chainInfo";
import { IOrbitChainType } from "../config/types";
import { RollupHandler } from "../handlers/rollup";
import { SequencerInboxHandler } from "../handlers/sequencerInbox";
import { ClientHandler } from "../libs/client";

export const getOrbitClient = (orbit: IOrbitChainType) => {
  let parent;
  let child;
  switch (orbit) {
    case "warehouse": {
      parent = CHAIN_INFO["arbitrum-sepolia"];
      child = CHAIN_INFO["dkargo-warehouse"];

      break;
    }

    default: {
      parent = CHAIN_INFO["arbitrum-sepolia"];
      child = CHAIN_INFO["dkargo-warehouse"];

      break;
    }
  }
  const clientHandler = new ClientHandler(
    Number(parent.chainId),
    Number(child.chainId),
    String(parent.url),
    String(child.url)
  );
  return clientHandler;
};

type ContractHandlers = {
  rollupHandler: RollupHandler;
  sequencerInboxHandler: SequencerInboxHandler;
};

export const getContractHandlers = async <T extends (keyof ContractHandlers)[]>(
  orbit: IOrbitChainType,
  client: ClientHandler,
  handlers: T
) : Promise<{ [K in T[number]]: ContractHandlers[K] }> => {

  let rollup;

  switch (orbit) {
    case "warehouse":
      rollup = ROLLUP_ADDRESS["dkargo-warehouse"];
      break;

    default:
      rollup = ROLLUP_ADDRESS["dkargo-warehouse"];
      break;
  }
  const result:any = {}

  const rollupHandler = new RollupHandler(client, rollup as Address);
  if (handlers.includes("rollupHandler")) {
    result.rollupHandler = new RollupHandler(client, rollup as Address);
  }

  if (handlers.includes("sequencerInboxHandler")) {
    const { sequencerInbox } = await rollupHandler.getSystemContract([
      "sequencerInbox",
    ]);

    result.sequencerInboxHandler = new SequencerInboxHandler(
      client,
      sequencerInbox as Address
    );
  }

  return result;
};
