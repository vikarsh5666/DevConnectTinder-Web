import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./types";

const connectionSlice = createSlice({
  name: "connections",
  initialState: null as User[] | null,
  reducers: {
    addConnections: (_, action: PayloadAction<User[]>) => action.payload,
    removeConnection: () => null,
    clearConnections: () => null,
  },
});

export const { addConnections, removeConnection, clearConnections } =
  connectionSlice.actions;
export default connectionSlice.reducer;
