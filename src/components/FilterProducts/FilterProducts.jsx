import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import './FilterProducts.css';

const FilterProducts = ({ onFilter }) => {
    // Definir el estado para el nombre, código de barra, categoría seleccionada y lista de categorías
    const [name, setName] = useState(''); // Estado para almacenar el valor del filtro de nombre
    const [barcode, setBarcode] = useState(''); // Estado para almacenar el valor del filtro de código de barra
    const [category, setCategory] = useState(''); // Estado para almacenar la categoría seleccionada
    const [categories, setCategories] = useState([]); // Estado para almacenar las categorías disponibles

    // Función asíncrona para cargar las categorías desde Firebase y ordenarlas alfabéticamente
    const loadCategories = async () => {
        // Obtener los documentos de la colección 'UserCategories' en Firebase
        const querySnapshot = await getDocs(collection(db, 'UserCategories'));

        // Extraer los nombres de las categorías, ordenarlos alfabéticamente y guardarlos en el estado
        const loadedCategories = querySnapshot.docs
            .map(doc => doc.data().name) // Obtener el campo 'name' de cada documento
            .sort((a, b) => a.localeCompare(b)); // Ordenar las categorías alfabéticamente

        setCategories(loadedCategories); // Actualizar el estado de las categorías
    };

    // Ejecutar la función `loadCategories` cuando el componente se monta (solo una vez)
    useEffect(() => {
        loadCategories(); // Cargar las categorías al montar el componente
    }, []); // El array vacío [] asegura que esto solo se ejecute una vez al montar

    // Función que invoca `onFilter` con los valores de los filtros seleccionados
    const handleFilter = useCallback(() => {
        onFilter({ name, barcode, category }); // Pasar los valores actuales del nombre, código de barra y categoría
    }, [name, barcode, category, onFilter]); // Dependencias: esta función cambia si alguno de estos valores cambia

    // Cada vez que el valor del nombre, código de barra o categoría cambie, invocar `handleFilter`
    useEffect(() => {
        handleFilter(); // Ejecutar la función que envía los filtros actualizados
    }, [name, barcode, category, handleFilter]); // Se ejecuta cuando cualquiera de estos valores cambia

    return (
        <div className="filter-products">
            {/* Input para filtrar por nombre */}
            <input
                type="text"
                placeholder="Nombre" // Texto que aparece dentro del input como guía
                value={name} // Valor actual del input (estado `name`)
                onChange={(e) => setName(e.target.value)} // Actualiza el estado `name` cuando el usuario escribe
            />
            
            {/* Input para filtrar por código de barra */}
            <input
                type="text"
                placeholder="Código de barra"
                value={barcode} // Valor actual del input (estado `barcode`)
                onChange={(e) => setBarcode(e.target.value)} // Actualiza el estado `barcode` cuando el usuario escribe
            />
            
            {/* Select para elegir la categoría */}
            <select
                value={category} // Categoría actualmente seleccionada
                onChange={(e) => setCategory(e.target.value)} // Actualiza el estado `category` cuando se selecciona una opción
            >
                <option value="">Selecciona una categoría</option> {/* Opción predeterminada vacía */}
                {categories.map((cat, index) => ( // Mapear cada categoría cargada para crear opciones del select
                    <option key={index} value={cat}>{cat}</option> // Mostrar cada categoría como opción
                ))}
            </select>
        </div>
    );
};

FilterProducts.propTypes = {
    // Validar que la función `onFilter` sea pasada como prop y sea de tipo función
    onFilter: PropTypes.func.isRequired,
};

export default FilterProducts;
