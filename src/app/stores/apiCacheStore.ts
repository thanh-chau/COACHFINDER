import { createStore } from "zustand/vanilla";

type ApiCacheEntry<T = unknown> = {
  data: T;
  signature: string;
  updatedAt: number;
};

type ApiCacheState = {
  entries: Record<string, ApiCacheEntry>;
  getEntry: <T>(key: string) => ApiCacheEntry<T> | undefined;
  setEntry: <T>(key: string, entry: ApiCacheEntry<T>) => void;
  removeEntry: (key: string) => void;
  clear: () => void;
};

export const apiCacheStore = createStore<ApiCacheState>((set, get) => ({
  entries: {},
  getEntry: key => get().entries[key] as ApiCacheEntry | undefined,
  setEntry: (key, entry) =>
    set(state => ({
      entries: {
        ...state.entries,
        [key]: entry,
      },
    })),
  removeEntry: key =>
    set(state => {
      if (!state.entries[key]) return state;

      const { [key]: _removed, ...entries } = state.entries;
      return { entries };
    }),
  clear: () => set({ entries: {} }),
}));

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  return `{${keys
    .map(key => `${JSON.stringify(key)}:${stableSerialize(objectValue[key])}`)
    .join(",")}}`;
}

export function resolveCachedApiData<T>(key: string, nextData: T) {
  const signature = stableSerialize(nextData);
  const cached = apiCacheStore.getState().getEntry<T>(key);

  if (cached?.signature === signature) {
    return cached.data;
  }

  apiCacheStore.getState().setEntry(key, {
    data: nextData,
    signature,
    updatedAt: Date.now(),
  });

  return nextData;
}

export function clearApiCache() {
  apiCacheStore.getState().clear();
}
