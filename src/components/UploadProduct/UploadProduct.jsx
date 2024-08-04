import { useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './UploadProduct.css';

const categories = [
    "Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4", "Categoría 5",
    "Categoría 6", "Categoría 7", "Categoría 8", "Categoría 9", "Categoría 10",
    "Categoría 11", "Categoría 12", "Categoría 13", "Categoría 14", "Categoría 15",
    "Categoría 16", "Categoría 17", "Categoría 18", "Categoría 19", "Categoría 20",
    "Categoría 21", "Categoría 22", "Categoría 23", "Categoría 24", "Categoría 25"
];

const UploadProduct = () => {
    const [product, setProduct] = useState({
        nombre: '',
        codigo: '',
        precio: '',
        categoria: '',
        stock: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check if the product code already exists
            const q = query(collection(db, 'Productos'), where('codigo', '==', product.codigo));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                Swal.fire({
                    title: 'Código ya existente',
                    text: 'El código de barra ya está registrado. Por favor, ingrese otro código.',
                    icon: 'error',
                });
                setLoading(false);
                return;
            }

            // Add the new product to the collection
            await addDoc(collection(db, 'Productos'), product);
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
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error al subir el producto. Inténtelo de nuevo.',
                icon: 'error',
            });
            console.error('Error al subir el producto:', error);
        } finally {
            setLoading(false);
        }
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
            <input
                name="stock"
                placeholder="Stock"
                type="number"
                value={product.stock}
                onChange={handleChange}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Subiendo...' : 'Subir Producto'}
            </button>
        </form>
    );
};

export default UploadProduct;
