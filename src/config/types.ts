import { Hex, Address } from "viem"

export type IOrbitChainType = "warehouse"

export type SequencerL2BatchFromOrigiParameters = {
    sequenceNumber:bigint,
    data:Hex,
    afterDelayedMessagesRead:bigint,
    gasRefunder:Address,
    prevMessageCount:bigint,
    newMessageCount:bigint
}