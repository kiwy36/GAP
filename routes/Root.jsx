// Importamos los componentes necesarios de 'react-router-dom' para gestionar las rutas
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importamos los componentes que se usarán en las diferentes rutas de la aplicación
import Home from '../src/components/Home/Home';
import Footer from '../src/components/Footer/Footer';
import Navbar from '../src/components/Navbar/Navbar';
import UploadProduct from '../src/components/UploadProduct/UploadProduct';
import ReadProducts from '../src/components/ReadProducts/ReadProducts';
import Register from '../src/components/Register/Register';
import Login from '../src/components/Login/Login';
import Store from '../src/components/Store/Store';
import Statistics from '../src/components/Statistics/Statistics';

// Importamos los estilos globales que aplican a toda la aplicación
import './Root.css';

// Definimos el componente Root que maneja la estructura principal de la aplicación
function Root() {
    return (
      // El Router se encarga de manejar la navegación entre las diferentes rutas
      <Router>
        {/* El componente Navbar se renderiza en todas las rutas como cabecera */}
        <Navbar />
        {/* La etiqueta main contiene las rutas y los componentes asociados */}
        <main>
          <Routes>
            {/* Definimos las rutas específicas para cada componente */}
            <Route path="/" element={<Home />} /> {/* Ruta para la página principal */}
            <Route path="/upload" element={<UploadProduct />} /> {/* Ruta para subir productos */}
            <Route path="/read" element={<ReadProducts />} /> {/* Ruta para leer productos */}
            <Route path="/register" element={<Register />} /> {/* Ruta para registro de usuarios */}
            <Route path="/login" element={<Login />} /> {/* Ruta para iniciar sesión */}
            <Route path="/store" element={<Store />} /> {/* Ruta para la tienda */}
            <Route path="/statistics" element={<Statistics />} /> {/* Ruta para estadísticas */}
          </Routes>
        </main>

        {/* El componente Footer se renderiza en todas las rutas como pie de página */}
        <Footer />
      </Router>
    );
}

// Exportamos el componente Root para que pueda ser usado en otros lugares de la aplicación
export default Root;
