import { AgGridReact } from "ag-grid-react";
import { colorSchemeDarkWarm, themeQuartz, type ColDef } from "ag-grid-community";
import { useEffect, useState } from "react";
import { useFetchJson } from "../../../hooks/useFetchJson";
import { Container, Box, Grid, Tooltip, CircularProgress } from "@mui/material";
import { useFetchOrbitClient } from "../../../hooks/useFetchOrbitClient";
import { shortenAddress } from "../../../libs/utils";
import { Address } from "viem";
import { useFetchHandlers } from "../../../hooks/useFetchHandlers";

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
    const { clientHandler } = useFetchOrbitClient('warehouse')
    const { sequencerInboxHandler } = useFetchHandlers("warehouse", clientHandler!, ["sequencerInboxHandler"])
    
    const [loadings, setLoading] = useState(false);
    const [batchCount, setBatchCount] = useState("");
    const [totalDelayedMessagesRead, setTotalDelayedMessagesRead] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const result = await sequencerInboxHandler!.callReadFunc(['batchCount', 'totalDelayedMessagesRead'])


            setBatchCount(result.batchCount)
            setTotalDelayedMessagesRead(result.totalDelayedMessagesRead)
            setLoading(true)
        };
        fetchData();
    }, [])

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
            <Grid container spacing={2} >
                <Grid size={4} sx={{}}>
                    <Tooltip title={sequencerInboxHandler?.sequencerInboxAddress} placement="top">
                            <div>
                                <Box sx={{ fontSize: 'h6.fontSize', fontWeight: 'bold' }}>{`SequencerInbox`}</Box>
                                {loadings ? <Box>{shortenAddress(sequencerInboxHandler?.sequencerInboxAddress as Address)}</Box> : <CircularProgress />}
                                
                            </div>
                    </Tooltip>
                </Grid>
                <Grid size={4}>
                    <Box sx={{ fontSize: 'h6.fontSize', fontWeight: 'bold' }}>{`Batch Count`}</Box>
                    <Box>{batchCount}</Box>
                </Grid>
                <Grid size={4} >
                    <Box sx={{ fontSize: 'h6.fontSize', fontWeight: 'bold' }}>{`totalDelayedMessagesRead`}</Box>
                    <Box>{totalDelayedMessagesRead}</Box>
                </Grid>
            </Grid>
            <Box sx={{ height: '700px' }}>
                {/* <AgGridReact
                    theme={themeDarkWarm}
                    rowData={data}
                    loading={loading}
                    columnDefs={colDefs}
                    pagination={true}
                /> */}
            </Box>
        </Container>
    )
}

export default SequencerInboxHome