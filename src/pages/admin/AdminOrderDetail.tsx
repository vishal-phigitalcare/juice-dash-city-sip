
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus, OrderType, CupSize } from '@/types/models';
import { getOrderById, updateOrderStatus } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MapPin, ShoppingBag, Clock, User, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react';

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
  [OrderType.DELIVERY]: <MapPin className="h-5 w-5" />,
  [OrderType.TAKEAWAY]: <ShoppingBag className="h-5 w-5" />,
  [OrderType.DINE_IN]: <Clock className="h-5 w-5" />
};

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        
        if (orderData) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      setOrder(updatedOrder);
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };
  
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PLACED:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return order?.orderType === OrderStatus.DELIVERY ? OrderStatus.OUT_FOR_DELIVERY : OrderStatus.COMPLETED;
      case OrderStatus.OUT_FOR_DELIVERY:
        return OrderStatus.DELIVERED;
      case OrderStatus.DELIVERED:
        return OrderStatus.COMPLETED;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-8">The order you're looking for doesn't exist.</p>
        <Button 
          onClick={() => navigate('/admin/orders')}
          className="bg-primary-500 hover:bg-primary-600"
        >
          Back to Orders
        </Button>
      </div>
    );
  }
  
  const nextStatus = getNextStatus(order.status);
  const isActiveOrder = ![OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/orders')}
          className="text-gray-600"
        >
          Back to Orders
        </Button>
      </div>
      
      <div className="mb-6 flex flex-wrap justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order #{order.id.slice(-8)}</h1>
          <div className="flex items-center mt-2">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center">
          <Badge className={`${orderStatusColors[order.status]} text-sm px-3 py-1`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline" className="ml-2 flex items-center">
            {orderTypeIcons[order.orderType]}
            <span className="ml-1 capitalize">{order.orderType.replace('_', '-')}</span>
          </Badge>
        </div>
      </div>
      
      {isActiveOrder && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {nextStatus && (
                <Button
                  onClick={() => handleUpdateStatus(nextStatus)}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {order.status === OrderStatus.PLACED ? 'Confirm Order' : 
                   order.status === OrderStatus.CONFIRMED ? 'Start Preparing' :
                   order.status === OrderStatus.PREPARING ? 'Mark as Ready' :
                   order.status === OrderStatus.READY ? 
                    (order.orderType === OrderType.DELIVERY ? 'Out for Delivery' : 'Mark as Completed') :
                   order.status === OrderStatus.OUT_FOR_DELIVERY ? 'Mark as Delivered' :
                   'Complete Order'}
                </Button>
              )}
              
              {order.status !== OrderStatus.CANCELLED && (
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(OrderStatus.CANCELLED)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.juiceName} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{item.juiceName}</h3>
                        <p className="text-sm text-gray-500">
                          {sizeLabels[item.size]} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-3" />
                      <span>User ID: {order.userId}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-3" />
                      <span>{order.address?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">
                    {order.orderType === OrderType.DELIVERY ? 'Delivery Address' :
                     order.orderType === OrderType.DINE_IN ? 'Table Information' :
                     'Pickup Information'}
                  </h3>
                  
                  {order.orderType === OrderType.DELIVERY && order.address ? (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-primary-500 mt-1 mr-2" />
                        <div>
                          <p className="font-medium">{order.address.name}</p>
                          <p className="text-sm text-gray-600">{order.address.address}</p>
                          <p className="text-sm text-gray-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                        </div>
                      </div>
                    </div>
                  ) : order.orderType === OrderType.DINE_IN && order.tableNo ? (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 text-primary-500 mt-1 mr-2" />
                        <p className="font-medium">Table {order.tableNo}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <ShoppingBag className="h-4 w-4 text-primary-500 mt-1 mr-2" />
                        <p className="font-medium">Takeaway</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{
                  order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">₹{order.orderType === OrderType.DELIVERY ? 40 : 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-lg">₹{order.totalAmount}</span>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment ID</span>
                  <span>{order.paymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Payment Method</span>
                  <span>Online Payment</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Additional timeline items would be added here based on order history */}
                
                <div className="flex items-start">
                  <div className={`${
                    order.status === OrderStatus.CANCELLED ? 'bg-red-100' : 'bg-green-100'
                  } rounded-full p-1 mr-3`}>
                    {order.status === OrderStatus.CANCELLED ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Current Status: {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}</p>
                    <p className="text-sm text-gray-500">{new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
