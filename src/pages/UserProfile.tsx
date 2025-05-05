
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types/models';
import { getUserOrders } from '@/services/api';
import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Redirect to login if not logged in
  if (!user) {
    navigate('/login', { state: { redirectTo: '/profile' } });
    return null;
  }
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary-600 text-2xl font-bold">{user.name.charAt(0)}</span>
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-3">
                <Button 
                  onClick={() => navigate('/profile/edit')}
                  variant="outline"
                  className="w-full"
                >
                  Edit Profile
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList className="mb-6">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                  <CardDescription>View your order history and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/orders')}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    View All Orders
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="addresses" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>My Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.addresses.length > 0 ? (
                    <div className="space-y-4">
                      {user.addresses.map((address) => (
                        <div 
                          key={address.id}
                          className={`border rounded-lg p-4 relative ${address.isDefault ? 'border-primary-500 bg-primary-50' : ''}`}
                        >
                          {address.isDefault && (
                            <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                          <h3 className="font-medium text-gray-800">{address.name}</h3>
                          <p className="text-gray-600 mt-1">{address.address}</p>
                          <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                          <p className="text-gray-600 mt-1">Phone: {address.phone}</p>
                          
                          <div className="mt-3 pt-3 border-t flex justify-end space-x-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/profile/addresses/edit/${address.id}`)}
                            >
                              Edit
                            </Button>
                            {!address.isDefault && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  /* In a real app this would call an API */
                                  toast.success('Address deleted');
                                }}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">You don't have any saved addresses yet.</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => navigate('/profile/addresses/add')}
                    className="w-full bg-primary-500 hover:bg-primary-600"
                  >
                    Add New Address
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
