import { useEffect, useState } from "react";
import { IOrbitChainType } from "../config/types";
import { Address } from "viem";
import { ROLLUP_ADDRESS } from "../config/chainInfo";
import { RollupHandler } from "../handlers/rollup";
import { ClientHandler } from "../libs/client";
import { SequencerInboxHandler } from "../handlers/sequencerInbox";

type HandlerMapping = {
    rollupHandler: RollupHandler | undefined;
    sequencerInboxHandler: SequencerInboxHandler | undefined;
};

export const useFetchHandlers = <T extends (keyof HandlerMapping)[]>(orbit: IOrbitChainType, client: ClientHandler, handlers: T) => {
    console.log("useFetchHandlers");
    
    const [rollupHandler, setRollupHandler] = useState<RollupHandler>();
    const [sequencerInboxHandler, setSequencerInboxHandler] = useState<SequencerInboxHandler>();

    useEffect(() => {
        let rollup;
        switch (orbit) {
            case "warehouse":
                rollup = ROLLUP_ADDRESS['dkargo-warehouse']
                break;

            default:
                rollup = ROLLUP_ADDRESS['dkargo-warehouse']
                break;
        }

        const _rollupHandler = new RollupHandler(client, rollup as Address);

        const fetchData = async (rollupHandler: RollupHandler) => {
            if (handlers.includes('rollupHandler')) {
                setRollupHandler(rollupHandler)
            }


            if (handlers.includes('sequencerInboxHandler')) {
                const { sequencerInbox } = await rollupHandler.getSystemContract(['sequencerInbox']);
                const sequencerInboxHandler = new SequencerInboxHandler(client, sequencerInbox as Address);
                setSequencerInboxHandler(sequencerInboxHandler)
            }
        };
        
        fetchData(_rollupHandler)

    }, [orbit,client,handlers])
    
    return {rollupHandler,sequencerInboxHandler}
}