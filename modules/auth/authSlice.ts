import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "./auth.types";

interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
  expired: boolean;
}
const initialState: AuthState = { user: null, initialized: false, expired: false };
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.initialized = true;
      state.expired = false;
    },
    clearSession: (state) => {
      state.user = null;
      state.initialized = true;
      state.expired = true;
    },
  },
});
export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
