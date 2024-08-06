import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './FilterProducts.css';

const categories = [
    "Agua", "Alcohol varios", "Caramelera", "Carbón", "Cervezas", "Cigarrillos", "Comidas hechas",
    "Conservas", "Despensa", "Dulces", "Energizante", "Fiambrería", "Galletitas", "Gaseosas", "Hamburguesas",
    "Heladería", "Heladería", "Jugos", "Hielo", "Leña", "Licores", "Lácteos", "Limpieza", "Panificados", "Pastas",
    "Pepeleria", "Regalaría", "Salchichas", "Snacks salados", "Sodas", "Sueltos", "Tabaco", "Tecnología",
    "Varios", "Verdulería", "Vinos",
];

const FilterProducts = ({ onFilter }) => {
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [category, setCategory] = useState('');

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
