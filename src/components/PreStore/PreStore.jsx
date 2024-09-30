import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import './PreStore.css';

const PreStore = ({ product, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState(1);
    const [observations, setObservations] = useState('');
    const [maxSelectable, setMaxSelectable] = useState(product.stock);
    // eslint-disable-next-line no-unused-vars
    const [totalSold, setTotalSold] = useState(0); 

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];
        const totalSoldProducts = storedCart.reduce((sum, p) => sum + (p.nombre === product.nombre ? p.cantidad : 0), 0);
        setTotalSold(totalSoldProducts);
    
        const remainingStock = product.stock - totalSoldProducts;
        setMaxSelectable(remainingStock > 0 ? remainingStock : 0);
    }, [product]); 

    const handleQuantityChange = (e) => {
        const selectedQuantity = parseInt(e.target.value, 10);

        if (selectedQuantity > maxSelectable) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `No puedes seleccionar más de ${maxSelectable} unidades de este producto.`,
            });
            setQuantity(maxSelectable);
        } else if (selectedQuantity < 1 || isNaN(selectedQuantity)) {
            setQuantity(0);
        } else {
            setQuantity(selectedQuantity);
        }
    };

    const handleConfirm = () => {
        if (quantity < 1) {
            Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                text: 'Debes seleccionar al menos 1 unidad para continuar.',
            });
            return;
        }

        if (quantity > maxSelectable) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `Solo hay ${maxSelectable} unidades disponibles de ${product.nombre}.`,
            });
            return;
        }

        // Calcular subtotal y crear el objeto del producto vendido
        const subtotal = quantity * product.precio;
        const costeTotal = quantity * product.coste;
        const soldProduct = {
            id: product.id, // Asegúrate de tener un ID único para cada producto
            nombre: product.nombre,
            cantidad: quantity,
            subtotal,
            costeTotal,
            observaciones: observations,
        };

        // Enviar el producto vendido al componente padre
        onConfirm(soldProduct);
        onClose();
    };

    const totalCost = quantity > 0 ? quantity * product.coste : null;

    return (
        <div className="prestore-modal">
            <h2>{product.nombre}</h2>
            <p className='prestoreItem'><strong>Precio:</strong> ${product.precio}</p>
            <p className='prestoreItem'><strong>Stock disponible:</strong> {product.stock}</p>
            <div className='prestoreItem'>
                <label>
                    Cantidad:
                    <input 
                        type="number" 
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1" 
                        max={maxSelectable}
                        className="quantity-input"
                    />
                </label>
                <span className="available-quantity"> (Máximo seleccionable: {maxSelectable})</span>
            </div>
            <br/>
            <div className='prestoreItem'>
                <label>
                    Observaciones:
                    <input 
                        type="text" 
                        value={observations} 
                        onChange={(e) => setObservations(e.target.value)}
                        maxLength="60"
                    />
                </label>
            </div>
            <p className='prestoreItem'><strong>Total:</strong> {quantity > 0 ? `$${quantity * product.precio}` : 'Elija número de productos'}</p>
            <p className='prestoreItem'><strong>Coste total:</strong> {totalCost !== null ? `$${totalCost}` : 'Elija número de productos'}</p> 
            <button className='PreStore-cancel' onClick={onClose}>Cancelar</button>
            <button 
                className='PreStore-confirm' 
                onClick={handleConfirm} 
                disabled={maxSelectable === 0}
            >
                Confirmar
            </button>
                <br/>
            {maxSelectable === 0 && (
                <span className="max-reached-message">¡Se alcanzó el máximo de {product.nombre} disponible!</span>
            )}
        </div>
    );
};

// Validaciones de PropTypes
PreStore.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.string.isRequired, // Asegúrate de tener una propiedad id
        nombre: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        stock: PropTypes.number.isRequired,
        coste: PropTypes.number.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default PreStore;
