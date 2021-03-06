import { applyMiddleware, createStore, Store } from 'redux'
import { AppState, middlewares, rootReducer, storage } from './index'
import { broadcastMessage, getBgcPage, MessageType } from '../extension'
import isEqual = require("lodash/isEqual");
import cloneDeep = require("lodash/cloneDeep");

var appState: AppState = {};

interface AppStore extends Store<AppState> {
}

export var store: AppStore;
export * from './storage';

export function getStore(): Promise<AppStore> {
  return storage.sync.get().then(initState => {
    store = createStore(rootReducer, initState || {}, applyMiddleware(...middlewares));
    appState = cloneDeep(store.getState());
    getBgcPage().then(bgcPage => {
      if (window !== bgcPage) store.subscribe(syncState);
    });
    return store;
  });
}

function syncState() {
  var state = store.getState();
  if (!isEqual(appState, state)) {
    appState = cloneDeep(state);
    broadcastMessage({
      type: MessageType.APP_STATE,
      payload: appState
    });
  }
}