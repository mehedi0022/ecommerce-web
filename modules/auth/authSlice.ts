import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "./auth.types";

interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
}
const initialState: AuthState = { user: null, initialized: false };
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.initialized = true;
    },
    clearSession: (state) => {
      state.user = null;
      state.initialized = true;
    },
  },
});
export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
