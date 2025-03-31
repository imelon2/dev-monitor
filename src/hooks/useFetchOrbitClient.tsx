import { useEffect, useState } from "react";
import { CHAIN_INFO } from "../config/chainInfo";
import { ClientHandler } from "../libs/client";
import { IOrbitChainType } from "../config/types";

export const useFetchOrbitClient = (orbit: IOrbitChainType) => {
    console.log("useFetchOrbitClient");
    
    const [clientHandler, setClientHandler] = useState<ClientHandler>();

    useEffect(() => {
        switch (orbit) {
            case "warehouse":
                {
                    const parent = CHAIN_INFO['arbitrum-sepolia']
                    const child = CHAIN_INFO['dkargo-warehouse']
                    const _clientHandler = new ClientHandler(
                        Number(parent.chainId),
                        Number(child.chainId),
                        String(parent.url),
                        String(child.url),
                    );

                    setClientHandler(_clientHandler)
                    break;
                }

            default:
                {
                    const parent = CHAIN_INFO['arbitrum-sepolia']
                    const child = CHAIN_INFO['dkargo-warehouse']

                    const _clientHandler = new ClientHandler(
                        Number(parent.chainId),
                        Number(child.chainId),
                        String(parent.url),
                        String(child.url),
                    );


                    setClientHandler(_clientHandler)
                    break;
                }

        }
    }, [orbit])

    return { clientHandler }
}