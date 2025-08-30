import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { Shield, FileCheck, AlertCircle, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

interface PendingReport {
  reportId: string;
  producerId: string;
  producerName: string;
  tons: number;
  timestamp: string;
  notes?: string;
  file?: string;
  status: 'submitted';
}

interface MonthlyData {
  month: string;
  producer1: number;
  producer2: number;
  producer3: number;
}

interface CreditDistribution {
  name: string;
  value: number;
  color: string;
}

const RegulatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([
    {
      reportId: "rep-1",
      producerId: "prod-2",
      producerName: "H2Works",
      tons: 40,
      status: "submitted",
      timestamp: "2025-08-28T09:00:00Z",
      notes: "High-quality electrolysis production batch",
      file: "production-certificate-aug-28.pdf"
    }
  ]);
  const [selectedReport, setSelectedReport] = useState<PendingReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data for charts
  const monthlyData: MonthlyData[] = [
    { month: 'Jan', producer1: 65, producer2: 28, producer3: 45 },
    { month: 'Feb', producer1: 75, producer2: 32, producer3: 52 },
    { month: 'Mar', producer1: 85, producer2: 38, producer3: 58 },
    { month: 'Apr', producer1: 78, producer2: 42, producer3: 65 },
    { month: 'May', producer1: 92, producer2: 48, producer3: 71 },
    { month: 'Jun', producer1: 88, producer2: 52, producer3: 68 },
    { month: 'Jul', producer1: 95, producer2: 58, producer3: 75 },
    { month: 'Aug', producer1: 102, producer2: 62, producer3: 82 },
  ];

  const creditDistribution: CreditDistribution[] = [
    { name: 'GreenH2 Ltd', value: 120, color: 'hsl(var(--producer))' },
    { name: 'H2Works', value: 80, color: 'hsl(var(--public))' },
    { name: 'CleanEnergy Co', value: 45, color: 'hsl(var(--buyer))' },
    { name: 'EcoHydrogen', value: 35, color: 'hsl(var(--regulator))' },
  ];

  const chartConfig = {
    producer1: {
      label: "GreenH2 Ltd",
      color: "hsl(var(--producer))",
    },
    producer2: {
      label: "H2Works", 
      color: "hsl(var(--public))",
    },
    producer3: {
      label: "CleanEnergy Co",
      color: "hsl(var(--buyer))",
    },
  };

  // Redirect if not regulator
  useEffect(() => {
    if (user && user.role !== 'regulator') {
      window.location.href = '/';
      return;
    }
  }, [user]);

  // Load pending reports
  useEffect(() => {
    if (user && user.role === 'regulator') {
      loadPendingReports();
    }
  }, [user]);

  const loadPendingReports = async () => {
    try {
      const response = await api.getPendingReports();
      if (response.data) {
        setPendingReports(response.data);
      }
    } catch (error) {
      console.error('Failed to load pending reports:', error);
    }
  };

  const approveReport = async (report: PendingReport) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      await api.approveReport({
        reportId: report.reportId,
        regulatorId: user.id,
      });

      // Remove from pending reports
      setPendingReports(prev => prev.filter(r => r.reportId !== report.reportId));

      toast({
        title: "Success",
        description: `Approved ${report.tons} tons production. Credits issued to ${report.producerName}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectReport = async (report: PendingReport) => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // In a real implementation, there would be a reject endpoint
      // For now, we'll just remove it from the pending list
      setPendingReports(prev => prev.filter(r => r.reportId !== report.reportId));

      toast({
        title: "Report Rejected",
        description: `Production report from ${report.producerName} has been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject report",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.role !== 'regulator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You must be logged in as a regulator to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-regulator">Regulatory Dashboard</h1>
          <p className="text-muted-foreground">Oversee and verify hydrogen production reports</p>
        </div>
        <Button variant="outline" className="border-regulator text-regulator hover:bg-regulator hover:text-regulator-foreground">
          <Download className="h-4 w-4 mr-2" />
          Export PDF Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                <p className="text-3xl font-bold text-regulator">{pendingReports.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-regulator" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold text-foreground">347</p>
                <p className="text-sm text-muted-foreground">tons verified</p>
              </div>
              <FileCheck className="h-8 w-8 text-producer" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-3xl font-bold text-foreground">280</p>
                <p className="text-sm text-muted-foreground">issued</p>
              </div>
              <Shield className="h-8 w-8 text-public" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Producers</p>
                <p className="text-3xl font-bold text-foreground">4</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-producer/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-producer"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reports Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-regulator">Pending Production Reports</CardTitle>
            <CardDescription>
              Review and approve submitted production reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending reports to review</p>
              </div>
            ) : (
              pendingReports.map((report) => (
                <motion.div
                  key={report.reportId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{report.producerName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.tons} tons • {format(new Date(report.timestamp), 'MMM dd, yyyy')}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {report.reportId}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Production Report Review</DialogTitle>
                          </DialogHeader>
                          {selectedReport && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold">Producer</h4>
                                <p>{selectedReport.producerName}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Production Amount</h4>
                                <p>{selectedReport.tons} tons of hydrogen</p>
                              </div>
                              <div>
                                <h4 className="font-semibold">Submitted</h4>
                                <p>{format(new Date(selectedReport.timestamp), 'PPP')}</p>
                              </div>
                              {selectedReport.notes && (
                                <div>
                                  <h4 className="font-semibold">Notes</h4>
                                  <p>{selectedReport.notes}</p>
                                </div>
                              )}
                              {selectedReport.file && (
                                <div>
                                  <h4 className="font-semibold">Attached Document</h4>
                                  <p className="text-blue-600 hover:underline cursor-pointer">
                                    {selectedReport.file}
                                  </p>
                                </div>
                              )}
                              <div className="flex space-x-2 pt-4">
                                <Button 
                                  onClick={() => approveReport(selectedReport)}
                                  disabled={isProcessing}
                                  className="bg-producer hover:bg-producer/90"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve & Issue Credits
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => rejectReport(selectedReport)}
                                  disabled={isProcessing}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => approveReport(report)}
                      disabled={isProcessing}
                      className="bg-producer hover:bg-producer/90 text-producer-foreground"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectReport(report)}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Monthly Production Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Production by Producer</CardTitle>
            <CardDescription>Hydrogen production trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="producer1" fill="var(--color-producer1)" />
                <Bar dataKey="producer2" fill="var(--color-producer2)" />
                <Bar dataKey="producer3" fill="var(--color-producer3)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Credits Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Credits Distribution by Producer</CardTitle>
          <CardDescription>Current credit allocation across registered producers</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={creditDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {creditDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegulatorDashboard;