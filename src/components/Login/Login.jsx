// src/components/Login.js
import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Usuario autenticado exitosamente",
        icon: "success"
      });
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      setError('Error en el inicio de sesión: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className="input-field"
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="input-field"
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleLogin} className="login-button">Iniciar Sesión</button>
    </div>
  );
};

export default Login;