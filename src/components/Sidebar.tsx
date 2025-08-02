import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  PieChart,
  Map,
  Users,
  Package,
  Settings,
  TrendingUp,
  DollarSign,
  MessageSquare,
  UserCog,
  LucideIcon,
  FolderClosedIcon,
  X,
  ArrowLeft, // Icon for collapsing
} from "lucide-react";

import { useAuth } from "@/services/authContext";

// Updated props to handle collapsed state
interface SidebarProps {
  isOpen: boolean; // For mobile view
  onClose: () => void; // For mobile view
  isCollapsed: boolean; // For desktop view
  onToggleCollapse: () => void; // For desktop view
}

interface SidebarItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, hasRole } = useAuth();

  const dashboardItems: SidebarItem[] = [
    { path: "/dashboard/home", icon: Map, label: "Home" },
    { path: "/dashboard/daily", icon: TrendingUp, label: "Daily Forecasting" },
    { path: "/dashboard/hourly", icon: PieChart, label: "Hourly Forecasting" },
  ];

  const additionalItems: SidebarItem[] = [
    // ...(hasRole(["analyst", "admin"])
    //   ? [{ path: "/chatbot", icon: MessageSquare, label: "AI Chatbot" }]
    //   : []),
    ...(hasRole(["admin"])
      ? [{ path: "/users", icon: UserCog, label: "User Management" }]
      : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          {/* Hide title when collapsed */}
          {!isCollapsed && (
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </span>
          )}
        </div>

        {/* Mobile-only close button */}
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>


      </div>

      <nav className={`flex-1 py-6 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center hover:bg-gray-100 rounded-md p-2 mb-4 ${isCollapsed ? 'justify-center' : 'justify-between '}`} onClick={onToggleCollapse}>
          {/* Desktop-only collapse button */}
          <button
            className="p-1 rounded-lg text-gray-500  dark:hover:bg-dark-700 hidden lg:block"
            aria-label="Toggle sidebar collapse"
          >
            <ArrowLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Close
            </h3>
          )}
        </div>

        <div className="mb-6">
          {/* Hide header text when collapsed */}
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dashboards
            </h3>
          )}
          <div className="mt-3 space-y-1">
            {dashboardItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item flex items-center py-3 px-2 rounded-md ${isActive ? "active bg-blue-600 text-white dark:bg-blue-600" : ""
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                onClick={() => onClose()} // Keep this for mobile to close overlay
                title={isCollapsed ? item.label : undefined} // Add tooltip on collapse
              >
                <item.icon className={`h-5 w-5 shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {/* Hide label text when collapsed */}
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {additionalItems.length > 0 && (
          <div>
            {/* Hide header text when collapsed */}
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tools
              </h3>
            )}
            <div className="mt-3 space-y-1">
              {additionalItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item flex items-center py-3 px-2 rounded-md ${isActive ? "active bg-blue-600 text-white dark:bg-blue-600" : ""
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  onClick={() => onClose()}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                  {/* Hide label text when collapsed */}
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>



      <div className="p-4 py-8 border-t border-gray-200 dark:border-dark-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user?.avatar || "/placeholder.svg"}
            alt={user?.name}
            className="h-10 w-10 rounded-full object-cover shrink-0"
          />
          {/* Hide user info text when collapsed */}
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        {/* Dynamic width for collapse effect on desktop */}
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="flex flex-col flex-grow bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;