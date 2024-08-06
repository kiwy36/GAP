import { useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './UploadProduct.css';

const categories = [
    "Agua", "Alcohol varios", "Caramelera", "Carbón", "Cervezas", "Cigarrillos", "Comidas hechas",
    "Conservas", "Despensa", "Dulces", "Energizante", "Fiambrería", "Galletitas", "Gaseosas", "Hamburguesas",
    "Heladería", "Jugos", "Hielo", "Leña", "Licores", "Lácteos", "Limpieza", "Panificados", "Pastas",
    "Pepeleria", "Regalaría", "Salchichas", "Snacks salados", "Sodas", "Sueltos", "Tabaco", "Tecnología",
    "Varios", "Verdulería", "Vinos",
];

const UploadProduct = () => {
    const [product, setProduct] = useState({
        nombre: '',
        codigo: '',
        precio: '',
        categoria: '',
        stock: '',
        observaciones: '',
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
                observaciones: '',
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
            <input
                name="observaciones"
                placeholder="Observaciones (máximo 30 caracteres)"
                type="text"
                value={product.observaciones}
                onChange={handleChange}
                maxLength="30"
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Subiendo...' : 'Subir Producto'}
            </button>
        </form>
    );
};

export default UploadProduct;
