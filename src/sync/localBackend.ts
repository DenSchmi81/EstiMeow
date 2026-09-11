import { randomId } from '../util';
import type { Backend } from './backend';

// Testmodus ohne Server: Daten liegen im localStorage, Tabs benachrichtigen sich per BroadcastChannel.

type Tree = { [key: string]: unknown };

const STORAGE_KEY = 'sr-local-db';

const segments = (path: string) => path.split('/').filter(Boolean);
const isTree = (value: unknown): value is Tree =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function readTree(): Tree {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return isTree(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getAt(tree: Tree, path: string[]): unknown {
  let node: unknown = tree;
  for (const key of path) {
    if (typeof node !== 'object' || node === null) return null;
    node = (node as Tree)[key];
  }
  return node ?? null;
}

function setAt(tree: Tree, path: string[], value: unknown) {
  let node = tree;
  for (const key of path.slice(0, -1)) {
    if (!isTree(node[key])) node[key] = {};
    node = node[key] as Tree;
  }
  const last = path[path.length - 1];
  if (last === undefined) return;
  if (value === null || value === undefined) delete node[last];
  else node[last] = JSON.parse(JSON.stringify(value));
}

export function createLocalBackend(): Backend {
  const channel = new BroadcastChannel(STORAGE_KEY);
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  channel.onmessage = notify;

  function write(mutate: (tree: Tree) => void) {
    const tree = readTree();
    mutate(tree);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
    channel.postMessage('changed');
    notify();
  }

  const disconnectPaths = new Set<string>();
  window.addEventListener('pagehide', () => {
    if (disconnectPaths.size === 0) return;
    write((tree) => disconnectPaths.forEach((path) => setAt(tree, segments(path), null)));
  });

  return {
    mode: 'local',
    async signIn() {
      // Pro Tab eine eigene ID, damit man mit mehreren Tabs mehrere Spieler simulieren kann.
      let uid = sessionStorage.getItem('sr-local-uid');
      if (!uid) {
        uid = randomId(20);
        sessionStorage.setItem('sr-local-uid', uid);
      }
      return uid;
    },
    onValue(path, cb) {
      let active = true;
      let last: string | undefined;
      const run = () => {
        if (!active) return;
        const json = JSON.stringify(getAt(readTree(), segments(path)));
        if (json === last) return;
        last = json;
        cb(JSON.parse(json));
      };
      listeners.add(run);
      queueMicrotask(run);
      return () => {
        active = false;
        listeners.delete(run);
      };
    },
    async update(path, values) {
      write((tree) => {
        for (const [key, value] of Object.entries(values)) {
          setAt(tree, [...segments(path), ...segments(key)], value);
        }
      });
    },
    async push(path, value) {
      const id = `${Date.now().toString(36)}${randomId(6)}`;
      write((tree) => setAt(tree, [...segments(path), id], value));
      return id;
    },
    async remove(path) {
      write((tree) => setAt(tree, segments(path), null));
    },
    onConnected(path, cb) {
      let active = true;
      disconnectPaths.add(path);
      queueMicrotask(() => {
        if (active) cb();
      });
      return () => {
        active = false;
        disconnectPaths.delete(path);
      };
    },
    serverNow: () => Date.now(),
    serverTimestamp: () => Date.now(),
  };
}
