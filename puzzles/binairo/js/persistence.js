import { getJSON, setJSON, remove } from "../../../js/common/storage.js";

const KEY = "binairo:current";
const SCHEMA_VERSION = 1;

export function loadGame() {
  const data = getJSON(KEY);
  if (!data || data.version !== SCHEMA_VERSION) return null;
  return data;
}

export function saveGame(state) {
  setJSON(KEY, {
    ...state,
    version: SCHEMA_VERSION,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function clearGame() {
  remove(KEY);
}
