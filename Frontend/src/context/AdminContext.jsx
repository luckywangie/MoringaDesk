import React, { createContext, useState } from 'react';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const promoteToAdmin = () => setIsAdmin(true);
  const demoteFromAdmin = () => setIsAdmin(false);

  return (
    <AdminContext.Provider value={{ isAdmin, promoteToAdmin, demoteFromAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};
