
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Home, ShoppingCart, Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/profile')) {
      navigate('/');
    }
    setIsOpen(false);
  };

  const navLinks = user?.role === 'admin' ? [
    { to: '/admin', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { to: '/admin/menu', label: 'Menu', icon: <Menu className="h-5 w-5" /> },
  ] : [
    { to: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { to: '/menu', label: 'Menu', icon: <Menu className="h-5 w-5" /> },
    { to: '/cart', label: 'Cart', icon: <ShoppingCart className="h-5 w-5" />, badge: totalItems > 0 ? totalItems : undefined },
    { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                JuiceDash
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium relative
                  ${isActive(link.to) 
                    ? 'text-primary-600 bg-primary-100' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            
            {user ? (
              <Button onClick={handleLogout} variant="outline" className="ml-4">
                Logout
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/login')} 
                variant="default" 
                className="ml-4 bg-primary-500 hover:bg-primary-600"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {user?.role !== 'admin' && totalItems > 0 && (
              <Link to="/cart" className="mr-4 relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              </Link>
            )}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="py-4 flex flex-col h-full">
                  <div className="px-2 mb-4">
                    <h2 className="text-lg font-semibold text-primary-600">JuiceDash</h2>
                  </div>
                  
                  <div className="flex-grow">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-md text-sm font-medium mb-1 relative
                          ${isActive(link.to) 
                            ? 'text-primary-600 bg-primary-100' 
                            : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                      >
                        {link.icon}
                        <span className="ml-3">{link.label}</span>
                        {link.badge && (
                          <span className="ml-auto bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-200">
                    {user ? (
                      <div className="px-4">
                        <p className="text-sm text-gray-600 mb-2">Logged in as:</p>
                        <p className="text-sm font-medium mb-3">{user.name}</p>
                        <Button 
                          onClick={handleLogout} 
                          className="w-full bg-primary-500 hover:bg-primary-600"
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="px-4 space-y-2">
                        <Button 
                          onClick={() => {
                            navigate('/login');
                            setIsOpen(false);
                          }} 
                          className="w-full bg-primary-500 hover:bg-primary-600"
                        >
                          Login
                        </Button>
                        <Button 
                          onClick={() => {
                            navigate('/register');
                            setIsOpen(false);
                          }} 
                          variant="outline" 
                          className="w-full"
                        >
                          Register
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
