import { Cart } from "@/types/ourApiSepecifc/Cart";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { cart: Cart | null; isGettingCartData: boolean } = {
  cart: null,
  isGettingCartData: false,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    updateCart: (state, action: PayloadAction<Cart | null>) => {
      state.cart = action.payload;
    },
    setIsGettingCartData: (state, action: PayloadAction<boolean>) => {
      state.isGettingCartData = action.payload;
    },
  },
});

export const { updateCart, setIsGettingCartData } = authSlice.actions;

export default authSlice.reducer;
