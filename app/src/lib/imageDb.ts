const DB_NAME = 'guest-store-images';
const STORE  = 'blobs';
const VER    = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VER);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Store a File/Blob and return an `idb://<uuid>` reference string. */
export async function storeImage(blob: Blob): Promise<string> {
  const db  = await open();
  const key = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
  db.close();
  return `idb://${key}`;
}

/** Store a video blob and return an `idbv://<uuid>` reference. */
export async function storeVideo(blob: Blob): Promise<string> {
  const db  = await open();
  const key = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
  db.close();
  return `idbv://${key}`;
}

export const isIdbVideo = (src: string) => src.startsWith('idbv://');

export const isVideoSrc = (src: string) =>
  src.startsWith('idbv://') || /\.(mp4|webm|mov|ogg|ogv)(\?|#|$)/i.test(src);

/** Resolve an `idb://<uuid>` reference to a temporary object URL. Caller must revoke it. */
export async function resolveIdb(ref: string): Promise<string | null> {
  if (!ref.startsWith('idb://') && !ref.startsWith('idbv://')) return ref;          // plain URL — return as-is
  const key = ref.startsWith('idbv://') ? ref.slice(7) : ref.slice(6);
  const db  = await open();
  return new Promise((resolve) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => {
      db.close();
      resolve(req.result ? URL.createObjectURL(req.result as Blob) : null);
    };
    req.onerror = () => { db.close(); resolve(null); };
  });
}

/** Get the raw Blob for an idb:// or idbv:// ref (used for cloud migration). */
export async function getBlob(ref: string): Promise<Blob | null> {
  if (!ref.startsWith('idb://') && !ref.startsWith('idbv://')) return null;
  const key = ref.startsWith('idbv://') ? ref.slice(7) : ref.slice(6);
  const db  = await open();
  return new Promise((resolve) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => { db.close(); resolve(req.result ?? null); };
    req.onerror   = () => { db.close(); resolve(null); };
  });
}

/** Delete a stored blob (call when removing an image from a product). */
export async function deleteIdb(ref: string): Promise<void> {
  if (!ref.startsWith('idb://')) return;
  const key = ref.slice(6);
  const db  = await open();
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror    = () => { db.close(); resolve(); };
  });
}

export const isIdb = (src: string) => src.startsWith('idb://');
