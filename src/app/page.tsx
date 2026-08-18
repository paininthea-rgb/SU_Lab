'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';

export default function Home() {
  // const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState('');
  // const [submitting, setSubmitting] = useState(false);

  // useEffect(() => {
  //   if (!loading && user) {
  //     router.replace('/sketch');
  //   }
  // }, [loading, router, user]);

  // if (loading) {
  //   return (
  //     <div style={{ background: '#080710' }} className="flex min-h-screen items-center justify-center text-white">
  //       {t.loading}
  //     </div>
  //   );
  // }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // setError('');
    // setSubmitting(true);
    // try {
    //   await signInWithEmail(email, password);
    // } catch {
    //   setError(t.loginError);
    // } finally {
    //   setSubmitting(false);
    // }
    router.push('/sketch');
  };

  const handleGoogleLogin = () => {
    // setError('');
    // try {
    //   await signInWithGoogle();
    // } catch {
    //   setError(t.loginError);
    // }
    router.push('/sketch');
  };

  return (
    <div
      className="relative min-h-screen"
      style={{ background: '#080710' }}
    >
      {/* Language toggle */}
      <button
        type="button"
        onClick={toggleLang}
        className="absolute top-4 right-4 z-20 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-2xl transition hover:bg-white/10"
        title="Toggle Language"
      >
        {lang === 'en' ? '🇻🇳' : 'ENG'}
      </button>

      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 430,
          height: 520,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background: 'linear-gradient(#1845ad, #23a2f6)',
            left: -80,
            top: -80,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background: 'linear-gradient(to right, #ff512f, #f09819)',
            right: -30,
            bottom: -80,
          }}
        />
      </div>

      {/* Glass form */}
      <form
        onSubmit={handleEmailLogin}
        className="absolute"
        style={{
          width: 400,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.13)',
          borderRadius: 10,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 40px rgba(8,7,16,0.6)',
          padding: '50px 35px',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h3
          className="text-center"
          style={{ fontSize: 32, fontWeight: 500, lineHeight: '42px', color: '#fff' }}
        >
          {t.title}
        </h3>

        {/* Email */}
        <label
          htmlFor="email"
          style={{ display: 'block', marginTop: 30, fontSize: 16, fontWeight: 500, color: '#fff' }}
        >
          {t.emailPlaceholder}
        </label>
        <input
          id="email"
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            display: 'block',
            height: 50,
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 3,
            padding: '0 10px',
            marginTop: 8,
            fontSize: 14,
            fontWeight: 300,
            color: '#fff',
            border: 'none',
            outline: 'none',
          }}
        />

        {/* Password */}
        <label
          htmlFor="password"
          style={{ display: 'block', marginTop: 30, fontSize: 16, fontWeight: 500, color: '#fff' }}
        >
          {t.passwordPlaceholder}
        </label>
        <input
          id="password"
          type="password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            display: 'block',
            height: 50,
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 3,
            padding: '0 10px',
            marginTop: 8,
            fontSize: 14,
            fontWeight: 300,
            color: '#fff',
            border: 'none',
            outline: 'none',
          }}
        />

        {/* Log In button */}
        <button
          type="submit"
          style={{
            marginTop: 50,
            width: '100%',
            background: '#ffffff',
            color: '#080710',
            padding: '15px 0',
            fontSize: 18,
            fontWeight: 600,
            borderRadius: 5,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          {t.loginButton}
        </button>

        {/* Social */}
        <p style={{ color: '#fff', textAlign: 'center', marginTop: 24, fontSize: 13, opacity: 0.7 }}>
          {t.orSignIn}
        </p>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              borderRadius: 3,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.27)',
              color: '#eaf0fb',
              border: 'none',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500,
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.47)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.27)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>
      </form>
    </div>
  );
}
