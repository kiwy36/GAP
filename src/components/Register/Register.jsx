import { useState } from 'react'; // Hook para manejar el estado local
import { auth, createUserWithEmailAndPassword } from '../../services/firebase.js'; // Importa la autenticación de Firebase
import './Register.css';
import Swal from 'sweetalert2'; // Librería para mostrar alertas

const Register = () => {
  // Estados para almacenar los valores del formulario y posibles errores
  const [email, setEmail] = useState(''); // Estado para almacenar el email del usuario
  const [password, setPassword] = useState(''); // Estado para almacenar la contraseña del usuario
  const [confirmPassword, setConfirmPassword] = useState(''); // Estado para almacenar la confirmación de contraseña
  const [error, setError] = useState(''); // Estado para manejar mensajes de error

  // Función para validar la contraseña con un regex
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // La contraseña debe tener al menos 8 caracteres, incluyendo letras y números
    return regex.test(password); // Retorna true si la contraseña es válida
  };

  // Función para manejar el proceso de registro
  const handleRegister = async () => {
    // Verifica si las contraseñas coinciden
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden'); // Muestra un error si no coinciden
      return;
    }

    // Valida que la contraseña cumpla con los requisitos de seguridad
    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números');
      return;
    }

    setError(''); // Limpia el mensaje de error previo

    try {
      // Llama a Firebase para crear un nuevo usuario con el email y la contraseña proporcionados
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Muestra una alerta de éxito si el registro es exitoso
      Swal.fire({
        title: "¡Buen trabajo!",
        text: "Usuario registrado exitosamente",
        icon: "success"
      });
    } catch (error) {
      // Captura y muestra cualquier error durante el proceso de registro
      console.error('Error en el registro:', error);
      setError('Error en el registro: ' + error.message);
    }
  };

  // Renderiza el formulario de registro
  return (
    <div className="register-container">
      <h2>Registrar</h2>
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
      {/* Campo de entrada para confirmar la contraseña */}
      <input
        type="password"
        placeholder="Repetir Contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="input-field"
      />
      {/* Muestra un mensaje de error si existe */}
      {error && <p className="error-message">{error}</p>}
      {/* Botón para registrar al usuario */}
      <button onClick={handleRegister} className="register-button">Registrar</button>
    </div>
  );
};

export default Register;
