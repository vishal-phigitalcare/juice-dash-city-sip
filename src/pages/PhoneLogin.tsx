
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const PhoneLogin: React.FC = () => {
  const navigate = useNavigate();
  const { requestPhoneOTP, loginWithPhone } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      await requestPhoneOTP(phone);
      setOtpSent(true);
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP sent to your phone');
      return;
    }
    
    setLoading(true);
    
    try {
      await loginWithPhone(phone, otp);
      navigate('/');
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login with Phone</CardTitle>
            <CardDescription className="text-center">
              {otpSent 
                ? `Enter the OTP sent to ${phone}`
                : 'Enter your phone number to login or create an account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="Enter your 10-digit phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
                
                <div className="text-center mt-2">
                  <Button variant="link" onClick={() => setOtpSent(false)} type="button">
                    Change Phone Number
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm">
              <span className="text-gray-600">Want to use password login? </span>
              <Link to="/login" className="text-primary-600 hover:underline">
                Login with Email
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PhoneLogin;
