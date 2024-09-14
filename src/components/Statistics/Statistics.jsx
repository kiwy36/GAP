import { useState} from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './Statistics.css';

const Statistics = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [salesData, setSalesData] = useState([]);
    const [mostSoldProduct, setMostSoldProduct] = useState(null);

    const fetchSalesBetweenDates = async () => {
        if (startDate && endDate) {
        const q = query(
            collection(db, 'Ventas'),
            where('createdAt', '>=', new Date(startDate)),
            where('createdAt', '<=', new Date(endDate))
        );

        const querySnapshot = await getDocs(q);
        const sales = [];
        querySnapshot.forEach((doc) => {
            sales.push(doc.data());
        });

        // Procesar datos de ventas
        processSalesData(sales);
        }
    };

    const processSalesData = (sales) => {
        const total = {};
        sales.forEach((sale) => {
        sale.products.forEach((product) => {
            if (!total[product.nombre]) {
            total[product.nombre] = { quantity: 0, subtotal: 0 };
            }
            total[product.nombre].quantity += product.cantidad;
            total[product.nombre].subtotal += product.subtotal;
        });
        });

        const totalSalesArray = Object.keys(total).map((key) => ({
        name: key,
        quantity: total[key].quantity,
        subtotal: total[key].subtotal,
        }));

        setSalesData(totalSalesArray);

        // Encontrar el producto más vendido
        const mostSold = totalSalesArray.reduce((prev, current) =>
        current.quantity > prev.quantity ? current : prev,
        { name: '', quantity: 0 }
        );
        setMostSoldProduct(mostSold);
    };

    return (
        <div className="statistics-container">
        <h2>Estadísticas de Ventas</h2>
        <div className="date-selector">
            <label>
            Fecha de inicio:
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
            </label>
            <label>
            Fecha de fin:
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
            </label>
            <button onClick={fetchSalesBetweenDates}>Obtener Estadísticas</button>
        </div>

        <div className="sales-summary">
            <h3>Sumatoria de Ventas</h3>
            {salesData.length > 0 ? (
            <ul>
                {salesData.map((product, index) => (
                <li key={index}>
                    <strong>{product.name}</strong>: {product.quantity} unidades
                    vendidas - Total: ${product.subtotal}
                </li>
                ))}
            </ul>
            ) : (
            <p>No se encontraron ventas en el periodo seleccionado.</p>
            )}
        </div>

        <div className="most-sold-product">
            <h3>Producto más vendido</h3>
            {mostSoldProduct ? (
            <p>
                <strong>{mostSoldProduct.name}</strong> con {mostSoldProduct.quantity} unidades vendidas.
            </p>
            ) : (
            <p>No hay datos de ventas.</p>
            )}
        </div>
        </div>
    );
};

export default Statistics;
