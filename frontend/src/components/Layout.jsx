import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Sidebar from './Sidebar';
import { ToastProvider } from './Toast';

export default function Layout() {
  return (
    <ToastProvider>
      <Nav />
      <div className="main">
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </ToastProvider>
  );
}
