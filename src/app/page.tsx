'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/sketch');
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.09)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="pointer-events-none absolute -top-12 left-[10%] h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-[15%] h-60 w-60 rounded-full bg-purple-500/30 blur-3xl" />

      <button
        type="button"
        onClick={toggleLang}
        className="absolute top-4 right-4 z-10 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-2xl transition hover:bg-white/10"
        title="Toggle Language"
      >
        {lang === 'en' ? '🇻🇳' : '🇬🇧'}
      </button>

      <div className="relative z-10 mx-2 w-full max-w-6xl rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl sm:mx-4">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="border-b border-white/10 p-8 sm:p-10 lg:border-r lg:border-b-0 lg:p-12">
            <span className="ml-1 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1 text-sm font-semibold text-cyan-200">
              {t.workspaceBadge}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">{t.subtitle}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-slate-800/45 p-5">
                <h2 className="font-semibold text-cyan-200">{t.featureRealtimeTitle}</h2>
                <p className="mt-2 text-sm text-slate-300">{t.featureRealtimeDesc}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-slate-800/45 p-5">
                <h2 className="font-semibold text-violet-200">{t.featurePrecisionTitle}</h2>
                <p className="mt-2 text-sm text-slate-300">{t.featurePrecisionDesc}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-slate-800/45 p-5">
                <h2 className="font-semibold text-blue-200">{t.featureFocusTitle}</h2>
                <p className="mt-2 text-sm text-slate-300">{t.featureFocusDesc}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-slate-800/45 p-5">
                <h2 className="font-semibold text-emerald-200">{t.featureEntryTitle}</h2>
                <p className="mt-2 text-sm text-slate-300">{t.featureEntryDesc}</p>
              </article>
            </div>
          </section>

          <section className="flex items-center p-8 sm:p-10 lg:p-12">
            <div className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-7 shadow-xl shadow-slate-950/50">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{t.secureAccess}</p>
              <h2 className="mt-2 text-4xl font-bold text-white">{t.startSession}</h2>
              <p className="mt-3 text-slate-300">{t.continueWithGoogle}</p>

              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="mt-6 mx-auto inline-flex min-w-[220px] items-center justify-center gap-3 rounded-xl bg-white px-5 py-2.5 text-base font-semibold text-gray-800 transition hover:bg-gray-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t.login}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
