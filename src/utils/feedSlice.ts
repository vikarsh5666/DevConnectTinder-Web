import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./types";

const feedSlice = createSlice({
  name: "feed",
  initialState: [] as User[],
  reducers: {
    addFeed: (_, action: PayloadAction<User[]>) => action.payload,
    removeUserFromFeed: (state, action: PayloadAction<string | undefined>) => {
      if (!action.payload) return [];
      return state.filter((user) => user._id !== action.payload);
    },
    clearFeed: () => [],
  },
});

export const { addFeed, removeUserFromFeed, clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
