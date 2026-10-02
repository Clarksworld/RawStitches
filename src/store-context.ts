import { createContext, type Dispatch } from 'react';
import type { State, Action } from './store';

// Keep context identity stable when Fast Refresh re-evaluates the store's components.
export const StoreContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);
