import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar el menú
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

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="menu-icon" onClick={toggleMenu}>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
      </div>
      <ul className={`navBar ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
        {user ? (
          <>
            <li><Link to="/upload" onClick={closeMenu}>Subir Producto</Link></li>
            <li><Link to="/read" onClick={closeMenu}>Leer Productos</Link></li>
            <li><Link to="/edit" onClick={closeMenu}>Editar Producto</Link></li>
            <li><button onClick={handleLogout} className="logout-button">Cerrar Sesión</button></li>
          </>
        ) : null}
        {menuOpen && <li><button className="close-menu" onClick={closeMenu}>✖</button></li>}
      </ul>
    </nav>
  );
};

export default Navbar;
