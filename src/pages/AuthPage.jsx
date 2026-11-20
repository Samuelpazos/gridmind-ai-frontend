import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, LockKeyhole, Zap } from 'lucide-react';
import { getCsrfToken, login, registerAccount } from '../services/api';

const demoEmail = import.meta.env.VITE_DEMO_LOGIN_EMAIL ?? '';
const demoPassword = import.meta.env.VITE_DEMO_LOGIN_PASSWORD ?? '';
const demoLoginEnabled = Boolean(demoEmail && demoPassword);

const setEmailValidationMessage = (event) => {
  const input = event.currentTarget;
  input.setCustomValidity(
    input.validity.valueMissing
      ? 'Introduce tu correo electrónico.'
      : 'Introduce una dirección de correo electrónico válida.'
  );
};

const clearValidationMessage = (event) => {
  event.currentTarget.setCustomValidity('');
};

const getAuthenticationErrorMessage = (requestError) => (
  requestError.response?.data?.message
    || (requestError.message === 'Network Error'
      ? 'No se pudo conectar con el backend. Comprueba que el servicio esté iniciado.'
      : requestError.message)
    || 'No se pudo completar el acceso.'
);

export default function AuthPage({ onAuthenticated, connectionError }) {
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(demoLoginEnabled ? demoEmail : '');
  const [password, setPassword] = useState(demoLoginEnabled ? demoPassword : '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(demoLoginEnabled);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
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
      setError(getAuthenticationErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    const useDemo = nextMode === 'login' && demoLoginEnabled && !email;
    if (useDemo) setEmail(demoEmail);
    if (nextMode === 'register' && demoLoginEnabled && email === demoEmail) setEmail('');
    setPassword(useDemo ? demoPassword : '');
    setConfirmPassword('');
    setPasswordVisible(useDemo);
    setConfirmPasswordVisible(false);
    setError('');
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="brand-mark"><Zap size={20} fill="currentColor" /></span>
          <span className="brand-text"><strong>gridmind<span>AI</span></strong><small>MONITOREO ENERGÉTICO</small></span>
        </div>
        <div className="auth-heading">
          <span className="auth-icon"><LockKeyhole size={19} /></span>
          <span className="eyebrow">CENTRO DE CONTROL</span>
          <h1 id="auth-title">{registering ? 'Crea tu cuenta' : 'Inicia sesión'}</h1>
          <p>{registering ? 'Crea tu espacio privado para monitorear y simular transformadores.' : 'Accede a tu inventario de GridMind AI.'}</p>
        </div>

        {(connectionError || error) && (
          <div className="auth-error" role="alert"><AlertCircle size={17} /><span>{error || connectionError}</span></div>
        )}

        <form className="auth-form" name={registering ? 'registro' : 'inicio-sesion'} autoComplete="on" onSubmit={submit}>
          {registering && (
            <label className="auth-field">Nombre
              <input id="display-name" name="name" autoComplete="name" maxLength="12" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Máximo 12 caracteres" />
            </label>
          )}
          <label className="auth-field">Correo electrónico
            <input id="email" name="username" autoComplete={registering ? 'email' : 'username'} type="email" maxLength="254" required value={email} onChange={(event) => setEmail(event.target.value)} onInvalid={setEmailValidationMessage} onInput={clearValidationMessage} placeholder="nombre@correo.com" />
          </label>
          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <span className="password-input-wrap">
              <input id="password" name="password" autoComplete={registering ? 'new-password' : 'current-password'} type={passwordVisible ? 'text' : 'password'} minLength={registering ? 12 : undefined} maxLength="72" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={registering ? 'Mínimo 12 caracteres' : 'Tu contraseña'} />
              <button className="password-visibility" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={passwordVisible} title={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </div>
          {registering && (
            <>
              <div className="auth-field">
                <label htmlFor="confirm-password">Confirma la contraseña</label>
                <span className="password-input-wrap">
                  <input id="confirm-password" name="confirm-password" autoComplete="new-password" type={confirmPasswordVisible ? 'text' : 'password'} maxLength="72" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Escribe nuevamente tu contraseña" />
                  <button className="password-visibility" type="button" onClick={() => setConfirmPasswordVisible((visible) => !visible)} aria-label={confirmPasswordVisible ? 'Ocultar contraseña de confirmación' : 'Mostrar contraseña de confirmación'} aria-pressed={confirmPasswordVisible} title={confirmPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {confirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </div>
              <p className="auth-role-note">Empiezas con un inventario vacío. Puedes agregar tus equipos o cargar un ejemplo.</p>
            </>
          )}
          <button className="button button-primary button-wide auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Procesando…' : registering ? 'Crear cuenta y entrar' : 'Entrar a GridMind'}
          </button>
        </form>

        <p className="auth-switch">
          {registering ? '¿Ya tienes una cuenta?' : '¿Primera vez en GridMind?'}{' '}
          <button type="button" disabled={submitting} onClick={() => switchMode(registering ? 'login' : 'register')}>
            {registering ? 'Inicia sesión' : 'Crear cuenta'}
          </button>
        </p>
        <p className="auth-security-note">Las contraseñas se protegen con hash BCrypt y el acceso usa una sesión segura.</p>
      </section>
    </main>
  );
}
