import { createSlice } from "@reduxjs/toolkit";

const FeedSlice = createSlice({
    name: 'feed',
    initialState: [] as any[],
    reducers: {
        addFeed: (_, action) => action.payload,
        removeUserFromFeed: (state, action) => {
            if(!action.payload) return [];
            const newFeed = state.filter(user => user._id !== action.payload);
            return newFeed;
        },
        clearFeed: () => [],
    }
})

export const { addFeed, removeUserFromFeed, clearFeed } = FeedSlice.actions;
export default FeedSlice.reducer;