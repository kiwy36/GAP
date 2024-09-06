import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Swal from 'sweetalert2';
import './Store.css';

const Store = () => {
    const [cartProducts, setCartProducts] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);

    useEffect(() => {
        const storedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
        const storedCartTotal = Number(localStorage.getItem('cartTotal')) || 0;
        setCartProducts(storedCartProducts);
        setCartTotal(storedCartTotal);
    }, []);

    useEffect(() => {
        localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
        localStorage.setItem('cartTotal', cartTotal);
    }, [cartProducts, cartTotal]);

    const handleSendOrder = async () => {
        try {
            await addDoc(collection(db, 'VentasDiarias'), {
                productos: cartProducts,
                total: cartTotal,
                fecha: new Date(),
            });

            // Vaciar el carrito después de enviar la comanda
            setCartProducts([]);
            setCartTotal(0);
            localStorage.removeItem('cartProducts');
            localStorage.removeItem('cartTotal');

            Swal.fire({
                title: 'Comanda enviada',
                text: 'La comanda se ha enviado y el carrito ha sido vaciado.',
                icon: 'success',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al enviar la comanda.',
                icon: 'error',
            });
            console.error('Error al mandar comanda:', error);
        }
    };

    return (
        <div>
            <h1>Total vendido: ${cartTotal.toFixed(2)}</h1>
            {cartProducts.length === 0 ? (
                <p>No hay productos en el carrito.</p>
            ) : (
                <div className="cart-items">
                    {cartProducts.map((product, index) => (
                        <div key={index} className="cart-item">
                            <h3>{product.nombre}</h3>
                            <p><strong>Cantidad:</strong> {product.quantity}</p>
                            <p><strong>Total:</strong> ${(product.quantity * product.precio).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            )}
            <button className="submit-button" onClick={handleSendOrder}>Mandar Comanda</button>
        </div>
    );
};

export default Store;
