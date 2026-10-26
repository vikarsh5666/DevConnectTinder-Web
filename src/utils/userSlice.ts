import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./types";

const userSlice = createSlice({
  name: "user",
  initialState: null as User | null,
  reducers: {
    addUser: (_, action: PayloadAction<User>) => action.payload,
    removeUser: () => null,
  },
});

export const { addUser, removeUser } = userSlice.actions;

export default userSlice.reducer;
