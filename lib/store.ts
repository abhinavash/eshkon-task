"use client";

import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import undoable, { StateWithHistory, includeAction } from "redux-undo";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

export type BlockType = "hero" | "twoColumn" | "imageGrid";

export interface LayoutBlock {
  id: string;
  type: BlockType;
  entryId?: string;
  data?: any;
}

export interface LayoutState {
  blocks: LayoutBlock[];
  lastSavedAt?: number;
}

const initialState: LayoutState = {
  blocks: [],
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setBlocks(state, action: PayloadAction<LayoutBlock[]>) {
      state.blocks = action.payload;
    },
    addBlock(state, action: PayloadAction<LayoutBlock>) {
      state.blocks.push(action.payload);
    },
    updateBlock(state, action: PayloadAction<LayoutBlock>) {
      const index = state.blocks.findIndex(b => b.id === action.payload.id);
      if (index !== -1) state.blocks[index] = action.payload;
    },
    removeBlock(state, action: PayloadAction<string>) {
      state.blocks = state.blocks.filter(b => b.id !== action.payload);
    },
    reorderBlocks(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      const updated = [...state.blocks];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      state.blocks = updated;
    },
    markSaved(state) {
      state.lastSavedAt = Date.now();
    }
  }
});

export const { setBlocks, addBlock, updateBlock, removeBlock, reorderBlocks, markSaved } = layoutSlice.actions;

const autosaveMiddleware = (storeApi: any) => {
  let timeout: any;
  return (next: any) => (action: any) => {
    const result = next(action);
    const actionsToWatch = [setBlocks.type, addBlock.type, updateBlock.type, removeBlock.type, reorderBlocks.type];
    if (actionsToWatch.includes(action.type)) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        storeApi.dispatch(markSaved());
      }, 800);
    }
    return result;
  };
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["layout"],
};

const undoableLayoutReducer = undoable(layoutSlice.reducer, {
  filter: includeAction([
    setBlocks.type,
    addBlock.type,
    updateBlock.type,
    removeBlock.type,
    reorderBlocks.type,
  ]),
});

const rootReducer = (state: any, action: any) => ({
  layout: undoableLayoutReducer(state?.layout, action),
});

const persistedReducer = persistReducer(persistConfig as any, rootReducer as any);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(autosaveMiddleware as any),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState> & {
  layout: StateWithHistory<LayoutState>;
};
export type AppDispatch = typeof store.dispatch;
