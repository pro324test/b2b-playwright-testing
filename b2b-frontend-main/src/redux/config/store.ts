import { configureStore } from "@reduxjs/toolkit";
import dictionarySlice from "@/redux/features/dictionary/dictionarySlice";
import authSlice from "@/redux/features/auth/authSlice";
import otherSlice from "@/redux/features/other/otherSlice";
import cartSlice from "@/redux/features/cart/cartSlice";

export const reduxStore = configureStore({
  reducer: {
    dictionarySlice,
    authSlice,
    otherSlice,
    cartSlice,
  },
});

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDisaptch = typeof reduxStore.dispatch;
