import { useState } from 'react';
import PropTypes from 'prop-types';
import './FilterProducts.css';

const categories = [
    "Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4", "Categoría 5",
    "Categoría 6", "Categoría 7", "Categoría 8", "Categoría 9", "Categoría 10",
    "Categoría 11", "Categoría 12", "Categoría 13", "Categoría 14", "Categoría 15",
    "Categoría 16", "Categoría 17", "Categoría 18", "Categoría 19", "Categoría 20",
    "Categoría 21", "Categoría 22", "Categoría 23", "Categoría 24", "Categoría 25"
];

const FilterProducts = ({ onFilter }) => {
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [category, setCategory] = useState('');

    const handleFilter = () => {
        onFilter({ name, barcode, category });
    };

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
            <button onClick={handleFilter}>Buscar</button>
        </div>
    );
};

FilterProducts.propTypes = {
    onFilter: PropTypes.func.isRequired,
};

export default FilterProducts;
