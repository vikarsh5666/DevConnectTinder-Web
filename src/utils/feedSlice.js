import { createSlice } from "@reduxjs/toolkit";

const FeedSlice = createSlice({
    name: 'feed',
    initialState: null,
    reducers: {
        addFeed: (state, action) => action.payload,
        removeUserFromFeed: (state, action) => {
            if(!action.payload) return null;
            const newFeed = state.filter(user => user._id !== action.payload);
            return newFeed;
        }
    }
})

export const { addFeed, removeUserFromFeed } = FeedSlice.actions;
export default FeedSlice.reducer;