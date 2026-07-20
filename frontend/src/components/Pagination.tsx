import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={styles.container}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={styles.pageBtn}
        className="btn-secondary"
      >
        <ChevronLeft size={16} />
      </button>

      <div style={styles.pageGroup}>
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                ...styles.numBtn,
                backgroundColor: isActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#0b0d19' : 'var(--text-primary)',
                borderColor: isActive ? 'var(--accent-cyan)' : 'var(--glass-border)',
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={styles.pageBtn}
        className="btn-secondary"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '24px',
    width: '100%',
  },
  pageBtn: {
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  numBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
