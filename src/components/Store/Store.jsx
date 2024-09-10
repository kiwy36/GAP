import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Swal from 'sweetalert2';
import './Store.css';

const Store = () => {
    const [cartProducts, setCartProducts] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalMoney, setTotalMoney] = useState(0);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];
        setCartProducts(storedCart);

        // Calcular totales
        const totalQty = storedCart.reduce((sum, product) => sum + product.cantidad, 0);
        const totalAmount = storedCart.reduce((sum, product) => sum + product.subtotal, 0);
        setTotalQuantity(totalQty);
        setTotalMoney(totalAmount);
    }, []);

    const handleSendOrder = async () => {
        try {
            const order = {
                products: cartProducts,
                totalQuantity,
                totalMoney,
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

    return (
        <div>
            <h2>Total Vendido</h2>
            <p><strong>Cantidad de productos vendidos:</strong> {totalQuantity}</p>
            <p><strong>Total de dinero generado:</strong> ${totalMoney}</p>
            <div className="cart-list">
                {cartProducts.length === 0 ? (
                    <p>No hay productos en el carrito.</p>
                ) : (
                    cartProducts.map((product, index) => (
                        <div key={index} className="cart-product">
                            <p><strong>Producto:</strong> {product.nombre}</p>
                            <p><strong>Cantidad:</strong> {product.cantidad}</p>
                            <p><strong>Subtotal:</strong> ${product.subtotal}</p>
                            {product.observaciones && <p><strong>Observaciones:</strong> {product.observaciones}</p>}
                        </div>
                    ))
                )}
            </div>
            <button onClick={handleSendOrder} disabled={cartProducts.length === 0}>
                Mandar Comanda
            </button>
        </div>
    );
};

export default Store;
