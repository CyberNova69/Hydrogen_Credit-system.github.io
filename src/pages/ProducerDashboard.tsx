import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Factory, TrendingUp, Upload, Plus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductionReport {
  reportId: string;
  producerId: string;
  tons: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  timestamp: string;
  notes?: string;
  file?: string;
}

interface Transaction {
  txId: string;
  type: 'issue' | 'trade';
  amount: number;
  counterparty?: string;
  timestamp: string;
  status: 'pending' | 'completed';
}

const ProducerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [productionDate, setProductionDate] = useState<Date | undefined>(new Date());
  const [tons, setTons] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProductionReport | null>(null);
  const [offerCredits, setOfferCredits] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [createOfferOpen, setCreateOfferOpen] = useState(false);

  // Redirect if not producer
  useEffect(() => {
    if (user && user.role !== 'producer') {
      window.location.href = '/';
      return;
    }
  }, [user]);

  // Load data
  useEffect(() => {
    if (user) {
      loadUserTransactions();
    }
  }, [user]);

  const loadUserTransactions = async () => {
    try {
      if (user) {
        const response = await api.getUserTransactions(user.id);
        setTransactions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const saveDraft = async () => {
    if (!user || !tons || parseFloat(tons) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount of tons produced",
        variant: "destructive",
      });
      return;
    }

    try {
      const newReport: ProductionReport = {
        reportId: `rep-${Date.now()}`,
        producerId: user.id,
        tons: parseFloat(tons),
        status: 'draft',
        timestamp: new Date().toISOString(),
        notes,
        file: fileName,
      };

      setReports([...reports, newReport]);
      
      // Reset form
      setTons('');
      setNotes('');
      setFileName('');
      setProductionDate(new Date());

      toast({
        title: "Success",
        description: "Production report saved as draft",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    }
  };

  const submitForVerification = async () => {
    if (!user || !tons || parseFloat(tons) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount of tons produced",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitProduction({
        producerId: user.id,
        tons: parseFloat(tons),
        notes,
        file: fileName,
      });

      const newReport: ProductionReport = {
        reportId: `rep-${Date.now()}`,
        producerId: user.id,
        tons: parseFloat(tons),
        status: 'submitted',
        timestamp: new Date().toISOString(),
        notes,
        file: fileName,
      };

      setReports([...reports, newReport]);
      
      // Reset form
      setTons('');
      setNotes('');
      setFileName('');
      setProductionDate(new Date());

      toast({
        title: "Success",
        description: "Production report submitted for verification",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createOffer = async () => {
    if (!user || !offerCredits || !offerPrice || parseFloat(offerCredits) <= 0 || parseFloat(offerPrice) <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid credit amount and price",
        variant: "destructive",
      });
      return;
    }

    if ((user.credits || 0) < parseFloat(offerCredits)) {
      toast({
        title: "Error",
        description: "Insufficient credits available",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.createOffer({
        producerId: user.id,
        creditsAvailable: parseFloat(offerCredits),
        pricePerCredit: parseFloat(offerPrice),
      });

      setOfferCredits('');
      setOfferPrice('');
      setCreateOfferOpen(false);

      toast({
        title: "Success",
        description: "Offer created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-producer text-producer-foreground';
      case 'submitted': return 'bg-buyer text-buyer-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!user || user.role !== 'producer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You must be logged in as a producer to access this page.</p>
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
          <h1 className="text-3xl font-bold text-producer">Producer Dashboard</h1>
          <p className="text-muted-foreground">Manage your hydrogen production and credits</p>
        </div>
        <Dialog open={createOfferOpen} onOpenChange={setCreateOfferOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-producer hover:bg-producer/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Marketplace Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="offerCredits">Credits to Sell</Label>
                <Input
                  id="offerCredits"
                  type="number"
                  placeholder="Enter number of credits"
                  value={offerCredits}
                  onChange={(e) => setOfferCredits(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available: {user.credits || 0} credits
                </p>
              </div>
              <div>
                <Label htmlFor="offerPrice">Price per Credit ($)</Label>
                <Input
                  id="offerPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter price per credit"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
              </div>
              <Button onClick={createOffer} className="w-full">
                Create Offer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-producer">
            <Factory className="h-5 w-5 mr-2" />
            {user.name} - Production Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-producer">{user.credits || 0}</div>
              <div className="text-sm text-muted-foreground">Current Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {reports.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.tons, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Tons Produced</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{reports.length}</div>
              <div className="text-sm text-muted-foreground">Production Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Production Report</CardTitle>
          <CardDescription>
            Submit your hydrogen production data for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Production Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !productionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {productionDate ? format(productionDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={productionDate}
                    onSelect={setProductionDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="tons">Tons Produced</Label>
              <Input
                id="tons"
                type="number"
                step="0.01"
                placeholder="Enter tons of hydrogen produced"
                value={tons}
                onChange={(e) => setTons(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="file">Attach Production Certificate (PDF)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {fileName && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {fileName}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes about this production batch..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={saveDraft}
              disabled={!tons || parseFloat(tons) <= 0}
            >
              Save Draft
            </Button>
            <Button 
              onClick={submitForVerification}
              disabled={isSubmitting || !tons || parseFloat(tons) <= 0}
              className="bg-producer hover:bg-producer/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credits & Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Credits & Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.reportId}>
                  <TableCell className="font-mono">{report.reportId}</TableCell>
                  <TableCell>{format(new Date(report.timestamp), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>Production</TableCell>
                  <TableCell>{report.tons} tons</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                          <DialogTitle>Production Report Details</DialogTitle>
                        </DialogHeader>
                        {selectedReport && (
                          <div className="space-y-4">
                            <div>
                              <Label>Report ID</Label>
                              <p className="font-mono">{selectedReport.reportId}</p>
                            </div>
                            <div>
                              <Label>Production Amount</Label>
                              <p>{selectedReport.tons} tons</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Badge className={getStatusColor(selectedReport.status)}>
                                {selectedReport.status}
                              </Badge>
                            </div>
                            <div>
                              <Label>Submitted</Label>
                              <p>{format(new Date(selectedReport.timestamp), 'PPP')}</p>
                            </div>
                            {selectedReport.notes && (
                              <div>
                                <Label>Notes</Label>
                                <p>{selectedReport.notes}</p>
                              </div>
                            )}
                            {selectedReport.file && (
                              <div>
                                <Label>Attached File</Label>
                                <p>{selectedReport.file}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.map((tx) => (
                <TableRow key={tx.txId}>
                  <TableCell className="font-mono">{tx.txId}</TableCell>
                  <TableCell>{format(new Date(tx.timestamp), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="capitalize">{tx.type}</TableCell>
                  <TableCell>{tx.amount} credits</TableCell>
                  <TableCell>{tx.counterparty || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProducerDashboard;