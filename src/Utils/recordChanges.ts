import { recordsChanged, store } from "@/Redux/store";
import { writeRecords, type RecordChange, type Records } from "@/Storage/records";
import { adminKeys, adminQueryClient } from "@/Utils/api/query";
import { getSession } from "@/Storage/session";

export function applyRecordChange<K extends keyof Records>(
  resource: K,
  change: Records[K][number]
) {
  const current = store.getState().records;
  const changes: readonly RecordChange<unknown>[] = current[resource];
  const index = changes.findIndex(({ key }) => key === change.key);
  const updated = changes.filter(({ key }) => key !== change.key);
  if (change.item || !change.key.startsWith("local:")) {
    updated.splice(index < 0 ? 0 : index, 0, change);
  }
  const next = { ...current, [resource]: updated };
  const persisted = writeRecords(next);
  store.dispatch(recordsChanged(next));
  void adminQueryClient.invalidateQueries({
    queryKey: adminKeys[resource],
    exact: false,
    refetchType: change.key.startsWith("api:") ? "active" : "none",
  });
  return persisted;
}

export async function saveRecord<T>(
  edit: { readonly key: string; readonly item: { readonly id: number } } | undefined,
  local: (id: number) => T,
  remote: (id?: number) => Promise<T>
) {
  const session = getSession();
  if (!session) throw new Error("Session expired");
  const id = edit?.item.id;
  const item = edit?.key.startsWith("local:") && id !== undefined ? local(id) : await remote(id);
  if (getSession() !== session) throw new Error("Session changed");
  return { item, key: edit?.key ?? "local:" + crypto.randomUUID() };
}
