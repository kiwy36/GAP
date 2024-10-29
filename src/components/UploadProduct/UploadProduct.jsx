import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import './UploadProduct.css';

// ID del documento donde se maneja la versión en Firestore
const VERSION_ID = 'version vigente';

const UploadProduct = ({ user }) => {
    // Estado inicial del producto con sus campos
    const [product, setProduct] = useState({
        nombre: '',
        codigo: '',
        coste: '',
        precio: '',
        categoria: '',
        stock: '',
        observaciones: '',
    });

    // Estado para manejar las categorías disponibles
    const [categories, setCategories] = useState([]);
    
    // Estado para manejar la nueva categoría que el usuario desea añadir
    const [newCategory, setNewCategory] = useState('');

    // Estado para mostrar un indicador de carga durante la subida de producto
    const [loading, setLoading] = useState(false);

    // Función para cargar las categorías personalizadas desde Firestore
    const loadCategories = useCallback(async () => {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'UserCategories'));
        const loadedCategories = querySnapshot.docs
            .map(doc => doc.data().name)
            .sort((a, b) => a.localeCompare(b));
        setCategories(loadedCategories);
    }, [user.uid]);

    // Se ejecuta al montar el componente para cargar las categorías
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Función para capitalizar la primera letra de un string (usado en nombres y categorías)
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Función que maneja los cambios en los inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si es el campo nombre, capitaliza la primera letra
        const formattedValue = name === 'nombre' ? capitalizeFirstLetter(value) : value;

        // Actualiza el estado del producto con el valor ingresado por el usuario
        setProduct((prev) => ({ ...prev, [name]: formattedValue }));
    };

    // Función para manejar el cambio del campo de nueva categoría
    const handleNewCategoryChange = (e) => {
        setNewCategory(e.target.value); // Actualiza el estado con la nueva categoría ingresada
    };

    // Función para añadir una nueva categoría a Firestore
    const handleAddCategory = async () => {
        if (newCategory.trim() === '') {
            // Muestra una alerta si el campo de la nueva categoría está vacío
            Swal.fire({
                title: 'Error',
                text: 'La categoría no puede estar vacía.',
                icon: 'error',
            });
            return;
        }
    
        try {
            // Agrega la nueva categoría a la colección 'UserCategories'
            await addDoc(collection(db, 'users', user.uid, 'UserCategories'), { name: capitalizeFirstLetter(newCategory) });
            setNewCategory(''); // Resetea el campo de la nueva categoría
    
            // Recarga las categorías después de añadir la nueva
            await loadCategories();
            Swal.fire({
                title: 'Éxito',
                text: 'Categoría añadida con éxito',
                icon: 'success',
            });
        } catch (error) {
            // Muestra un error si ocurre algún problema al agregar la categoría
            Swal.fire({
                title: 'Error',
                text: 'Error al agregar la categoría. Inténtelo de nuevo.',
                icon: 'error',
            });
            console.error('Error al agregar la categoría:', error);
        }
    };

    // Función para actualizar la versión en Firestore y el localStorage
    const updateVersion = async () => {
        const versionDocRef = doc(db, 'users', user.uid, 'Versiones', VERSION_ID);
        const versionSnapshot = await getDoc(versionDocRef);
        const currentVersion = versionSnapshot.data()?.version;

        if (currentVersion !== undefined) {
            await updateDoc(versionDocRef, { version: currentVersion + 1 });
            localStorage.removeItem('products');
            localStorage.setItem('version', currentVersion + 1);
        }
    };

    // Función que maneja el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        setLoading(true); // Activa el indicador de carga

        // Validaciones para el coste, precio y stock (evitar valores negativos)
        if (product.coste < 0) {
            Swal.fire({
                title: 'Error',
                text: 'El coste no puede ser un valor negativo.',
                icon: 'error',
            });
            setLoading(false);
            return;
        }

        if (product.precio < 0) {
            Swal.fire({
                title: 'Error',
                text: 'El precio no puede ser un valor negativo.',
                icon: 'error',
            });
            setLoading(false);
            return;
        }

        if (product.stock < 0) {
            Swal.fire({
                title: 'Error',
                text: 'El stock no puede ser un valor negativo.',
                icon: 'error',
            });
            setLoading(false);
            return;
        }

        // Consulta para verificar si ya existe un producto con el mismo código de barra
        const q = query(collection(db, 'users', user.uid, 'Productos'), where('codigo', '==', product.codigo));
        const querySnapshot = await getDocs(q);

        // Si no existe un producto con el mismo código
        if (querySnapshot.empty) {
            try {
                // Añade el nuevo producto a la colección 'Productos'
                await addDoc(collection(db, 'users', user.uid, 'Productos'), product);
                
                // Actualiza la versión en Firestore y localStorage
                await updateVersion();

                // Muestra un mensaje de éxito
                Swal.fire({
                    title: 'Éxito',
                    text: 'Producto subido con éxito',
                    icon: 'success',
                });

                // Resetea el formulario después de subir el producto
                setProduct({
                    nombre: '',
                    codigo: '',
                    coste: '',
                    precio: '',
                    categoria: '',
                    stock: '',
                    observaciones: '',
                });
            } catch (error) {
                // Muestra un mensaje de error si falla la subida
                Swal.fire({
                    title: 'Error',
                    text: 'Error al subir el producto. Inténtelo de nuevo.',
                    icon: 'error',
                });
                console.error('Error al subir el producto:', error);
            }
        } else {
            // Muestra un mensaje si ya existe un producto con el mismo código
            Swal.fire({
                title: 'Error',
                text: 'Ya existe un producto con ese código.',
                icon: 'error',
            });
        }

        setLoading(false); // Desactiva el indicador de carga
    };

    return (
        <section>
        <form onSubmit={handleSubmit} className="upload-form">
        <h2 className='subTitle-uploadProduct'>Subir Producto</h2>
            {/* Campo para el nombre del producto */}
            <input
                name="nombre"
                placeholder="Nombre"
                value={product.nombre}
                onChange={handleChange}
                required
            />

            {/* Campo para el código de barra del producto */}
            <input
                name="codigo"
                placeholder="Código de barra"
                value={product.codigo}
                onChange={handleChange}
                type="text"
                required
            />

            {/* Campo para el coste del producto */}
            <input
                name="coste"
                placeholder="Coste"
                type="number"
                value={product.coste}
                onChange={handleChange}
                min="0" // No permite valores negativos
                required
            />

            {/* Campo para el precio del producto */}
            <input
                name="precio"
                placeholder="Precio"
                type="number"
                value={product.precio}
                onChange={handleChange}
                min="0" // No permite valores negativos
                required
            />

            {/* Selección de la categoría del producto */}
            <select
                name="categoria"
                value={product.categoria}
                onChange={handleChange}
                required
            >
                <option value="">Selecciona una categoría</option>
                {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>

            {/* Campo para agregar una nueva categoría */}
            <div className="new-category-container">
                <input
                    type="text"
                    placeholder="Nueva categoría"
                    value={newCategory}
                    onChange={handleNewCategoryChange}
                />
                <button type="button" onClick={handleAddCategory}>Añadir Categoría</button>
            </div>

            {/* Campo para el stock del producto */}
            <input
                name="stock"
                placeholder="Stock"
                type="number"
                value={product.stock}
                onChange={handleChange}
                min="0" // No permite valores negativos
                required
            />

            {/* Campo para las observaciones del producto */}
            <textarea
                name="observaciones"
                placeholder="Observaciones"
                value={product.observaciones}
                onChange={handleChange}
            />

            {/* Botón para subir el producto y mostrar indicador de carga si está subiendo */}
            <button type="submit" disabled={loading}>
                {loading ? 'Cargando...' : 'Subir Producto'}
            </button>
        </form>
        </section>
    );
};
// Definir PropTypes para validar `user` y `user.uid`
UploadProduct.propTypes = {
    user: PropTypes.shape({
        uid: PropTypes.string.isRequired,
    }).isRequired,
};

export default UploadProduct;
