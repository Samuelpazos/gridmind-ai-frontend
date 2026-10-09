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
