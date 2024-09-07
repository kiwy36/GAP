import { useState } from 'react';
import PropTypes from 'prop-types'; // Importar PropTypes

const PreStore = ({ product, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState(1);
    const [observations, setObservations] = useState('');

    const handleConfirm = () => {
        const subtotal = quantity * product.precio;
        const soldProduct = {
            nombre: product.nombre,
            cantidad: quantity,
            subtotal,
            observaciones: observations
        };
        onConfirm(soldProduct);
        onClose();
    };

    return (
        <div className="prestore-modal">
            <h2>{product.nombre}</h2>
            <p><strong>Precio:</strong> ${product.precio}</p>
            <label>
                Cantidad:
                <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                    min="1" 
                    max={product.stock} 
                />
            </label>
            <label>
                Observaciones:
                <input 
                    type="text" 
                    value={observations} 
                    onChange={(e) => setObservations(e.target.value)} 
                />
            </label>
            <p><strong>Total:</strong> ${quantity * product.precio}</p>
            <button onClick={onClose}>Cancelar</button>
            <button onClick={handleConfirm}>Confirmar</button>
        </div>
    );
};

// Validaciones de PropTypes
PreStore.propTypes = {
    product: PropTypes.shape({
        nombre: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        stock: PropTypes.number.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default PreStore;
