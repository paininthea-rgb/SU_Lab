'use client';

import { useEffect } from 'react';
import Image from 'next/image';
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
    <div className="login-shell relative isolate min-h-screen overflow-hidden px-6 py-8 text-white">
      <div className="login-orb top-20 left-[8%] h-48 w-48 bg-cyan-400/25" />
      <div className="login-orb login-orb--reverse right-[10%] bottom-24 h-72 w-72 bg-fuchsia-500/20" />
      <div className="login-orb left-[48%] bottom-[12%] h-32 w-32 bg-blue-500/20" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold shadow-lg shadow-slate-950/30 backdrop-blur-md transition hover:bg-white/15"
            title={t.languageLabel}
            aria-label={t.languageLabel}
          >
            <Image
              src={lang === 'en' ? '/flag-vietnam.svg' : '/flag-england.svg'}
              alt={lang === 'en' ? 'Vietnamese' : 'English'}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span>{lang === 'en' ? 'VI' : 'EN'}</span>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 shadow-2xl shadow-slate-950/50 backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
            <div className="login-panel-pattern relative flex flex-col justify-between gap-10 border-b border-white/10 p-8 sm:p-10 lg:border-r lg:border-b-0 lg:p-12">
              <div className="inline-flex w-fit items-center gap-3 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
                {t.heroBadge}
              </div>

              <div className="space-y-5">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t.title}</h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t.heroDescription}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <p className="mb-2 text-sm font-semibold text-cyan-200">{t.featureSyncTitle}</p>
                  <p className="text-sm leading-6 text-slate-300">{t.featureSyncBody}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <p className="mb-2 text-sm font-semibold text-fuchsia-200">{t.featureToolsTitle}</p>
                  <p className="text-sm leading-6 text-slate-300">{t.featureToolsBody}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <p className="mb-2 text-sm font-semibold text-blue-200">{t.featureFlowTitle}</p>
                  <p className="text-sm leading-6 text-slate-300">{t.featureFlowBody}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <p className="mb-2 text-sm font-semibold text-emerald-200">{t.featureAuthTitle}</p>
                  <p className="text-sm leading-6 text-slate-300">{t.featureAuthBody}</p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center p-6 sm:p-10">
              <div className="w-full rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-8 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-md sm:p-10">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-200/80">{t.secureAccess}</p>
                <h2 className="text-3xl font-semibold text-white">{t.authTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{t.authDescription}</p>

                <div className="mt-8 rounded-3xl border border-white/8 bg-white/5 p-5">
                  <p className="text-sm leading-6 text-slate-300">{t.signInRequired}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void signInWithGoogle()}
                  className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t.login}
                </button>

                <p className="mt-4 text-center text-xs tracking-[0.2em] text-slate-500 uppercase">{t.providerLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
