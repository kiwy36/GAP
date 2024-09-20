import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './UploadProduct.css';

const VERSION_ID = '1234'; // ID del documento en la colección Versione
const UploadProduct = () => {
    const [product, setProduct] = useState({
        nombre: '',
        codigo: '',
        precio: '',
        categoria: '',
        stock: '',
        observaciones: '',
    });

    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);

    // Función para cargar las categorías personalizadas desde Firestore
    const loadCategories = async () => {
        const querySnapshot = await getDocs(collection(db, 'UserCategories'));
        const loadedCategories = querySnapshot.docs
            .map(doc => doc.data().name)
            .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente

        setCategories(loadedCategories);
    };

    useEffect(() => {
        loadCategories(); // Cargar las categorías al montar el componente
    }, []);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = name === 'nombre' ? capitalizeFirstLetter(value) : value;
        setProduct((prev) => ({ ...prev, [name]: formattedValue }));
    };

    const handleNewCategoryChange = (e) => {
        setNewCategory(e.target.value);
    };

    const handleAddCategory = async () => {
        if (newCategory.trim() === '') {
            Swal.fire({
                title: 'Error',
                text: 'La categoría no puede estar vacía.',
                icon: 'error',
            });
            return;
        }
    
        try {
            await addDoc(collection(db, 'UserCategories'), { name: capitalizeFirstLetter(newCategory) });
            setNewCategory('');
    
            // Recargar las categorías después de añadir la nueva
            await loadCategories(); // Espera a que las categorías se recarguen completamente
            Swal.fire({
                title: 'Éxito',
                text: 'Categoría añadida con éxito',
                icon: 'success',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error al agregar la categoría. Inténtelo de nuevo.',
                icon: 'error',
            });
            console.error('Error al agregar la categoría:', error);
        }
    };
    

    const updateVersion = async () => {
        const versionDocRef = doc(db, 'Versiones', VERSION_ID);
        const versionSnapshot = await getDoc(versionDocRef);
        const currentVersion = versionSnapshot.data()?.version;
    
        if (currentVersion !== undefined) {
            await updateDoc(versionDocRef, { version: currentVersion + 1 });
            localStorage.removeItem('products'); // Borrar productos del localStorage al actualizar la versión
            localStorage.setItem('version', currentVersion + 1);
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const q = query(collection(db, 'Productos'), where('codigo', '==', product.codigo));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            try {
                await addDoc(collection(db, 'Productos'), product);
                await updateVersion();
                Swal.fire({
                    title: 'Éxito',
                    text: 'Producto subido con éxito',
                    icon: 'success',
                });
                setProduct({
                    nombre: '',
                    codigo: '',
                    precio: '',
                    categoria: '',
                    stock: '',
                    observaciones: '',
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Error al subir el producto. Inténtelo de nuevo.',
                    icon: 'error',
                });
                console.error('Error al subir el producto:', error);
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Ya existe un producto con ese código.',
                icon: 'error',
            });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="upload-form">
            <input
                name="nombre"
                placeholder="Nombre"
                value={product.nombre}
                onChange={handleChange}
                required
            />
            <input
                name="codigo"
                placeholder="Código de barra"
                value={product.codigo}
                onChange={handleChange}
                type="text"
                required
            />
            <input
                name="precio"
                placeholder="Precio"
                type="number"
                value={product.precio}
                onChange={handleChange}
                required
            />
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
            <div className="new-category-container">
                <input
                    type="text"
                    placeholder="Nueva categoría"
                    value={newCategory}
                    onChange={handleNewCategoryChange}
                />
                <button type="button" onClick={handleAddCategory}>Añadir Categoría</button>
            </div>

            <input
                name="stock"
                placeholder="Stock"
                type="number"
                value={product.stock}
                onChange={handleChange}
                required
            />
            <input
                name="observaciones"
                placeholder="Observaciones (máximo 60 caracteres)"
                type="text"
                value={product.observaciones}
                onChange={handleChange}
                maxLength="60"
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Subiendo...' : 'Subir Producto'}
            </button>
        </form>
    );
};

export default UploadProduct;
