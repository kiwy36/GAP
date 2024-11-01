import { useState } from 'react'; // Importar useState para manejar los estados locales
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importar funciones de Firebase para consultas
import { db } from '../../services/firebase'; // Importar la referencia de la base de datos Firebase
import './Statistics.css'; // Importar el archivo de estilos para el componente
import PropTypes from 'prop-types';

const Statistics = () => {
    // Definir los estados para manejar las fechas de inicio y fin, los datos de ventas, el producto más vendido, los ingresos, costes, ganancias y observaciones
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [salesData, setSalesData] = useState([]);
    const [mostSoldProduct, setMostSoldProduct] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0); // Ingresos totales
    const [totalCost, setTotalCost] = useState(0); // Costes totales
    const [totalProfit, setTotalProfit] = useState(0); // Ganancias totales
    const [observations, setObservations] = useState([]); // Observaciones de los productos vendidos

    // Función para obtener ventas entre las fechas seleccionadas
    const fetchSalesBetweenDates = async ({ user }) => {
        if (startDate && endDate) {
            // Convertir las fechas de inicio y fin en objetos de tipo Date
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Incrementar la fecha de fin para incluir todo el día en la consulta
            end.setDate(end.getDate() + 1);

            // Realizar la consulta a la colección 'Ventas' en Firebase filtrando por el rango de fechas
            const q = query(
                collection(db, `users/${user.uid}/Ventas`),
                where('createdAt', '>=', start),
                where('createdAt', '<', end)
            );

            const querySnapshot = await getDocs(q); // Obtener los documentos que coinciden con la consulta
            const sales = [];
            const allObservations = []; // Array para almacenar todas las observaciones

            // Recorrer los documentos de ventas
            querySnapshot.forEach((doc) => {
                const saleData = doc.data();
                sales.push(saleData); // Agregar los datos de cada venta al array 'sales'
                
                // Recorrer cada producto dentro de la venta para obtener las observaciones
                saleData.products.forEach((product) => {
                    if (product.observaciones && product.observaciones.trim() !== "") {
                        // Si hay observaciones y no están vacías, agregar al array de observaciones
                        allObservations.push(`${product.nombre}: ${product.observaciones}`);
                    }
                });
            });

            setObservations(allObservations); // Guardar las observaciones en el estado

            // Procesar los datos de ventas obtenidos
            processSalesData(sales);
        }
    };

    // Función para procesar los datos de ventas
    const processSalesData = (sales) => {
        const total = {};
        let revenue = 0;  // Variable para los ingresos totales
        let cost = 0;     // Variable para los costes totales

        // Recorrer cada venta
        sales.forEach((sale) => {
            // Recorrer los productos de cada venta
            sale.products.forEach((product) => {
                if (!total[product.nombre]) {
                    // Inicializar el objeto si no existe para ese producto
                    total[product.nombre] = { quantity: 0, subtotal: 0, cost: 0 };
                }
                // Sumar la cantidad y el subtotal de cada producto vendido
                total[product.nombre].quantity += product.cantidad;
                total[product.nombre].subtotal += product.subtotal;
                total[product.nombre].cost += product.costeTotal; // Sumar el coste total

                // Sumar los valores a los ingresos y costes totales
                revenue += product.subtotal; // Sumar a los ingresos totales
                cost += product.costeTotal;  // Sumar a los costes totales
            });
        });

        // Guardar los datos financieros (ingresos, costes y ganancias)
        setTotalRevenue(revenue);
        setTotalCost(cost);
        setTotalProfit(revenue - cost); // Las ganancias son ingresos menos costes

        // Convertir el objeto 'total' en un array para facilitar su visualización
        const totalSalesArray = Object.keys(total).map((key) => ({
            name: key,
            quantity: total[key].quantity,
            subtotal: total[key].subtotal,
            cost: total[key].cost
        }));

        setSalesData(totalSalesArray); // Guardar los datos de ventas en el estado

        // Encontrar el producto más vendido
        const mostSold = totalSalesArray.reduce((prev, current) =>
            current.quantity > prev.quantity ? current : prev,
            { name: '', quantity: 0 }
        );
        setMostSoldProduct(mostSold); // Guardar el producto más vendido
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
                        onChange={(e) => setStartDate(e.target.value)} // Actualizar la fecha de inicio
                    />
                </label>
                <label>
                    Fecha de fin:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)} // Actualizar la fecha de fin
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
                                {/* Mostrar el nombre, cantidad, subtotal y coste de cada producto */}
                                <strong>{product.name}</strong>: {product.quantity} unidades vendidas - Total: ${product.subtotal.toFixed(2)} - Coste: ${product.cost.toFixed(2)}
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
                    // Mostrar el producto más vendido y su cantidad
                    <p>
                        <strong>{mostSoldProduct.name}</strong> con {mostSoldProduct.quantity} unidades vendidas.
                    </p>
                ) : (
                    <p>No hay datos de ventas.</p>
                )}
            </div>

            <div className="financial-summary">
                <h3>Resumen Financiero</h3>
                {/* Mostrar los ingresos, costes y ganancias totales */}
                <p><strong>Ingresos totales:</strong> ${totalRevenue.toFixed(2)}</p>
                <p><strong>Costes totales:</strong> ${totalCost.toFixed(2)}</p>
                <p><strong>Ganancias totales:</strong> ${totalProfit.toFixed(2)}</p>
            </div>

            <div className="observations-section">
                <h3>Observaciones</h3>
                {/* Mostrar las observaciones de los productos vendidos */}
                {observations.length > 0 ? (
                    <ul>
                        {observations.map((obs, index) => (
                            <li key={index}>{obs}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay observaciones para este periodo.</p>
                )}
            </div>
        </div>
    );
};

Statistics.propTypes = {
    user: PropTypes.shape({
        uid: PropTypes.string.isRequired,
    }).isRequired,
};
export default Statistics;
