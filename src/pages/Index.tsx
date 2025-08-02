
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Outlet } from 'react-router-dom';


const Index = () => {

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);


  return (


    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 bg-gray-50 dark:bg-dark-900 p-6 main-content">
          <div className="animate-fade-in dashboard-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>

  );
};

export default Index;
