import { dictionaryMockup } from "@/localization/config/dictionaryMockup";
import { Dictionary } from "@/types/global/Dictionary";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { dictionary: Dictionary } = {
  dictionary: dictionaryMockup,
};

const dictionarySlice = createSlice({
  name: "dictionarySlice",
  initialState,
  reducers: {
    updateDictionary: (state, action: PayloadAction<Dictionary>) => {
      const dictionary = action.payload;
      state.dictionary = { ...dictionary };
    },
  },
});

export const { updateDictionary } = dictionarySlice.actions;

export default dictionarySlice.reducer;
