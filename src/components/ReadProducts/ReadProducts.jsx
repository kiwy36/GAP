import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, getDoc, doc,deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';
import FilterProducts from '../FilterProducts/FilterProducts.jsx';
import EditProduct from '../EditProduct/EditProduct.jsx';
import './ReadProducts.css';

const VERSION_ID = '1234'; // ID del documento en la colección Versiones
const ReadProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);

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
                    const versionDoc = await getDoc(doc(db, 'Versiones', VERSION_ID));
                    const firebaseVersion = versionDoc.data()?.version;
                    const localVersion = localStorage.getItem('version');

                    console.log(`Versión vigente en Firebase: ${firebaseVersion}`);

                    if (localVersion && firebaseVersion === Number(localVersion)) {
                        console.log('Usando productos desde localStorage');
                        const storedProducts = JSON.parse(localStorage.getItem('products'));
                        if (storedProducts) {
                            setProducts(storedProducts);
                            setFilteredProducts(storedProducts);
                            return;
                        }
                    }

                    const querySnapshot = await getDocs(collection(db, 'Productos'));
                    const productsList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    const dataSize = new TextEncoder().encode(JSON.stringify(productsList)).length / 1024;
                    console.log(`Consumo de datos: ${dataSize.toFixed(2)} KB`);

                    setProducts(productsList);
                    setFilteredProducts(productsList);
                    localStorage.setItem('products', JSON.stringify(productsList));
                    localStorage.setItem('version', firebaseVersion);
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

    const handleEdit = (product) => {
        setProductToEdit(product);
    };

    const handleProductUpdate = () => {
        setProductToEdit(null); // Close the edit form
        // Re-fetch products to ensure the list is up to date
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
    };

    const handleCancel = () => {
        setProductToEdit(null);
    };
    const handleDelete = async (productId) => {
        try {
            // Eliminar de Firebase
            await deleteDoc(doc(db, 'Productos', productId));

            // Actualizar el localStorage
            const updatedProducts = products.filter(product => product.id !== productId);
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
            localStorage.setItem('products', JSON.stringify(updatedProducts));

            Swal.fire({
                title: 'Producto eliminado',
                text: 'El producto ha sido eliminado con éxito.',
                icon: 'success',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el producto.',
                icon: 'error',
            });
            console.error('Error al eliminar producto:', error);
        }
    };

    const handleAddToCart = (product) => {
        const storedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
        const existingProductIndex = storedCartProducts.findIndex(p => p.id === product.id);

        if (existingProductIndex !== -1) {
            // Si el producto ya está en el carrito, actualizar la cantidad
            storedCartProducts[existingProductIndex].quantity += 1;
        } else {
            // Si el producto no está en el carrito, añadirlo con una cantidad inicial de 1
            storedCartProducts.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cartProducts', JSON.stringify(storedCartProducts));

        Swal.fire({
            title: 'Producto añadido al carrito',
            text: `${product.nombre} ha sido añadido al carrito.`,
            icon: 'success',
        });
    };

    if (!user) {
        return <p>Por favor, inicie sesión para ver los productos.</p>;
    }

    if (!user) {
        return <p>Por favor, inicie sesión para ver los productos.</p>;
    }

    return (
        <div>
            <h2>Lista de Productos</h2>
            <FilterProducts onFilter={handleFilter} />
            {productToEdit ? (
                <EditProduct product={productToEdit} onProductUpdate={handleProductUpdate} onCancel={handleCancel} />
            ) : (
                <>
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
                                    <button className="submit-button" onClick={() => handleEdit(product)}>Editar</button>
                                    <button className="delete-button" onClick={() => handleDelete(product.id)}>Eliminar</button>
                                    <button className="cart-button" onClick={() => handleAddToCart(product)}>Añadir a Vendidos</button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReadProducts;