import Box from "@mui/material/Box";
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import type { CustomLoadingOverlayProps } from "ag-grid-react";

export const CustomLoadingOverlay = (
    props: CustomLoadingOverlayProps & { loadingMessage: string } & LinearProgressProps & { value: number },
) => {
    return (
        <div className="ag-overlay-loading-center" role="presentation">
            <Box sx={{ width: '300px' ,padding:1}}>
                <LinearProgress variant="determinate" value={props.value} />
            </Box>

            <Box aria-live="polite" aria-atomic="true" sx={{font:'510px'}}>
                {props.loadingMessage}
            </Box>
        </div>
    );
};