import PropTypes from 'prop-types';
import './Pagination.css'; // Estilos específicos para la paginación

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPaginationGroup = () => {
        const groupSize = 5; // Número mínimo de páginas visibles
        let start = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
        let end = Math.min(start + groupSize - 1, totalPages);
        return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
    };

    return (
        <div className="pagination">
            {/* Botón de navegación hacia atrás */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &lt;
            </button>

            {/* Renderiza los números de las páginas */}
            {getPaginationGroup().map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={page === currentPage ? 'active' : ''}
                >
                    {page}
                </button>
            ))}

            {/* Botón de navegación hacia adelante */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                &gt;
            </button>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;