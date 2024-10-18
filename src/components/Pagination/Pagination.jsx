import PropTypes from 'prop-types';
import './Pagination.css'; // Estilos específicos para la paginación

const Pagination = ({ totalProducts, pageSize, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalProducts / pageSize);

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

Pagination.propTypes = {
    totalProducts: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;