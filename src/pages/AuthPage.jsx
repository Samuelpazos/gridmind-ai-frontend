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
            </label>
          )}
          <label className="auth-field">Correo electrónico
            <input autoComplete="email" type="email" maxLength="254" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@correo.com" />
          </label>
          <label className="auth-field">Contraseña
            <span className="password-input-wrap">
              <input autoComplete={registering ? 'new-password' : 'current-password'} type={passwordVisible ? 'text' : 'password'} minLength={registering ? 12 : undefined} maxLength="72" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={registering ? 'Mínimo 12 caracteres' : 'Tu contraseña'} />
              <button type="button" className="password-visibility" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </span>
          </label>
          {registering && (
            <>
              <label className="auth-field">Confirma la contraseña
                <input autoComplete="new-password" type={passwordVisible ? 'text' : 'password'} maxLength="72" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Escribe nuevamente tu contraseña" />
              </label>
              <p className="auth-role-note">La primera cuenta será administradora. Las cuentas siguientes tendrán rol de operador.</p>
            </>
          )}
          <button className="button button-primary button-wide auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Procesando…' : registering ? 'Crear cuenta y entrar' : 'Entrar a GridMind'}
          </button>
        </form>

        <p className="auth-switch">
          {registering ? '¿Ya tienes una cuenta?' : '¿Primera vez en GridMind?'}{' '}
          <button type="button" onClick={switchMode}>{registering ? 'Inicia sesión' : 'Crear cuenta'}</button>
        </p>
        <p className="auth-security-note">Las contraseñas se almacenan cifradas y el acceso usa una sesión segura.</p>
      </section>
    </main>
  );
}
