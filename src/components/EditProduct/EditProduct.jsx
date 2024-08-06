import { useState } from 'react';
import { doc, getDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './EditProduct.css';

const categories = [
    "Agua", "Alcohol varios", "Caramelera", "Carbón", "Cervezas", "Cigarrillos", "Comidas hechas",
    "Conservas", "Despensa", "Dulces", "Energizante", "Fiambrería", "Galletitas", "Gaseosas", "Hamburguesas",
    "Heladería", "Heladería", "Jugos", "Hielo", "Leña", "Licores", "Lácteos", "Limpieza", "Panificados", "Pastas",
    "Pepeleria", "Regalaría", "Salchichas", "Snacks salados", "Sodas", "Sueltos", "Tabaco", "Tecnología",
    "Varios", "Verdulería", "Vinos",
];

const EditProduct = () => {
    const [search, setSearch] = useState('');
    const [searchBy, setSearchBy] = useState('codigo'); // Default to 'codigo'
    const [product, setProduct] = useState(null);

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleSearchByChange = (e) => setSearchBy(e.target.value);

    const handleFetch = async () => {
        try {
            let docRef;

            if (searchBy === 'codigo') {
                const q = query(
                    collection(db, 'Productos'),
                    where('codigo', '==', search)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    docRef = doc(db, 'Productos', querySnapshot.docs[0].id);
                }
            } else if (searchBy === 'nombre') {
                const q = query(
                    collection(db, 'Productos'),
                    where('nombre', '==', search)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    docRef = doc(db, 'Productos', querySnapshot.docs[0].id);
                }
            }

            if (docRef) {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    Swal.fire({
                        title: 'No encontrado',
                        text: 'No se encontró el producto',
                        icon: 'error'
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Debe ingresar un valor de búsqueda válido',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error al buscar el producto:', error);
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al buscar el producto',
                icon: 'error'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product || !product.id) {
            Swal.fire({
                title: 'Error',
                text: 'Debe buscar un producto antes de actualizar',
                icon: 'error'
            });
            return;
        }
        try {
            const docRef = doc(db, 'Productos', product.id);
            await updateDoc(docRef, product);
            Swal.fire({
                title: 'Éxito',
                text: 'Producto actualizado con éxito',
                icon: 'success'
            });
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al actualizar el producto',
                icon: 'error'
            });
        }
    };

    return (
        <div className="edit-product">
            <div className="search-container">
                <select value={searchBy} onChange={handleSearchByChange}>
                    <option value="codigo">Buscar por Código de Barra</option>
                    <option value="nombre">Buscar por Nombre</option>
                </select>
                <input
                    type="text"
                    placeholder={`Ingrese ${searchBy === 'codigo' ? 'Código de Barra' : 'Nombre'}`}
                    value={search}
                    onChange={handleSearchChange}
                />
                <button onClick={handleFetch}>Buscar Producto</button>
            </div>
            {product && (
                <form onSubmit={handleSubmit}>
                    <input
                        name="nombre"
                        placeholder="Nombre"
                        value={product.nombre}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="codigo"
                        placeholder="Código de Barra"
                        value={product.codigo}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="categoria"
                        value={product.categoria || ''}
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
                        value={product.precio}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="stock"
                        type="number"
                        placeholder="Stock"
                        value={product.stock}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="observaciones"
                        placeholder="Observaciones (máx. 30 caracteres)"
                        value={product.observaciones || ''}
                        onChange={handleChange}
                        maxLength={30}
                    />
                    <button type="submit">Actualizar Producto</button>
                </form>
            )}
        </div>
    );
};

export default EditProduct;
