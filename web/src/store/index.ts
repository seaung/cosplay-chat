import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./modules/users";
import chatReducer from "./modules/chat";

const store = configureStore({
    reducer: {
        user: userReducer,
        chat: chatReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store