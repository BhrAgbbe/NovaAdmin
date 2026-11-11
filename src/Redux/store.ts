import {
  combineReducers,
  configureStore,
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { EMPTY_RECORDS, readRecords, type Records } from "@/Storage/records";
import { getSession } from "@/Storage/session";
import type { Locale } from "@/Utils/format";
import { readPreference, type Mode } from "@/Storage/preferences";

export const signedOut = createAction("session/signedOut");

const preferences = createSlice({
  name: "preferences",
  initialState: { locale: readPreference("locale"), mode: readPreference("theme") },
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
    setMode(state, action: PayloadAction<Mode>) {
      state.mode = action.payload;
    },
  },
});

const session = createSlice({
  name: "session",
  initialState: { authenticated: !!getSession() },
  reducers: {
    signedIn(state) {
      state.authenticated = true;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(signedOut, (state) => {
      state.authenticated = false;
    }),
});

const records = createSlice({
  name: "records",
  initialState: readRecords(),
  reducers: {
    recordsChanged: (_, action: PayloadAction<Records>) => action.payload,
  },
  extraReducers: (builder) => builder.addCase(signedOut, () => EMPTY_RECORDS),
});

const reducer = combineReducers({
  preferences: preferences.reducer,
  session: session.reducer,
  records: records.reducer,
});
export const store = configureStore({ reducer });
export const { setLocale, setMode } = preferences.actions;
export const { signedIn } = session.actions;
export const { recordsChanged } = records.actions;
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppSelector = useSelector.withTypes<ReturnType<typeof store.getState>>();
