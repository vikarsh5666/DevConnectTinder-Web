import { createSlice } from "@reduxjs/toolkit";

const connectionRequestsSlice = createSlice({
  name: "connectionRequests",
  initialState: null,
  reducers: {
    addRequests: (state, action) => action.payload,
    removeRequest: (state, action) => {
      const newArray = state.filter((r) => r._id !== action.payload);
      return newArray;
    },
  },
});

export const { addRequests, removeRequest } = connectionRequestsSlice.actions;
export default connectionRequestsSlice.reducer;