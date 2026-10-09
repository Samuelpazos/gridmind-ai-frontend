import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, LockKeyhole, Zap } from 'lucide-react';
import { getCsrfToken, login, registerAccount } from '../services/api';

export default function AuthPage({ onAuthenticated, connectionError }) {
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === 'register';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (registering && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await getCsrfToken();
      if (registering) {
        await registerAccount({ displayName, email, password });
      }
      const response = await login({ email, password });
      onAuthenticated(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'No se pudo completar el acceso.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(registering ? 'login' : 'register');
    setError('');
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="brand-mark"><Zap size={20} fill="currentColor" /></span>
          <span className="brand-text"><strong>gridmind<span>AI</span></strong><small>ENERGY MONITORING</small></span>
        </div>
        <div className="auth-heading">
          <span className="auth-icon"><LockKeyhole size={19} /></span>
          <span className="eyebrow">CENTRO DE CONTROL</span>
          <h1 id="auth-title">{registering ? 'Crea tu cuenta' : 'Inicia sesión'}</h1>
          <p>{registering ? 'Regístrate para acceder al monitoreo de la red.' : 'Accede de forma segura a GridMind AI.'}</p>
        </div>

        {(connectionError || error) && (
          <div className="auth-error" role="alert"><AlertCircle size={17} /><span>{error || connectionError}</span></div>
        )}

        <form className="auth-form" onSubmit={submit}>
          {registering && (
            <label className="auth-field">Nombre
              <input autoComplete="name" maxLength="100" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Tu nombre" />
