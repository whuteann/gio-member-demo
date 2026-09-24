import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiSubscription, ApiUser } from "@/lib/api/types";

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
  subscription: ApiSubscription | null;
}

const initialState: AuthState = { token: null, refreshToken: null, user: null, subscription: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: ApiUser; subscription: ApiSubscription }>
    ) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.subscription = action.payload.subscription;
    },
    // Silent-refresh updates only the token pair — user/subscription are
    // untouched since a refresh never changes who's logged in.
    setTokens(state, action: PayloadAction<{ token: string; refreshToken: string }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    setUser(state, action: PayloadAction<ApiUser>) {
      state.user = action.payload;
    },
    setSubscription(state, action: PayloadAction<ApiSubscription>) {
      state.subscription = action.payload;
    },
    clearCredentials() {
      return initialState;
    },
  },
});

export const { setCredentials, setTokens, setUser, setSubscription, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
