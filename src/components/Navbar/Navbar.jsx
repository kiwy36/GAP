import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="navbar">
      <ul className="navBar">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/upload">Subir Producto</Link>
            </li>
            <li>
              <Link to="/read">Leer Productos</Link>
            </li>
            <li>
              <Link to="/edit">Editar Producto</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
};

export default Navbar;
