import { useState } from 'react';
import PropTypes from 'prop-types'; // Importar PropTypes
import './PreStore.css';

const PreStore = ({ product, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState(1);
    const [observations, setObservations] = useState(''); // Corregido observaciones

    const handleConfirm = () => {
        const subtotal = quantity * product.precio;
        const soldProduct = {
            nombre: product.nombre,
            cantidad: quantity,
            subtotal,
            observaciones: observations // Corregido observaciones
        };
        onConfirm(soldProduct); // Envía los datos al componente Store
        onClose(); // Cierra PreStore
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
            <br/>
            <label>
                Observaciones:
                <input 
                    type="text" 
                    value={observations} 
                    onChange={(e) => setObservations(e.target.value)} 
                />
            </label>
            <p><strong>Total:</strong> ${quantity * product.precio}</p>
            <button className='PreStore-cancel' onClick={onClose}>Cancelar</button>
            <button className='PreStore-confirm' onClick={handleConfirm}>Confirmar</button>
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
