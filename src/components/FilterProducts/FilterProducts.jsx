import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import './FilterProducts.css';

const FilterProducts = ({ onFilter }) => {
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    // Cargar las categorías desde Firebase y ordenarlas alfabéticamente
    const loadCategories = async () => {
        const querySnapshot = await getDocs(collection(db, 'UserCategories'));
        const loadedCategories = querySnapshot.docs
            .map(doc => doc.data().name)
            .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente

        setCategories(loadedCategories);
    };

    useEffect(() => {
        loadCategories(); // Cargar las categorías al montar el componente
    }, []);

    const handleFilter = useCallback(() => {
        onFilter({ name, barcode, category });
    }, [name, barcode, category, onFilter]);

    useEffect(() => {
        handleFilter();
    }, [name, barcode, category, handleFilter]);

    return (
        <div className="filter-products">
            <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Código de barra"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                ))}
            </select>
        </div>
    );
};

FilterProducts.propTypes = {
    onFilter: PropTypes.func.isRequired,
};

export default FilterProducts;
