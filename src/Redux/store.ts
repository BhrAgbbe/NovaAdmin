import {
  combineReducers,
  configureStore,
  createAction,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";
import type { Locale } from "@/Utils/format";
import { readPreference, type Mode } from "@/Storage/preferences";

interface Created<T> {
  readonly key: string;
  readonly item: T;
}

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
  initialState: { authenticated: false },
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

const initialRecords: { products: Created<Product>[]; users: Created<User>[] } = {
  products: [],
  users: [],
};
const records = createSlice({
  name: "records",
  initialState: initialRecords,
  reducers: {
    productCreated(state, action: PayloadAction<Created<Product>>) {
      state.products.unshift(action.payload);
    },
    userCreated(state, action: PayloadAction<Created<User>>) {
      state.users.unshift(action.payload);
    },
  },
  extraReducers: (builder) => builder.addCase(signedOut, () => initialRecords),
});

const reducer = combineReducers({
  preferences: preferences.reducer,
  session: session.reducer,
  records: records.reducer,
});
export const store = configureStore({ reducer });
export const { setLocale, setMode } = preferences.actions;
export const { signedIn } = session.actions;
export const { productCreated, userCreated } = records.actions;
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppSelector = useSelector.withTypes<ReturnType<typeof store.getState>>();
