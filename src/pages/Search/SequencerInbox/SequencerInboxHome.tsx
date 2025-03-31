import { AgGridReact } from "ag-grid-react";
import {
  colorSchemeDarkWarm,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { useEffect, useState } from "react";
import { useFetchJson } from "../../../hooks/useFetchJson";
import { Container, Box, Grid, Tooltip, CircularProgress } from "@mui/material";
import { getBlockToSearchEventsFrom, shortenAddress } from "../../../libs/utils";
import { Address } from "viem";
import { ClientHandler } from "../../../libs/client";
import {
  getOrbitClient,
  getContractHandlers,
} from "../../../modules/getCLientHandler";

interface IRow {
  mission: string;
  company: string;
  location: string;
  date: string;
  time: string;
  rocket: string;
  price: number;
  successful: boolean;
}

function SequencerInboxHome() {
  const [clientHandler, setClientHandler] = useState<ClientHandler>(
    getOrbitClient("warehouse")
  );

  const [loadings, setLoading] = useState(false);
  const [batchCount, setBatchCount] = useState("");
  const [totalDelayedMessagesRead, setTotalDelayedMessagesRead] = useState("");
  const [sequencerInboxAddress, setSequencerInboxAddress] =
    useState<Address>("0x");

  useEffect(() => {
    const fetchData = async () => {
      const { sequencerInboxHandler } = await getContractHandlers(
        "warehouse",
        clientHandler,
        ["sequencerInboxHandler"]
      );
      const result = await sequencerInboxHandler.callReadFunc([
        "batchCount",
        "totalDelayedMessagesRead",
      ]);

      const delivered = [];
      let toBlock = await clientHandler.getBlockNumber('parent');
      while (delivered.length < Number(result.batchCount)) {
        const fromBlock = getBlockToSearchEventsFrom(toBlock);
        const result = await sequencerInboxHandler.getSequencerBatchDeliveredEvent(fromBlock, toBlock);
        delivered.push(...result);
    
        // process.stdout.write(
        //   `\rProgress... ${getProgressPercentage(Number(batchCount), delivered.length).toFixed(2)}% | ${
        //     delivered.length
        //   }/${batchCount}`,
        // );
    
        toBlock = fromBlock;
        console.log(delivered.length);
        
      }

      console.log(delivered[2]);
      
      setBatchCount(result.batchCount);
      setTotalDelayedMessagesRead(result.totalDelayedMessagesRead);
      setSequencerInboxAddress(sequencerInboxHandler.sequencerInboxAddress);
      setLoading(true);
    };
    fetchData();
  }, []);

  // const { data, loading } = useFetchJson<IRow>(
  //     "https://www.ag-grid.com/example-assets/space-mission-data.json",
  // );
  // const [colDefs] = useState<ColDef[]>([
  //     { field: "mission" },
  //     { field: "company" },
  //     { field: "location" },
  //     { field: "date" },
  //     { field: "price" },
  //     { field: "successful" },
  //     { field: "rocket" },
  // ]);
  // {/* <div style={{ width: "100%", height: "400px" }}> */ }
  // {/* The AG Grid component, with Row Data & Column Definition props */ }
  // const themeDarkWarm = themeQuartz.withPart(colorSchemeDarkWarm);

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid size={4} sx={{}}>
          <Tooltip title={sequencerInboxAddress} placement="top">
            <div>
              <Box
                sx={{ fontSize: "h6.fontSize", fontWeight: "bold" }}
              >{`SequencerInbox`}</Box>
              {loadings ? (
                <Box>{shortenAddress(sequencerInboxAddress as Address)}</Box>
              ) : (
                <CircularProgress />
              )}
            </div>
          </Tooltip>
        </Grid>
        <Grid size={4}>
          <Box
            sx={{ fontSize: "h6.fontSize", fontWeight: "bold" }}
          >{`Batch Count`}</Box>
          <Box>{batchCount}</Box>
        </Grid>
        <Grid size={4}>
          <Box
            sx={{ fontSize: "h6.fontSize", fontWeight: "bold" }}
          >{`totalDelayedMessagesRead`}</Box>
          <Box>{totalDelayedMessagesRead}</Box>
        </Grid>
      </Grid>
      <Box sx={{ height: "700px" }}>
        {/* <AgGridReact
                    theme={themeDarkWarm}
                    rowData={data}
                    loading={loading}
                    columnDefs={colDefs}
                    pagination={true}
                /> */}
      </Box>
    </Container>
  );
}

export default SequencerInboxHome;
