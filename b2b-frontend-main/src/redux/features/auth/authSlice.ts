import { AuthEntity } from "@/types/global/AuthEntity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthEntityWithAccessToken = AuthEntity & { accessToken: string };

const initialState: { authEntity: AuthEntityWithAccessToken | null } = {
  authEntity: null,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthEntityWithAccessToken>) => {
      state.authEntity = { ...action.payload };
    },
    updateUser: (state, action: PayloadAction<AuthEntity>) => {
      const currentAccessToken = state.authEntity?.accessToken || "";
      const newAuthEntity = action.payload;
      state.authEntity = { ...newAuthEntity, accessToken: currentAccessToken };
    },
    logout: () => initialState,
  },
});

export const { login, updateUser, logout } = authSlice.actions;

export default authSlice.reducer;
