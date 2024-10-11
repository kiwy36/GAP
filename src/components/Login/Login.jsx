import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../../services/firebase.js';
import Swal from 'sweetalert2'; // Librería para mostrar alertas interactivas
import './Login.css'

const Login = () => {
  // Estados para almacenar el email, la contraseña y posibles errores
  const [email, setEmail] = useState(''); // Estado para almacenar el email del usuario
  const [password, setPassword] = useState(''); // Estado para almacenar la contraseña del usuario
  const [error, setError] = useState(''); // Estado para almacenar errores de inicio de sesión

  // Función que maneja el proceso de inicio de sesión
  const handleLogin = async () => {
    // Validación: si el email o la contraseña están vacíos, muestra un error
    if (!email || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setError(''); // Limpia el mensaje de error previo

    try {
      // Llamada a Firebase para autenticar al usuario con email y contraseña
      await signInWithEmailAndPassword(auth, email, password);
      
      // Muestra una alerta de éxito si la autenticación es correcta
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Usuario autenticado exitosamente",
        icon: "success"
      });
    } catch (error) {
      // Si ocurre un error, se captura y se muestra un mensaje de error
      console.error('Error en el inicio de sesión:', error);
      setError('Error en el inicio de sesión: ' + error.message);
    }
  };

  // Renderiza la interfaz de usuario para el formulario de inicio de sesión
  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      {/* Campo de entrada para el email */}
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className="input-field"
      />
      {/* Campo de entrada para la contraseña */}
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="input-field"
      />
      {/* Muestra un mensaje de error si existe */}
      {error && <p className="error-message">{error}</p>}
      {/* Botón para iniciar sesión */}
      <button onClick={handleLogin} className="login-button">Iniciar Sesión</button>
    </div>
  );
};

export default Login;
