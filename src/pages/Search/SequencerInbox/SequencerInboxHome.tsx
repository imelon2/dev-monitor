import { AgGridReact } from "ag-grid-react";
import {
  CellClickedEvent,
  colorSchemeDarkBlue,
  themeQuartz,
  type ColDef,
} from "ag-grid-community";
import { useEffect, useMemo, useState } from "react";
import { Container, Box, Grid, Tooltip, CircularProgress } from "@mui/material";
import { getBlockToSearchEventsFrom, shortenAddress } from "../../../libs/utils";
import { Address, Hex } from "viem";
import { ClientHandler } from "../../../libs/client";
import { SequencerInboxHandler } from "../../../handlers/sequencerInbox";
import { CustomLoadingOverlay } from "../../../components/customLoadingOverlay";
import { getOrbitClient, getContractHandlers } from "../../../modules/getClientHandler";


type IProps = {
  clientHandler: ClientHandler,
  sequencerInboxHandler: SequencerInboxHandler
}

interface IRow {
  "Event Name": string,
  "Batch Sequence Number": number,
  "Block Number": number,
  "Transaction Hash": Hex
  "afterAcc": Hex,
  "beforeAcc": Hex,
  "delayedAcc": Hex
}

const InfoHeader = ({ sequencerInboxHandler }: IProps) => {
  const [loading, setLoading] = useState(false);
  const [batchCount, setBatchCount] = useState("");
  const [totalDelayedMessagesRead, setTotalDelayedMessagesRead] = useState("");
  const [sequencerInboxAddress, setSequencerInboxAddress] = useState<Address>("0x");

  useEffect(() => {
    const fetchData = async () => {
      const result = await sequencerInboxHandler.callReadFunc([
        "batchCount",
        "totalDelayedMessagesRead",
      ]);

      setBatchCount(result.batchCount)
      setTotalDelayedMessagesRead(result.totalDelayedMessagesRead)
      setSequencerInboxAddress(sequencerInboxHandler.sequencerInboxAddress)
      setLoading(true)
    };
    fetchData();
  }, []);


  return (
    <Grid container spacing={2}>
      <Grid size={4} sx={{}}>
        <Tooltip title={sequencerInboxAddress} placement="top">
          <div>
            <Box
              sx={{ fontSize: "h6.fontSize", fontWeight: "bold" }}
            >{`SequencerInbox`}</Box>
            {loading ? (
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
  )
}

const EventList = ({ clientHandler, sequencerInboxHandler }: IProps) => {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<IRow[]>();
  const [progress, setProgress] = useState(0);
  const [totalBatchCount, setTotalBatchCount] = useState(0);
  const [searchedBatchCount, setSearchedBatchCount] = useState(0);

  const [colDefs] = useState<ColDef[]>([
    { field: "Event Name" },
    { field: "Batch Sequence Number" },
    { field: "Block Number" },
    { field: "Transaction Hash" },
    { field: "afterAcc" },
    { field: "beforeAcc" },
    { field: "delayedAcc" },
  ]);

  const loadingOverlayComponentParams = useMemo(() => {
    return { loadingMessage: `${searchedBatchCount}/${totalBatchCount}` ,value:progress};
  }, [progress]);

  useEffect(() => {
    const fetchData = async () => {

      const { batchCount } = await sequencerInboxHandler.callReadFunc([
        "batchCount",
      ]);

      setTotalBatchCount(Number(batchCount))
      const delivered: any[] = [];

      let toBlock = await clientHandler.getBlockNumber('parent');
      while (delivered.length < Number(batchCount)) {
        const fromBlock = getBlockToSearchEventsFrom(toBlock);
        const result = await sequencerInboxHandler.getSequencerBatchDeliveredEvent(fromBlock, toBlock);
        delivered.push(...result);

        setSearchedBatchCount(delivered.length)
        setProgress((delivered.length/Number(batchCount) * 100))
        toBlock = fromBlock;
      }

      delivered.sort((a, b) => Number((b as any).args.batchSequenceNumber) - Number((a as any).args.batchSequenceNumber),);

      const _row: IRow[] = delivered.map((data) => {
        return {
          "Event Name": data.eventName,
          "Batch Sequence Number": Number(data.args.batchSequenceNumber),
          "Block Number": Number(data.blockNumber),
          "Transaction Hash": data.transactionHash,
          "afterAcc": data.args.afterAcc,
          "beforeAcc": data.args.beforeAcc,
          "delayedAcc": data.args.delayedAcc,
        }
      })

      setRow(_row)
      setLoading(false)

    }
    fetchData()
  }, [])


  const themeDarkWarm = themeQuartz.withPart(colorSchemeDarkBlue);

  const onCellClicked = (params:CellClickedEvent) => {
    navigator.clipboard.writeText(String(params.value))
  };

  return (
    <AgGridReact
      theme={themeDarkWarm}
      rowData={row}
      loading={loading}
      columnDefs={colDefs}
      pagination={true}
      loadingOverlayComponent={CustomLoadingOverlay}
      loadingOverlayComponentParams={loadingOverlayComponentParams}
      onCellClicked={onCellClicked}
      />
  )
}

function SequencerInboxHome() {
  const [initialing, setInitialing] = useState(true)
  const [clientHandler, /** setClientHandler */] = useState<ClientHandler>(getOrbitClient("warehouse"));
  const [sequencerInboxHandler, setSequencerInboxHandler] = useState<SequencerInboxHandler>({} as SequencerInboxHandler /** init */)

  useEffect(() => {
    const fetchData = async () => {
      const handlers = await getContractHandlers(
        "warehouse",
        clientHandler,
        ["sequencerInboxHandler"]
      );

      setSequencerInboxHandler(handlers.sequencerInboxHandler)
      setInitialing(false) // end init
    };
    fetchData();
  }, []);

  return (
    <Container>
      {initialing ? <></> : <>
        <InfoHeader clientHandler={clientHandler} sequencerInboxHandler={sequencerInboxHandler} />
        <Box sx={{ height: "700px" }}>
          <EventList clientHandler={clientHandler} sequencerInboxHandler={sequencerInboxHandler} />
        </Box></>}
    </Container>
  );
}

export default SequencerInboxHome;
