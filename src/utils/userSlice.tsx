import { createSlice } from "@reduxjs/toolkit";

interface User {
  firstName: string;
  emailId: string;
  photoUrl : string
}

const userSlice = createSlice({
  name: "user",
  initialState: null as User | null,
  reducers: {
    addUser: (_state, action: { payload: User }) => action.payload,
    removeUser: () => null,
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;