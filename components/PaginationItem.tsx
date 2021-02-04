import React, { useCallback } from 'react';
import Pagination from 'react-bootstrap/Pagination';

interface PaginationItemProps {
  page: number;
  active: boolean;
  onSelect: (page: number) => void;
}

function PaginationItem({ page, active, onSelect }: PaginationItemProps) {
  const handleClick = useCallback(() => onSelect(page), [page, onSelect]);

  return (
    <Pagination.Item key={page} active={active} onClick={handleClick}>
      {page}
    </Pagination.Item>
  );
}

export default PaginationItem;
