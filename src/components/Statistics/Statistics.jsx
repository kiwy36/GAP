import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './Statistics.css';

const Statistics = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalSales, setTotalSales] = useState([]);
    const [categorySales, setCategorySales] = useState({});
    const [bestProduct, setBestProduct] = useState(null);

    // Función para calcular las ventas entre fechas
    const fetchSalesBetweenDates = async () => {
        if (startDate && endDate) {
            const q = query(
                collection(db, 'Ventas'),
                where('createdAt', '>=', new Date(startDate)),
                where('createdAt', '<=', new Date(endDate))
            );
            const querySnapshot = await getDocs(q);
            const salesData = [];

            querySnapshot.forEach((doc) => {
                salesData.push(doc.data());
            });

            // Calcular la sumatoria de productos y dinero generado
            const productSummary = {};
            salesData.forEach((sale) => {
                sale.products.forEach((product) => {
                    if (!productSummary[product.nombre]) {
                        productSummary[product.nombre] = {
                            cantidad: 0,
                            total: 0,
                        };
                    }
                    productSummary[product.nombre].cantidad += product.cantidad;
                    productSummary[product.nombre].total += product.subtotal;
                });
            });
            setTotalSales(productSummary);
        }
    };

    // Función para obtener ventas por categoría y mostrar en gráfico de torta
    const fetchCategorySales = async (date) => {
        const q = query(collection(db, 'Ventas'), where('createdAt', '==', new Date(date)));
        const querySnapshot = await getDocs(q);
        const categoryData = {};

        querySnapshot.forEach((doc) => {
            doc.data().products.forEach((product) => {
                const category = product.categoria || 'Sin categoría';
                if (!categoryData[category]) {
                    categoryData[category] = 0;
                }
                categoryData[category] += product.cantidad;
            });
        });
        setCategorySales(categoryData);
    };

    // Función para identificar el producto más vendido entre fechas
    const fetchBestSellingProduct = async () => {
        if (startDate && endDate) {
            const q = query(
                collection(db, 'Ventas'),
                where('createdAt', '>=', new Date(startDate)),
                where('createdAt', '<=', new Date(endDate))
            );
            const querySnapshot = await getDocs(q);
            const productSales = {};

            querySnapshot.forEach((doc) => {
                doc.data().products.forEach((product) => {
                    if (!productSales[product.nombre]) {
                        productSales[product.nombre] = 0;
                    }
                    productSales[product.nombre] += product.cantidad;
                });
            });

            const bestProduct = Object.keys(productSales).reduce((a, b) =>
                productSales[a] > productSales[b] ? a : b
            );
            setBestProduct(bestProduct);
        }
    };

    useEffect(() => {
        fetchSalesBetweenDates();
        fetchBestSellingProduct();
    }, [startDate, endDate]);

    return (
        <div>
            <h2>Estadísticas de Ventas</h2>

            {/* Sumatoria de ventas entre fechas */}
            <div className="sales-summary">
                <h3>Sumatoria de ventas entre fechas</h3>
                <label>Fecha de inicio:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <label>Fecha de fin:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <button onClick={fetchSalesBetweenDates}>Ver Resumen</button>

                <ul>
                    {Object.keys(totalSales).map((product) => (
                        <li key={product}>
                            {product}: {totalSales[product].cantidad} vendidos, ${totalSales[product].total} generados
                        </li>
                    ))}
                </ul>
            </div>

            {/* Ventas por categoría (gráfico de torta simple) */}
            <div className="sales-category">
                <h3>Ventas diarias por categoría</h3>
                <label>Seleccionar fecha:</label>
                <input type="date" onChange={(e) => fetchCategorySales(e.target.value)} />
                <div className="pie-chart">
                    {Object.keys(categorySales).map((category) => (
                        <div key={category} style={{ '--percent': categorySales[category] }}>
                            {category}: {categorySales[category]} vendidos
                        </div>
                    ))}
                </div>
            </div>

            {/* Producto más vendido entre fechas */}
            <div className="best-selling-product">
                <h3>Producto más vendido</h3>
                <p>{bestProduct ? bestProduct : 'No hay datos'}</p>
            </div>
        </div>
    );
};

export default Statistics;
