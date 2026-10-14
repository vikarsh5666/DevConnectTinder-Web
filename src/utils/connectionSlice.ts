import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
    name: 'connections',
    initialState: null as any,
    reducers: {
        addConnections: (_, action) => action.payload,
        removeConnection: () => null
    }
});

export const {addConnections, removeConnection} = connectionSlice.actions;
export default connectionSlice.reducer;