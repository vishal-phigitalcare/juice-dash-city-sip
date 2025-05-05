
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats, Order, OrderStatus } from '@/types/models';
import { getDashboardStats, getAllOrders, updateOrderStatus } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  CheckCheck,
  ArrowRight
} from 'lucide-react';

const orderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PLACED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PREPARING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.READY]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.OUT_FOR_DELIVERY]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, ordersData] = await Promise.all([
          getDashboardStats(),
          getAllOrders()
        ]);
        
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update the order in the list
      setRecentOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  // Sample data for charts
  const orderStatusData = [
    { name: 'Placed', value: 5 },
    { name: 'Preparing', value: 4 },
    { name: 'Ready', value: 2 },
    { name: 'Delivered', value: 20 },
    { name: 'Cancelled', value: 3 }
  ];
  
  const dailySalesData = [
    { day: 'Mon', sales: 4200 },
    { day: 'Tue', sales: 3800 },
    { day: 'Wed', sales: 5100 },
    { day: 'Thu', sales: 5800 },
    { day: 'Fri', sales: 7200 },
    { day: 'Sat', sales: 8500 },
    { day: 'Sun', sales: 7800 }
  ];
  
  const COLORS = ['#0088FE', '#FFBB28', '#FF8042', '#00C49F', '#FF0000'];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <ShoppingBag className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats?.totalOrders || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mr-4">
                <IndianRupee className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold">₹{stats?.totalEarnings?.toLocaleString() || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <h3 className="text-2xl font-bold">{stats?.pendingOrders || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CheckCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Orders</p>
                <h3 className="text-2xl font-bold">{stats?.completedOrders || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Orders</CardTitle>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/admin/orders')}
                  className="text-primary-600"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
                          <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <Badge className={orderStatusColors[order.status]}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Items: {order.items.length}</p>
                        <p className="font-medium">Total: ₹{order.totalAmount}</p>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap justify-between items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                        
                        {order.status === OrderStatus.PLACED && (
                          <Button
                            size="sm"
                            className="bg-primary-500 hover:bg-primary-600"
                            onClick={() => handleOrderStatusUpdate(order.id, OrderStatus.CONFIRMED)}
                          >
                            Confirm Order
                          </Button>
                        )}
                        
                        {order.status === OrderStatus.CONFIRMED && (
                          <Button
                            size="sm"
                            className="bg-primary-500 hover:bg-primary-600"
                            onClick={() => handleOrderStatusUpdate(order.id, OrderStatus.PREPARING)}
                          >
                            Start Preparing
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent orders found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Status Chart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailySalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="sales" name="Daily Revenue" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
