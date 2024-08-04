// src/components/Register.js
import { useState } from 'react';
import { auth, createUserWithEmailAndPassword } from '../../services/firebase.js';
import './Register.css'
import Swal from 'sweetalert2';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números');
      return;
    }

    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Swal.fire({
        title: "¡Buen trabajo!",
        text: "Usuario registrado exitosamente",
        icon: "success"
      });
    } catch (error) {
      console.error('Error en el registro:', error);
      setError('Error en el registro: ' + error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Registrar</h2>
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
      <input
        type="password"
        placeholder="Repetir Contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="input-field"
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleRegister} className="register-button">Registrar</button>
    </div>
  );
};

export default Register;
