import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Atom, User, Building2, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    company: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get the intended destination or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already logged in
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in username and select a role",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.username, formData.role, formData.email, formData.company);
      toast({
        title: "Welcome!",
        description: `Successfully logged in as ${formData.role}`,
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'producer': return 'text-producer';
      case 'buyer': return 'text-buyer';
      case 'regulator': return 'text-regulator';
      case 'public': return 'text-public';
      default: return 'text-foreground';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'producer': return 'Generate and sell hydrogen credits';
      case 'buyer': return 'Purchase hydrogen credits from producers';
      case 'regulator': return 'Approve production reports and monitor compliance';
      case 'public': return 'View public ledger and market transparency';
      default: return 'Select your role to continue';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Atom className="h-10 w-10 text-producer" />
            <span className="text-2xl font-bold bg-gradient-to-r from-producer to-public bg-clip-text text-transparent">
              HydrogenCredit
            </span>
          </div>
          <p className="text-muted-foreground">
            Please login first to access the platform
          </p>
        </motion.div>

        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your details to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Enter your company name"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producer">
                      <div className="flex flex-col items-start">
                        <span className="text-producer font-medium">Producer</span>
                        <span className="text-xs text-muted-foreground">Generate hydrogen credits</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="buyer">
                      <div className="flex flex-col items-start">
                        <span className="text-buyer font-medium">Buyer</span>
                        <span className="text-xs text-muted-foreground">Purchase hydrogen credits</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="regulator">
                      <div className="flex flex-col items-start">
                        <span className="text-regulator font-medium">Regulator</span>
                        <span className="text-xs text-muted-foreground">Monitor compliance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex flex-col items-start">
                        <span className="text-public font-medium">Public</span>
                        <span className="text-xs text-muted-foreground">View transparency data</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.role && (
                  <p className={`text-sm ${getRoleColor(formData.role)}`}>
                    {getRoleDescription(formData.role)}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <KeyRound className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Demo Mode - No password required</p>
              <p className="text-xs mt-1">Simply enter a username and select your role</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;