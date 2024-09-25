import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';
import FilterProducts from '../FilterProducts/FilterProducts.jsx';
import EditProduct from '../EditProduct/EditProduct.jsx';
import PreStore from '../PreStore/PreStore.jsx';
import './ReadProducts.css';

const VERSION_ID = '1234'; // ID del documento en la colección Versiones

const ReadProducts = () => {
    // Estados para almacenar productos, productos filtrados, el usuario, productos seleccionados para editar o vender, y estados de carga y error.
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [showPreStore, setShowPreStore] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    // useEffect para verificar el estado de autenticación del usuario.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);
    // useEffect para cargar los productos si el usuario está autenticado.
    useEffect(() => {
        if (user) {
            const fetchProducts = async () => {
                setLoading(true);
                setError(null);

                try {
                    // Verificar la versión de los productos en Firebase
                    const versionDoc = await getDoc(doc(db, 'Versiones', VERSION_ID));
                    const firebaseVersion = versionDoc.data()?.version;
                    const localVersion = localStorage.getItem('version');

                    console.log(`Versión vigente en Firebase: ${firebaseVersion}`);

                    // Verificar si la versión ha cambiado
                    if (localVersion && firebaseVersion === Number(localVersion)) {
                        console.log('Usando productos desde localStorage');
                        const storedProducts = JSON.parse(localStorage.getItem('products'));
                        if (storedProducts) {
                            setProducts(storedProducts); // Carga los productos desde localStorage
                            setFilteredProducts(storedProducts);
                            setLoading(false);// Detiene la carga
                            return;
                        }
                    } else {
                        console.log('La versión ha cambiado, cargando productos desde Firebase');
                        localStorage.removeItem('products'); // Limpiar localStorage si la versión cambió
                    }

                    // Cargar productos desde Firebase
                    const querySnapshot = await getDocs(collection(db, 'Productos'));
                    const productsList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    const dataSize = new TextEncoder().encode(JSON.stringify(productsList)).length / 1024;
                    console.log(`Consumo de datos: ${dataSize.toFixed(2)} KB`);
                    // Guardar productos y nueva versión en localStorage
                    setProducts(productsList);
                    setFilteredProducts(productsList);
                    localStorage.setItem('products', JSON.stringify(productsList));
                    localStorage.setItem('version', firebaseVersion);
                    setLoading(false);
                } catch (error) {
                    console.error('Error al leer productos:', error);
                    setError('No se pudieron cargar los productos.');
                    setLoading(false);
                }
            };
            fetchProducts();
        }
    }, [user]);
    // Filtrar productos según los filtros aplicados por el usuario
    const handleFilter = useCallback((filters) => {
        const { name, barcode, category } = filters;
        const filtered = products.filter(product =>
            (name ? product.nombre.toLowerCase().includes(name.toLowerCase()) : true) &&
            (barcode ? product.codigo.includes(barcode) : true) &&
            (category ? product.categoria === category : true)
        );
        setFilteredProducts(filtered);
    }, [products]);
    // Manejar la acción de editar un producto
    const handleEdit = (product) => {
        setProductToEdit(product);
    };
    // Actualiza la lista de productos después de editar
    const handleProductUpdate = () => {
        setProductToEdit(null); // Cierra el formulario de edición
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'Productos'));
                const productsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(productsList); // Actualiza los productos
                setFilteredProducts(productsList);
            } catch (error) {
                console.error('Error al leer productos:', error);
            }
        };
        fetchProducts();
    };
    // Cancelar la edición del producto
    const handleCancel = () => {
        setProductToEdit(null); // Cierra el formulario de edición
    };
    // Manejar la acción de eliminar un producto
    const handleDelete = async (productId) => {
        try {
            await deleteDoc(doc(db, 'Productos', productId));// Elimina el producto de Firebase
            // Actualiza la lista de productos eliminando el producto
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
    // Manejar la acción de añadir un producto a vendidos
    const handleAddToSold = (product) => {
        setSelectedProduct(product);
        setShowPreStore(true);
    };
    // Confirmar la venta del producto y guardarlo en el carrito
    const handleConfirmSold = (soldProduct) => {
        const storedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
        storedCartProducts.push(soldProduct);
        localStorage.setItem('cartProducts', JSON.stringify(storedCartProducts));
        setShowPreStore(false);

        Swal.fire({
            title: 'Producto añadido a Vendidos',
            text: `${soldProduct.nombre} ha sido añadido con éxito.`,
            icon: 'success',
        });
    };
    // Verifica si el usuario está autenticado
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
                    {loading ? (
                        <div className="spinner"></div>
                        // { /* Spinner mientras carga */ } //
                    ) : error ? (
                        <p>{error}</p> // {/* Mensaje de error si falla la carga */}
                    ) : filteredProducts.length === 0 ? (
                        <p>No hay productos disponibles.</p> // {/* Mostrar solo si no hay productos */}
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="product-card">
                                    <h3>{product.nombre}</h3>
                                    <p><strong>Código:</strong> {product.codigo}</p>
                                    <p><strong>Categoría:</strong> {product.categoria || 'N/A'}</p>
                                    <p><strong>Coste:</strong> ${product.coste}</p>
                                    <p><strong>Precio:</strong> ${product.precio}</p>
                                    <p><strong>Stock:</strong> {product.stock}</p>
                                    <p><strong>Observaciones:</strong> {product.observaciones}</p>
                                    <div className="button-container">
                                        <button className="delete-button" onClick={() => handleDelete(product.id)}>Eliminar</button>
                                        <button className="edit-button" onClick={() => handleEdit(product)}>Editar</button>
                                        <button className="cart-button" onClick={() => handleAddToSold(product)}>Vendido</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            {showPreStore && (
                <PreStore
                    product={selectedProduct}
                    onClose={() => setShowPreStore(false)}
                    onConfirm={handleConfirmSold}
                />
            )}
        </div>
    );
};

export default ReadProducts;
