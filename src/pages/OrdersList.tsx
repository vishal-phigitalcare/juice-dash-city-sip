
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, OrderStatus, OrderType, CupSize } from '@/types/models';
import { getUserOrders } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag, Clock } from 'lucide-react';

const sizeLabels = {
  [CupSize.SMALL]: 'Small',
  [CupSize.MEDIUM]: 'Medium',
  [CupSize.LARGE]: 'Large'
};

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

const orderTypeIcons = {
  [OrderType.DELIVERY]: <MapPin className="h-4 w-4" />,
  [OrderType.TAKEAWAY]: <ShoppingBag className="h-4 w-4" />,
  [OrderType.DINE_IN]: <Clock className="h-4 w-4" />
};

const OrdersList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  // Redirect to login if not logged in
  if (!user) {
    navigate('/login', { state: { redirectTo: '/orders' } });
    return null;
  }
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await getUserOrders(user.id);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user.id]);
  
  const activeOrders = orders.filter(order => 
    ![OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status)
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed')}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active Orders {activeOrders.length > 0 && <span className="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{activeOrders.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {activeOrders.length > 0 ? (
            <div className="space-y-6">
              {activeOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 py-4">
                    <div className="flex flex-wrap justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Order #{order.id.slice(-8)}</p>
                        <CardTitle className="text-lg mb-0">{new Date(order.createdAt).toLocaleDateString()}</CardTitle>
                      </div>
                      <div className="flex items-center">
                        <Badge className={`${orderStatusColors[order.status]} mr-3`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          {orderTypeIcons[order.orderType]}
                          <span className="ml-1 capitalize">{order.orderType.replace('_', '-')}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{item.juiceName}</p>
                            <p className="text-sm text-gray-500">
                              {sizeLabels[item.size]} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 flex flex-wrap justify-between items-center">
                      <Button 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="bg-primary-500 hover:bg-primary-600"
                      >
                        Track Order
                      </Button>
                      <p className="font-bold text-xl">Total: ₹{order.totalAmount}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">No active orders</h2>
              <p className="text-gray-600 mb-6">You don't have any active orders at the moment.</p>
              <Button 
                onClick={() => navigate('/menu')}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Order Now
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {completedOrders.length > 0 ? (
            <div className="space-y-6">
              {completedOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 py-4">
                    <div className="flex flex-wrap justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Order #{order.id.slice(-8)}</p>
                        <CardTitle className="text-lg mb-0">{new Date(order.createdAt).toLocaleDateString()}</CardTitle>
                      </div>
                      <div className="flex items-center">
                        <Badge className={`${orderStatusColors[order.status]} mr-3`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          {orderTypeIcons[order.orderType]}
                          <span className="ml-1 capitalize">{order.orderType.replace('_', '-')}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{item.juiceName}</p>
                            <p className="text-sm text-gray-500">
                              {sizeLabels[item.size]} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 flex flex-wrap justify-between items-center">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-xl">Total: ₹{order.totalAmount}</p>
                        {order.status === OrderStatus.DELIVERED && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary-600"
                            onClick={() => navigate('/menu')}
                          >
                            Order Again
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">No order history</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <Button 
                onClick={() => navigate('/menu')}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Place Your First Order
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersList;
