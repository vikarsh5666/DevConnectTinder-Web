import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConnectionRequest } from "./types";

const connectionRequestsSlice = createSlice({
  name: "connectionRequests",
  initialState: [] as ConnectionRequest[],
  reducers: {
    addRequests: (_, action: PayloadAction<ConnectionRequest[]>) =>
      action.payload,
    removeRequest: (state, action: PayloadAction<string>) =>
      state.filter((request) => request._id !== action.payload),
    clearRequests: () => [],
  },
});

export const { addRequests, removeRequest, clearRequests } =
  connectionRequestsSlice.actions;
export default connectionRequestsSlice.reducer;
