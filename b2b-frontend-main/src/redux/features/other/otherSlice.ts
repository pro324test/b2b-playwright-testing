import { OtherSlice } from "@/types/global/OtherSlice";
import { createSlice } from "@reduxjs/toolkit";

const initialState: OtherSlice = {
  pageKey: 0,
};

const otherSlice = createSlice({
  name: "otherSlice",
  initialState,
  reducers: {
    refreshPageKey: (state) => {
      state.pageKey = Math.random();
    },
  },
});

export const { refreshPageKey } = otherSlice.actions;

export default otherSlice.reducer;
