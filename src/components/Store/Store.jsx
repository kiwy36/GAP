import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore'; // Importar funciones necesarias para manejar Firestore
import { db } from '../../services/firebase'; // Importar la instancia de Firebase
import Swal from 'sweetalert2'; // Importar SweetAlert para notificaciones
import './Store.css'; // Importar estilos CSS específicos para este componente

const VERSION_ID = '1234'; // ID estático de la versión que se usa para actualizar en Firestore

const Store = () => {
    // Estados locales para manejar los productos del carrito y totales
    const [cartProducts, setCartProducts] = useState([]); // Productos en el carrito
    const [totalQuantity, setTotalQuantity] = useState(0); // Cantidad total de productos vendidos
    const [totalMoney, setTotalMoney] = useState(0); // Total de ingresos generados
    const [totalCost, setTotalCost] = useState(0); // Total de coste de los productos vendidos

    // useEffect para cargar productos del carrito desde localStorage cuando se monta el componente
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cartProducts')) || []; // Obtener productos guardados en localStorage
        setCartProducts(storedCart); // Establecer los productos en el estado
        calculateTotals(storedCart); // Calcular los totales basados en los productos almacenados
    }, []);

    // Función para calcular los totales del carrito
    const calculateTotals = (products) => {
        // Sumar cantidades, subtotales y costes totales
        const totalQty = products.reduce((sum, product) => sum + product.cantidad, 0); // Suma la cantidad de cada producto
        const totalAmount = products.reduce((sum, product) => sum + product.subtotal, 0); // Suma los subtotales de cada producto
        const totalCostAmount = products.reduce((sum, product) => sum + product.costeTotal, 0); // Suma el coste total por cada producto

        // Actualizar estados locales con los totales
        setTotalQuantity(totalQty);
        setTotalMoney(totalAmount);
        setTotalCost(totalCostAmount);
    };

    // Agrupar productos idénticos en el carrito basándose en su nombre
    const groupedProducts = cartProducts.reduce((acc, product) => {
        const existingProduct = acc.find(p => p.nombre === product.nombre); // Buscar si ya existe un producto con el mismo nombre
        if (existingProduct) {
            // Si el producto ya está en el array, se actualizan sus cantidades, subtotales y observaciones
            existingProduct.cantidad += product.cantidad;
            existingProduct.subtotal += product.subtotal;
            existingProduct.costeTotal += product.costeTotal;
            existingProduct.observaciones += existingProduct.observaciones ? `; ${product.observaciones}` : product.observaciones; // Concatenar observaciones si existen
        } else {
            // Si no existe, agregar el producto al array
            acc.push({ ...product });
        }
        return acc;
    }, []);

    // Función para eliminar un producto del carrito basado en su nombre
    const handleRemoveProduct = (productName) => {
        // Filtrar para eliminar todos los productos que coincidan con el nombre
        const updatedCart = cartProducts.filter(product => product.nombre !== productName);
        setCartProducts(updatedCart); // Actualizar el estado del carrito
        localStorage.setItem('cartProducts', JSON.stringify(updatedCart)); // Actualizar localStorage con el nuevo carrito
        calculateTotals(updatedCart); // Recalcular los totales después de eliminar productos
    };

    // Función para actualizar los stocks de los productos en la base de datos de Firebase
    const updateProductStocks = async () => {
        try {
            for (const product of cartProducts) {
                const productRef = doc(db, 'Productos', product.id); // Obtener referencia al producto en la base de datos
                const productSnapshot = await getDoc(productRef); // Obtener el snapshot del producto actual
                const currentStock = productSnapshot.data()?.stock; // Obtener el stock actual

                if (currentStock !== undefined) {
                    const newStock = currentStock - product.cantidad; // Calcular el nuevo stock restando la cantidad vendida
                    await updateDoc(productRef, { stock: newStock }); // Actualizar el stock en la base de datos
                }
            }
        } catch (error) {
            console.error('Error al actualizar los stocks:', error); // Mostrar error en caso de fallo
            throw new Error('Error al actualizar los stocks de los productos.'); // Lanzar un error en caso de fallo
        }
    };

    // Función para actualizar la versión en Firestore y en el localStorage
    const updateVersion = async () => {
        const versionDocRef = doc(db, 'Versiones', VERSION_ID); // Referencia al documento de versiones
        const versionSnapshot = await getDoc(versionDocRef); // Obtener el snapshot del documento de versiones
        const currentVersion = versionSnapshot.data()?.version; // Obtener la versión actual

        if (currentVersion !== undefined) {
            // Si la versión existe, incrementarla en 1 y actualizarla en Firestore
            await updateDoc(versionDocRef, { version: currentVersion + 1 });
            localStorage.removeItem('products'); // Limpiar los productos en localStorage
            localStorage.setItem('version', currentVersion + 1); // Actualizar la versión en localStorage
        }
    };

    // Función para enviar la comanda, actualizar stocks y versiones
    const handleSendOrder = async () => {
        try {
            await updateProductStocks(); // Actualizar stocks de los productos vendidos
            const order = {
                products: cartProducts, // Productos en la comanda
                totalQuantity, // Cantidad total de productos
                totalMoney, // Total de ingresos generados
                totalCost, // Total de costes
                createdAt: new Date(), // Fecha de creación de la comanda
            };

            await addDoc(collection(db, 'Ventas'), order); // Agregar la venta a la colección de 'Ventas' en Firestore
            await updateVersion(); // Actualizar la versión después de enviar la comanda
            Swal.fire({
                title: 'Comanda enviada',
                text: 'La comanda ha sido enviada correctamente.',
                icon: 'success',
            });

            // Vaciar el carrito y localStorage después de enviar la comanda
            setCartProducts([]);
            setTotalQuantity(0);
            setTotalMoney(0);
            setTotalCost(0);
            localStorage.removeItem('cartProducts'); // Limpiar el carrito del localStorage
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo enviar la comanda.',
                icon: 'error',
            });
            console.error('Error al enviar la comanda:', error); // Mostrar error en caso de fallo
        }
    };

    return (
        <div className="store-container">
            <h2 className="store-title">Resumen de Ventas</h2>
            <div className="store-summary">
                {/* Mostrar totales de la venta */}
                <p><strong>Cantidad de productos vendidos:</strong> {totalQuantity}</p>
                <p><strong>Total de ingresos generados:</strong> ${totalMoney}</p>
                <p><strong>Total de dinero gastado:</strong> ${totalCost}</p>
            </div>
            <div className="cart-list">
                {/* Si no hay productos en el carrito, mostrar un mensaje */}
                {groupedProducts.length === 0 ? (
                    <p className="empty-cart">No hay productos en el carrito.</p>
                ) : (
                    // Mostrar lista de productos agrupados en el carrito
                    groupedProducts.map((product, index) => (
                        <div key={index} className="cart-product">
                            <p><strong>Producto:</strong> {product.nombre}</p>
                            <p><strong>Cantidad:</strong> {product.cantidad}</p>
                            <p><strong>Subtotal:</strong> ${product.subtotal.toFixed(2)}</p>
                            <p><strong>Coste total:</strong> ${product.costeTotal.toFixed(2)}</p>
                            {product.observaciones && <p><strong>Observaciones:</strong> {product.observaciones}</p>}
                            <button 
                                className="remove-btn"
                                onClick={() => handleRemoveProduct(product.nombre)} // Eliminar producto del carrito
                            >
                                Eliminar
                            </button>
                        </div>
                    ))
                )}
            </div>
            {/* Botón para enviar la comanda */}
            <button className="send-order-btn" onClick={handleSendOrder} disabled={groupedProducts.length === 0}>
                Mandar Comanda
            </button>
        </div>
    );
};

export default Store; // Exportar componente Store
