import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Swal from 'sweetalert2';
import './Store.css';

const Store = () => {
    const [cartProducts, setCartProducts] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalMoney, setTotalMoney] = useState(0); // Total de ingresos
    const [totalCost, setTotalCost] = useState(0); // Total de gastos

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];
        setCartProducts(storedCart);
        calculateTotals(storedCart);
    }, []);

    const calculateTotals = (products) => {
        const totalQty = products.reduce((sum, product) => sum + product.cantidad, 0);
        const totalAmount = products.reduce((sum, product) => sum + product.subtotal, 0);
        const totalCostAmount = products.reduce((sum, product) => sum + product.costeTotal, 0);

        setTotalQuantity(totalQty);
        setTotalMoney(totalAmount);
        setTotalCost(totalCostAmount);
    };

    const handleRemoveProduct = (indexToRemove) => {
        const updatedCart = cartProducts.filter((_, index) => index !== indexToRemove);
        setCartProducts(updatedCart);
        localStorage.setItem('cartProducts', JSON.stringify(updatedCart));
        calculateTotals(updatedCart);
    };

    const handleSendOrder = async () => {
        try {
            const order = {
                products: cartProducts,
                totalQuantity,
                totalMoney,
                totalCost,
                createdAt: new Date(),
            };

            await addDoc(collection(db, 'Ventas'), order);

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
            localStorage.removeItem('cartProducts');
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo enviar la comanda.',
                icon: 'error',
            });
            console.error('Error al enviar la comanda:', error);
        }
    };

    // Agrupar productos idénticos en el carrito
    const groupedProducts = cartProducts.reduce((acc, product) => {
        const existingProduct = acc.find(p => p.nombre === product.nombre);
        if (existingProduct) {
            existingProduct.cantidad += product.cantidad;
            existingProduct.subtotal += product.subtotal;
            existingProduct.costeTotal += product.costeTotal;
            existingProduct.observaciones += existingProduct.observaciones ? `; ${product.observaciones}` : product.observaciones; // Concatenar observaciones
        } else {
            acc.push({ ...product });
        }
        return acc;
    }, []);

    return (
        <div className="store-container">
            <h2 className="store-title">Resumen de Ventas</h2>
            <div className="store-summary">
                <p><strong>Cantidad de productos vendidos:</strong> {totalQuantity}</p>
                <p><strong>Total de ingresos generados:</strong> ${totalMoney}</p>
                <p><strong>Total de dinero gastado:</strong> ${totalCost}</p>
            </div>
            <div className="cart-list">
                {groupedProducts.length === 0 ? (
                    <p className="empty-cart">No hay productos en el carrito.</p>
                ) : (
                    groupedProducts.map((product, index) => (
                        <div key={index} className="cart-product">
                            <p><strong>Producto:</strong> {product.nombre}</p>
                            <p><strong>Cantidad:</strong> {product.cantidad}</p>
                            <p><strong>Subtotal:</strong> ${product.subtotal.toFixed(2)}</p>
                            <p><strong>Coste total por item:</strong> ${product.costeTotal.toFixed(2)}</p>
                            {product.observaciones && <p><strong>Observaciones:</strong> {product.observaciones}</p>}
                            <button 
                                className="remove-btn"
                                onClick={() => handleRemoveProduct(index)}
                            >
                                Eliminar
                            </button>
                        </div>
                    ))
                )}
            </div>
            <button className="send-order-btn" onClick={handleSendOrder} disabled={groupedProducts.length === 0}>
                Mandar Comanda
            </button>
        </div>
    );
};

export default Store;
