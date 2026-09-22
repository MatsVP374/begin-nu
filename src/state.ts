import { load, save } from './storage';
import type { Store } from './types';

type Listener = (store: Store) => void;

let store: Store = load();
const listeners = new Set<Listener>();

export function getStore(): Store {
  return store;
}

/** Past de store aan, slaat op en meldt alle abonnees. */
export function updateStore(updater: (store: Store) => Store): Store {
  store = updater(store);
  save(store);
  listeners.forEach((listener) => listener(store));
  return store;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
