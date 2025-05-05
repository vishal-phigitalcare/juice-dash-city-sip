
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, OrderStatus, OrderType } from '@/types/models';
import { getAllOrders, updateOrderStatus } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Search, MapPin, ShoppingBag, Clock } from 'lucide-react';

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

const OrdersManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<OrderType | 'all'>('all');
  
  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await getAllOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update the order in the list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };
  
  const activeOrders = orders.filter(order => 
    ![OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status)
  );
  
  // Apply filters
  const filteredActiveOrders = activeOrders.filter(order => {
    // Search term filter
    const searchMatch = 
      searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = 
      statusFilter === 'all' || 
      order.status === statusFilter;
    
    // Type filter
    const typeMatch = 
      typeFilter === 'all' || 
      order.orderType === typeFilter;
    
    return searchMatch && statusMatch && typeMatch;
  });
  
  const filteredCompletedOrders = completedOrders.filter(order => {
    // Search term filter
    const searchMatch = 
      searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter (only applies to completed/cancelled)
    const statusMatch = 
      statusFilter === 'all' || 
      (activeTab === 'completed' && order.status === statusFilter);
    
    // Type filter
    const typeMatch = 
      typeFilter === 'all' || 
      order.orderType === typeFilter;
    
    return searchMatch && statusMatch && typeMatch;
  });
  
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PLACED:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.OUT_FOR_DELIVERY;
      case OrderStatus.OUT_FOR_DELIVERY:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  };
  
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Management</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={OrderStatus.PLACED}>Placed</SelectItem>
                  <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={OrderStatus.PREPARING}>Preparing</SelectItem>
                  <SelectItem value={OrderStatus.READY}>Ready</SelectItem>
                  <SelectItem value={OrderStatus.OUT_FOR_DELIVERY}>Out for Delivery</SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                  <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as OrderType | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={OrderType.DELIVERY}>Delivery</SelectItem>
                  <SelectItem value={OrderType.TAKEAWAY}>Takeaway</SelectItem>
                  <SelectItem value={OrderType.DINE_IN}>Dine-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed')}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active Orders {filteredActiveOrders.length > 0 && 
              <span className="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {filteredActiveOrders.length}
              </span>
            }
          </TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {filteredActiveOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredActiveOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="py-4 px-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order #{order.id.slice(-8)}</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge className={orderStatusColors[order.status]}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          {orderTypeIcons[order.orderType]}
                          <span className="ml-1 capitalize">{order.orderType.replace('_', '-')}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-500">Ordered on:</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-800 mb-2">Order Items</h3>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.juiceName} ({item.size}) × {item.quantity}</span>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between">
                          <span className="font-medium">Total Amount:</span>
                          <span className="font-bold">₹{order.totalAmount}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Customer Details</h3>
                        {order.orderType === OrderType.DELIVERY && order.address ? (
                          <div>
                            <div className="flex items-start mb-1">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                              <div>
                                <p className="font-medium">{order.address.name}</p>
                                <p className="text-sm text-gray-600">{order.address.address}</p>
                                <p className="text-sm text-gray-600">{order.address.city}, {order.address.pincode}</p>
                                <p className="text-sm text-gray-600 mt-1">Phone: {order.address.phone}</p>
                              </div>
                            </div>
                          </div>
                        ) : order.orderType === OrderType.DINE_IN && order.tableNo ? (
                          <div className="flex items-start">
                            <Clock className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                            <p className="font-medium">Table {order.tableNo}</p>
                          </div>
                        ) : (
                          <div className="flex items-start">
                            <ShoppingBag className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                            <p className="font-medium">Takeaway</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                      
                      <div className="flex flex-wrap gap-2">
                        {getNextStatus(order.status) && (
                          <Button
                            className="bg-primary-500 hover:bg-primary-600"
                            onClick={() => handleOrderStatusUpdate(order.id, getNextStatus(order.status)!)}
                          >
                            {order.status === OrderStatus.PLACED ? 'Confirm Order' : 
                             order.status === OrderStatus.CONFIRMED ? 'Start Preparing' :
                             order.status === OrderStatus.PREPARING ? 'Mark as Ready' :
                             order.status === OrderStatus.READY ? 'Out for Delivery' :
                             order.status === OrderStatus.OUT_FOR_DELIVERY ? 'Mark as Delivered' : 
                             'Update Status'}
                          </Button>
                        )}
                        
                        {![OrderStatus.CANCELLED, OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status) && (
                          <Button
                            variant="destructive"
                            onClick={() => handleOrderStatusUpdate(order.id, OrderStatus.CANCELLED)}
                          >
                            Cancel Order
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
              <h2 className="text-xl font-semibold text-gray-800 mb-3">No active orders found</h2>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more orders'
                  : 'There are no active orders at the moment'}
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {filteredCompletedOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredCompletedOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="py-4 px-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order #{order.id.slice(-8)}</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge className={orderStatusColors[order.status]}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="flex items-center">
                          {orderTypeIcons[order.orderType]}
                          <span className="ml-1 capitalize">{order.orderType.replace('_', '-')}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-sm text-gray-500">Ordered on:</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-800 mb-2">Order Items</h3>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.juiceName} ({item.size}) × {item.quantity}</span>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between">
                          <span className="font-medium">Total Amount:</span>
                          <span className="font-bold">₹{order.totalAmount}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Customer Details</h3>
                        {order.orderType === OrderType.DELIVERY && order.address ? (
                          <div>
                            <div className="flex items-start mb-1">
                              <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                              <div>
                                <p className="font-medium">{order.address.name}</p>
                                <p className="text-sm text-gray-600">{order.address.address}</p>
                                <p className="text-sm text-gray-600">{order.address.city}, {order.address.pincode}</p>
                                <p className="text-sm text-gray-600 mt-1">Phone: {order.address.phone}</p>
                              </div>
                            </div>
                          </div>
                        ) : order.orderType === OrderType.DINE_IN && order.tableNo ? (
                          <div className="flex items-start">
                            <Clock className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                            <p className="font-medium">Table {order.tableNo}</p>
                          </div>
                        ) : (
                          <div className="flex items-start">
                            <ShoppingBag className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                            <p className="font-medium">Takeaway</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">No completed orders found</h2>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more orders'
                  : 'There are no completed orders to display'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersManagement;
