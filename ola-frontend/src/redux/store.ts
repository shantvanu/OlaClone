import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import bookingReducer from "./bookingSlice";
import driverReducer from "./driverSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    booking: bookingReducer,
    driver: driverReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
