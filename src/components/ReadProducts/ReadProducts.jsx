import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import FilterProducts from '../FilterProducts/FilterProducts.jsx';
import './ReadProducts.css';

const ReadProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (user) {
            const fetchProducts = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, 'Productos'));
                    const productsList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setProducts(productsList);
                    setFilteredProducts(productsList);
                } catch (error) {
                    console.error('Error al leer productos:', error);
                }
            };

            fetchProducts();
        }
    }, [user]);

    const handleFilter = useCallback((filters) => {
        const { name, barcode, category } = filters;
        const filtered = products.filter(product =>
            (name ? product.nombre.toLowerCase().includes(name.toLowerCase()) : true) &&
            (barcode ? product.codigo.includes(barcode) : true) &&
            (category ? product.categoria === category : true)
        );
        setFilteredProducts(filtered);
    }, [products]);

    if (!user) {
        return <p>Por favor, inicie sesión para ver los productos.</p>;
    }

    return (
        <div>
            <h2>Lista de Productos</h2>
            <FilterProducts onFilter={handleFilter} />
            {filteredProducts.length === 0 ? (
                <p>No hay productos disponibles.</p>
            ) : (
                <div className="products-grid">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <h3>{product.nombre}</h3>
                            <p><strong>Código:</strong> {product.codigo}</p>
                            <p><strong>Categoría:</strong> {product.categoria || 'N/A'}</p>
                            <p><strong>Precio:</strong> ${product.precio}</p>
                            <p><strong>Stock:</strong> {product.stock}</p>
                            <p><strong>Observaciones:</strong> {product.observaciones}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReadProducts;
