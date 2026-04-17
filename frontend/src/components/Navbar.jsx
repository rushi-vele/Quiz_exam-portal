import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="glass navbar">
      <div className="nav-logo">
        <span className="gradient-text">QuizMaster</span>
      </div>
      <div className="nav-actions">
        <div className="nav-icon-btn"><Bell size={20} /></div>
        <div className="nav-user">
          <User size={20} />
          <span>{user?.name}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
