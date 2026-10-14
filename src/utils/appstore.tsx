import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./FeedSlice";

const appStore = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
    }
});

// Get the type of the complete Redux state
export type RootState = ReturnType<typeof appStore.getState>;

export default appStore;