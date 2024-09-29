import { useState } from 'react';
import PropTypes from 'prop-types'; // Importar PropTypes
import Swal from 'sweetalert2'; // Importar SweetAlert2 para los avisos
import './PreStore.css';

const PreStore = ({ product, onClose, onConfirm }) => {
    const [quantity, setQuantity] = useState(1); // Iniciar con 0 para forzar al usuario a elegir
    const [observations, setObservations] = useState(''); // Corregido observaciones

    // Función para manejar el cambio en la cantidad seleccionada
    const handleQuantityChange = (e) => {
        const selectedQuantity = parseInt(e.target.value, 10);

        // Verificar si la cantidad seleccionada excede el stock disponible
        if (selectedQuantity > product.stock) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `No puedes seleccionar más de ${product.stock} unidades de este producto.`,
            });

            // Volver a la cantidad máxima disponible (el stock del producto)
            setQuantity(product.stock);
        } else if (selectedQuantity < 1 || isNaN(selectedQuantity)) {
            // Asegurarse de que el usuario ingrese al menos 1 unidad
            setQuantity(0); // Si es menor que 1 o no válido, vuelve a 0
        } else {
            setQuantity(selectedQuantity); // Actualizar la cantidad seleccionada
        }
    };

    const handleConfirm = () => {
        // Verificar si la cantidad seleccionada es válida (al menos 1 producto)
        if (quantity < 1) {
            Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                text: 'Debes seleccionar al menos 1 unidad para continuar.',
            });
            return; // Detener la ejecución si la cantidad es menor a 1
        }

        // Verificar si la cantidad seleccionada es mayor que el stock
        if (quantity > product.stock) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `Solo hay ${product.stock} unidades disponibles de ${product.nombre}.`,
            });
            return; // Detener la ejecución si la cantidad excede el stock
        }

        // Calcular subtotal y crear el objeto del producto vendido
        const subtotal = quantity * product.precio;
        const costeTotal = quantity * product.coste;
        const soldProduct = {
            nombre: product.nombre,
            cantidad: quantity,
            subtotal,
            costeTotal, // Nuevo campo de coste total
            observaciones: observations // Observaciones añadidas
        };

        onConfirm(soldProduct); // Envía los datos al componente Store
        onClose(); // Cierra PreStore
    };

    // Calcular el coste total solo si la cantidad es válida
    const totalCost = quantity > 0 ? quantity * product.coste : null;

    return (
        <div className="prestore-modal">
            <h2>{product.nombre}</h2>
            <p className='prestoreItem'><strong>Precio:</strong> ${product.precio}</p>
            <p className='prestoreItem'><strong>Stock disponible:</strong> {product.stock}</p> {/* Mostrar el stock disponible */}
            <div className='prestoreItem'>
                <label>
                    Cantidad:
                    <input 
                        type="number" 
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1" 
                        max={product.stock} // Limitar el máximo seleccionable al stock disponible
                        className="quantity-input"
                    />
                </label>
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
            {/* Mostrar el precio total por cantidad seleccionada o un mensaje si no hay cantidad */}
            <p className='prestoreItem'><strong>Total:</strong> {quantity > 0 ? `$${quantity * product.precio}` : 'Elija número de productos'}</p>
            {/* Mostrar el coste total o un mensaje si no hay cantidad válida */}
            <p className='prestoreItem'><strong>Coste total:</strong> {totalCost !== null ? `$${totalCost}` : 'Elija número de productos'}</p> 
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
        stock: PropTypes.number.isRequired,
        coste: PropTypes.number.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default PreStore;
