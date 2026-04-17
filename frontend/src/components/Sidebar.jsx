import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, BarChart2, Award, Settings, PlusCircle } from 'lucide-react';

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <aside className="sidebar glass">
      <div className="sidebar-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          <Home size={22} />
          <span>Dashboard</span>
        </NavLink>
        
        {user?.role === 'admin' && (
          <NavLink to="/admin/create-exam" className={({ isActive }) => (isActive ? 'active' : '')}>
            <PlusCircle size={22} />
            <span>Create Exam</span>
          </NavLink>
        )}

        <NavLink to="/results" className={({ isActive }) => (isActive ? 'active' : '')}>
          <ClipboardList size={22} />
          <span>Results</span>
        </NavLink>

        <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'active' : '')}>
          <Award size={22} />
          <span>Leaderboard</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
          <Settings size={22} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
