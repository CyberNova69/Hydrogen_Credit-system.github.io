import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Store,
  Factory,
  Shield,
  ShoppingCart,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const navigationItems = [
  {
    title: 'Marketplace',
    url: '/',
    icon: Store,
    roles: ['public', 'producer', 'buyer', 'regulator'],
    color: 'text-public'
  },
  {
    title: 'Producer Dashboard',
    url: '/producer',
    icon: Factory,
    roles: ['producer'],
    color: 'text-producer'
  },
  {
    title: 'Regulatory Dashboard',
    url: '/regulator',
    icon: Shield,
    roles: ['regulator'],
    color: 'text-regulator'
  },
  {
    title: 'Buyer Dashboard',
    url: '/buyer',
    icon: ShoppingCart,
    roles: ['buyer'],
    color: 'text-buyer'
  },
  {
    title: 'Public Ledger',
    url: '/public',
    icon: FileText,
    roles: ['public', 'producer', 'buyer', 'regulator'],
    color: 'text-muted-foreground'
  }
];

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const filteredItems = navigationItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (item: typeof navigationItems[0]) => {
    const active = isActive(item.url);
    return active 
      ? `bg-muted text-primary font-medium ${item.color}` 
      : `hover:bg-muted/50 ${item.color}`;
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass(item)}
                      end={item.url === '/'}
                    >
                      <motion.div
                        className="flex items-center"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </motion.div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Stats Summary for authenticated users */}
        {user && !collapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Stats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="font-medium">{user.credits || 0}</span>
                </div>
                {user.budget && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">${user.budget}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Role:</span>
                  <span className={`font-medium capitalize ${
                    user.role === 'producer' ? 'text-producer' :
                    user.role === 'buyer' ? 'text-buyer' :
                    user.role === 'regulator' ? 'text-regulator' :
                    'text-public'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};