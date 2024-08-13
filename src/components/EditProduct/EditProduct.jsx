import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './EditProduct.css';
import PropTypes from 'prop-types';

const categories = [
    "Agua", "Alcohol varios", "Caramelera", "Carbón", "Cervezas", "Cigarrillos", "Comidas hechas",
    "Conservas", "Despensa", "Dulces", "Energizante", "Fiambrería", "Galletitas", "Gaseosas", "Hamburguesas",
    "Heladería", "Jugos", "Hielo", "Leña", "Licores", "Lácteos", "Limpieza", "Panificados", "Pastas",
    "Pepeleria", "Regalaría", "Salchichas", "Snacks salados", "Sodas", "Sueltos", "Tabaco", "Tecnología",
    "Varios", "Verdulería", "Vinos",
];

const EditProduct = ({ product, onProductUpdate, }) => {
    const [localProduct, setLocalProduct] = useState(product);

    useEffect(() => {
        setLocalProduct(product);
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localProduct || !localProduct.id) {
            Swal.fire({
                title: 'Error',
                text: 'Debe buscar un producto antes de actualizar',
                icon: 'error',
            });
            return;
        }
        try {
            const docRef = doc(db, 'Productos', localProduct.id);
            await updateDoc(docRef, localProduct);
            Swal.fire({
                title: 'Éxito',
                text: 'Producto actualizado con éxito',
                icon: 'success',
            });
            onProductUpdate(); // Llama a la función para actualizar la lista de productos
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al actualizar el producto',
                icon: 'error',
            });
        }
    };

    return (
        <div className="edit-product">
            <form onSubmit={handleSubmit}>
                <input
                    name="nombre"
                    placeholder="Nombre"
                    value={localProduct.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    name="codigo"
                    placeholder="Código de Barra"
                    value={localProduct.codigo}
                    onChange={handleChange}
                    required
                />
                <select
                    name="categoria"
                    value={localProduct.categoria || ''}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
                <input
                    name="precio"
                    type="number"
                    placeholder="Precio"
                    value={localProduct.precio}
                    onChange={handleChange}
                    required
                />
                <input
                    name="stock"
                    type="number"
                    placeholder="Stock"
                    value={localProduct.stock}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="observaciones"
                    placeholder="Observaciones (máx. 30 caracteres)"
                    value={localProduct.observaciones || ''}
                    onChange={handleChange}
                    maxLength={30}
                />
                <button type="submit">Actualizar Producto</button>
            </form>
        </div>
    );
};

EditProduct.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.string.isRequired,
        nombre: PropTypes.string.isRequired,
        codigo: PropTypes.string.isRequired,
        categoria: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        stock: PropTypes.number.isRequired,
        observaciones: PropTypes.string,
    }).isRequired,
    onProductUpdate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default EditProduct;
