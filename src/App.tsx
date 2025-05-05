
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";

// User Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import JuiceDetail from "./pages/JuiceDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import OrdersList from "./pages/OrdersList";
import OrderDetail from "./pages/OrderDetail";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import OrdersManagement from "./pages/admin/OrdersManagement";
import MenuManagement from "./pages/admin/MenuManagement";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";

// Not Found
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <main className="min-h-screen pb-20">
              <Routes>
                {/* User Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/juice/:id" element={<JuiceDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/orders" element={<OrdersList />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/orders" element={<OrdersManagement />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                <Route path="/admin/menu" element={<MenuManagement />} />
                
                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
