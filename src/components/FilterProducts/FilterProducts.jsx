import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import './FilterProducts.css'; // Estilos específicos para el componente

const FilterProducts = ({ onFilter }) => {
    // Estados para los filtros de nombre, código de barra, categoría y las categorías disponibles
    const [name, setName] = useState(''); // Almacena el filtro de nombre
    const [barcode, setBarcode] = useState(''); // Almacena el filtro de código de barra
    const [category, setCategory] = useState(''); // Almacena la categoría seleccionada
    const [categories, setCategories] = useState([]); // Almacena la lista de categorías disponibles

    // Función para cargar las categorías desde Firebase
    const loadCategories = async () => {
        // Obtener documentos de la colección 'UserCategories' en Firebase
        const querySnapshot = await getDocs(collection(db, 'UserCategories'));

        // Procesar las categorías, ordenarlas y guardarlas en el estado
        const loadedCategories = querySnapshot.docs
            .map(doc => doc.data().name) // Extraer el campo 'name' de cada documento
            .sort((a, b) => a.localeCompare(b)); // Ordenarlas alfabéticamente

        setCategories(loadedCategories); // Actualizar el estado con las categorías cargadas
    };

    // Ejecutar la función `loadCategories` al montar el componente
    useEffect(() => {
        loadCategories(); // Cargar las categorías solo una vez
    }, []); // El array vacío asegura que se ejecute solo al montar el componente

    // Función que invoca `onFilter` con los valores actuales de los filtros
    const handleFilter = useCallback(() => {
        // Llamar a la función `onFilter` con los valores actuales de los filtros
        onFilter({ name, barcode, category });
    }, [name, barcode, category, onFilter]); // Se vuelve a ejecutar si cambian los valores del filtro

    // Ejecutar `handleFilter` cada vez que se cambien los valores del nombre, código de barra o categoría
    useEffect(() => {
        handleFilter(); // Llamar a la función de filtrado
    }, [name, barcode, category, handleFilter]); // Dependencias: se ejecuta al cambiar estos valores
    
    return (
        <div className="filter-products">
            {/* Filtro por nombre */}
            <input
                type="text"
                placeholder="Nombre" // Texto de guía en el input
                value={name} // Valor del estado `name`
                onChange={(e) => setName(e.target.value)} // Actualizar el estado cuando el usuario escribe
                className="filter-input" // Estilo para el input
            />

            {/* Filtro por código de barra */}
            <input
                type="text"
                placeholder="Código de barra" // Texto de guía en el input
                value={barcode} // Valor del estado `barcode`
                onChange={(e) => setBarcode(e.target.value)} // Actualizar el estado cuando el usuario escribe
                className="filter-input" // Estilo para el input
            />

            {/* Filtro por categoría */}
            <select
                value={category} // Categoría seleccionada actualmente
                onChange={(e) => setCategory(e.target.value)} // Actualizar el estado cuando se selecciona una nueva opción
                className="filter-select" // Estilo para el select
            >
                <option value="">Selecciona una categoría</option> {/* Opción predeterminada vacía */}
                {categories.map((cat, index) => ( // Crear opciones a partir de las categorías cargadas
                    <option key={index} value={cat}>{cat}</option> // Mostrar cada categoría como opción
                ))}
            </select>
        </div>
    );
};

FilterProducts.propTypes = {
    // Validar que `onFilter` sea una función pasada como prop
    onFilter: PropTypes.func.isRequired,
};

export default FilterProducts;
