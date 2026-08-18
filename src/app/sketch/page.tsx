'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { db, firebaseConfigured } from '@/lib/firebase';
import type { CanvasAction, SketchShape, Tool } from '@/types/sketch';

const SketchCanvas = dynamic(() => import('@/components/SketchCanvas'), { ssr: false });

const drawingTools: Tool[] = ['select', 'line', 'circle', 'rectangle', 'arc'];
const supportTools: Tool[] = ['move'];
const utilityActions: Array<Extract<CanvasAction, 'group' | 'pushPull' | 'offset' | 'mirror'>> = [
  'group',
  'pushPull',
  'offset',
  'mirror',
];

const toolIcons: Record<Tool | 'group' | 'pushPull' | 'offset' | 'mirror', string> = {
  select: '↖',
  line: '╱',
  circle: '○',
  rectangle: '□',
  arc: '⌒',
  move: '✥',
  group: '⊞',
  pushPull: '⬍',
  offset: '⊡',
  mirror: '⇔',
};

export default function SketchPage() {
  const { user, loading, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<SketchShape[]>([]);
  const [actionRequest, setActionRequest] = useState<{ id: number; type: CanvasAction } | null>(null);
  const [cloudState, setCloudState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hydrated, setHydrated] = useState(false);
  const actionIdRef = useRef(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, router, user]);

  useEffect(() => {
    let ignore = false;

    const loadSketch = async () => {
      if (!user) return;
      const firestore = db;
      if (!firebaseConfigured || !firestore) {
        if (!ignore) {
          setCloudState('error');
          setHydrated(true);
        }
        return;
      }
      try {
        const snapshot = await getDoc(doc(firestore, 'sketches', user.uid));
        if (!ignore && snapshot.exists()) {
          const data = snapshot.data() as { shapes?: SketchShape[] };
          setShapes(Array.isArray(data.shapes) ? data.shapes : []);
        }
      } catch {
        if (!ignore) {
          setCloudState('error');
        }
      } finally {
        if (!ignore) {
          setHydrated(true);
        }
      }
    };

    void loadSketch();

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    const firestore = db;
    if (!user || !hydrated || !firebaseConfigured || !firestore) return;

    const timeout = window.setTimeout(async () => {
      try {
        setCloudState('saving');
        await setDoc(
          doc(firestore, 'sketches', user.uid),
          {
            userId: user.uid,
            email: user.email ?? null,
            displayName: user.displayName ?? null,
            updatedAt: serverTimestamp(),
            shapes,
          },
          { merge: true },
        );
        setCloudState('saved');
      } catch {
        setCloudState('error');
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [hydrated, shapes, user]);

  const cloudLabel = useMemo(() => {
    if (cloudState === 'saving') return t.saving;
    if (cloudState === 'saved') return t.saved;
    if (cloudState === 'error') return t.saveError;
    return '';
  }, [cloudState, t]);

  const hint = useMemo(() => {
    const hintMap: Record<Tool, string> = {
      select: t.hint_select,
      line: t.hint_line,
      circle: t.hint_circle,
      rectangle: t.hint_rectangle,
      arc: t.hint_arc,
      move: t.hint_move,
    };
    return hintMap[activeTool];
  }, [activeTool, t]);

  const queueAction = (type: CanvasAction) => {
    actionIdRef.current += 1;
    setActionRequest({ id: actionIdRef.current, type });
  };

  const utilityLabels: Record<(typeof utilityActions)[number], string> = {
    group: t.group,
    pushPull: t.pushPull,
    offset: t.offset,
    mirror: t.mirror,
  };

  if (loading || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        {t.loading}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      <header className="z-10 flex items-center justify-between border-b border-white/10 bg-gray-900 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-blue-400">{t.title}</h1>
          <p className="text-xs text-gray-400">{t.welcome}, {user.displayName ?? user.email ?? 'User'}</p>
        </div>
        <div className="flex items-center gap-3">
          {cloudLabel ? <span className="text-xs text-gray-400">{cloudLabel}</span> : null}
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xl transition hover:bg-white/10"
            title="Toggle Language"
          >
            {lang === 'en' ? '🇻🇳' : '🇬🇧'}
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded bg-red-600 px-3 py-2 text-sm font-medium transition hover:bg-red-700"
          >
            {t.logout}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-20 flex-col items-center gap-2 overflow-y-auto border-r border-white/10 bg-gray-900 px-2 py-4">
          <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {t.drawingTools}
          </p>
          {drawingTools.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => setActiveTool(tool)}
              title={t[tool]}
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-lg transition ${
                activeTool === tool ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {toolIcons[tool]}
            </button>
          ))}

          <div className="my-2 h-px w-10 bg-white/10" />
          <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {t.supportTools}
          </p>
          {supportTools.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => setActiveTool(tool)}
              title={t[tool]}
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-lg transition ${
                activeTool === tool ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {toolIcons[tool]}
            </button>
          ))}

          {utilityActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => queueAction(action)}
              title={utilityLabels[action]}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-lg text-gray-300 transition hover:bg-white/10"
            >
              {toolIcons[action]}
            </button>
          ))}

          <div className="my-2 h-px w-10 bg-white/10" />
          <button
            type="button"
            onClick={() => queueAction('delete-selected')}
            className="w-full rounded-lg bg-amber-600 px-2 py-2 text-[11px] font-semibold transition hover:bg-amber-500"
          >
            {t.deleteSelected}
          </button>
          <button
            type="button"
            onClick={() => queueAction('clear-all')}
            className="w-full rounded-lg bg-red-700 px-2 py-2 text-[11px] font-semibold transition hover:bg-red-600"
          >
            {t.clearAll}
          </button>
        </aside>

        <main className="relative flex-1 overflow-hidden">
          <SketchCanvas
            activeTool={activeTool}
            shapes={shapes}
            actionRequest={actionRequest}
            onShapesChange={setShapes}
          />

          <div className="pointer-events-none absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-sm text-blue-300">
            {toolIcons[activeTool]} {t[activeTool]}
          </div>
          <div className="pointer-events-none absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-gray-300">
            {t.hint_orbit}
          </div>
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm text-gray-200">
            {hint}
          </div>
        </main>
      </div>
    </div>
  );
}
