// components/user/UserPagination.js
import React from 'react';
import { Pagination } from '@themesberg/react-bootstrap';

const UserPagination = ({ pagination, onPageChange }) => {
  if (pagination.last_page <= 1) return null;

  const paginationItems = [];
  for (let page = 1; page <= pagination.last_page; page++) {
    paginationItems.push(
      <Pagination.Item 
        key={page} 
        active={page === pagination.current_page}
        onClick={() => onPageChange(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination>
        <Pagination.Prev 
          disabled={pagination.current_page === 1}
          onClick={() => onPageChange(pagination.current_page - 1)}
        />
        {paginationItems}
        <Pagination.Next 
          disabled={pagination.current_page === pagination.last_page}
          onClick={() => onPageChange(pagination.current_page + 1)}
        />
      </Pagination>
    </div>
  );
};

export default UserPagination;