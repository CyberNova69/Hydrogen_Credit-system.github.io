import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { FileText, Shield, Eye, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface LedgerEntry {
  txId: string;
  type: 'issue' | 'trade';
  from: string;
  to: string;
  credits: number;
  timestamp: string;
  verified: boolean;
}

interface CumulativeData {
  date: string;
  credits: number;
}

interface ProducerData {
  name: string;
  credits: number;
}

const PublicLedger: React.FC = () => {
  const { toast } = useToast();
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    {
      txId: "tx-1001",
      type: "issue",
      from: "reg-1",
      to: "prod-1",
      credits: 120,
      timestamp: "2025-08-01T10:00:00Z",
      verified: true
    },
    {
      txId: "tx-1002",
      type: "trade",
      from: "prod-1",
      to: "buyer-1",
      credits: 10,
      timestamp: "2025-08-05T12:00:00Z",
      verified: true
    }
  ]);
  const [filteredEntries, setFilteredEntries] = useState(ledgerEntries);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  
  // Filters
  const [producerFilter, setProducerFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for charts
  const cumulativeData: CumulativeData[] = [
    { date: '2025-07-01', credits: 0 },
    { date: '2025-07-15', credits: 85 },
    { date: '2025-08-01', credits: 120 },
    { date: '2025-08-15', credits: 145 },
    { date: '2025-08-30', credits: 200 },
  ];

  const top10Producers: ProducerData[] = [
    { name: 'GreenH2 Ltd', credits: 120 },
    { name: 'H2Works', credits: 80 },
    { name: 'CleanEnergy Co', credits: 65 },
    { name: 'EcoHydrogen', credits: 45 },
    { name: 'SustainableH2', credits: 35 },
    { name: 'BlueHydrogen Inc', credits: 28 },
    { name: 'FutureEnergy', credits: 22 },
    { name: 'HydrogenPro', credits: 18 },
    { name: 'GreenFuel Ltd', credits: 15 },
    { name: 'CleanTech H2', credits: 12 },
  ];

  const chartConfig = {
    credits: {
      label: "Credits",
      color: "hsl(var(--public))",
    },
  };

  const barChartConfig = {
    credits: {
      label: "Credits Issued",
      color: "hsl(var(--producer))",
    },
  };

  // Load ledger data
  useEffect(() => {
    loadLedgerData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...ledgerEntries];

    if (producerFilter) {
      filtered = filtered.filter(entry => 
        entry.from.toLowerCase().includes(producerFilter.toLowerCase()) ||
        entry.to.toLowerCase().includes(producerFilter.toLowerCase())
      );
    }

    if (dateFromFilter) {
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= new Date(dateFromFilter)
      );
    }

    if (dateToFilter) {
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) <= new Date(dateToFilter)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    // Sort by timestamp, newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredEntries(filtered);
  }, [ledgerEntries, producerFilter, dateFromFilter, dateToFilter, typeFilter]);

  const loadLedgerData = async () => {
    try {
      const response = await api.getLedger();
      if (response.data) {
        setLedgerEntries(response.data);
      }
    } catch (error) {
      console.error('Failed to load ledger data:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'issue': return 'bg-producer text-producer-foreground';
      case 'trade': return 'bg-buyer text-buyer-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'issue': return 'Issued';
      case 'trade': return 'Traded';
      default: return type;
    }
  };

  const clearFilters = () => {
    setProducerFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setTypeFilter('all');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-public">Public Ledger</h1>
          <p className="text-muted-foreground">Transparent record of all hydrogen credit transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-producer/10 text-producer">
            <Shield className="h-3 w-3 mr-1" />
            Verified by Regulator
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-3xl font-bold text-foreground">{ledgerEntries.length}</p>
              </div>
              <FileText className="h-8 w-8 text-public" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Issued</p>
                <p className="text-3xl font-bold text-producer">
                  {ledgerEntries.filter(e => e.type === 'issue').reduce((sum, e) => sum + e.credits, 0)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-producer/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-producer"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Traded</p>
                <p className="text-3xl font-bold text-buyer">
                  {ledgerEntries.filter(e => e.type === 'trade').reduce((sum, e) => sum + e.credits, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-buyer" />
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
              <BarChart3 className="h-8 w-8 text-public" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Credits Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Credits Over Time</CardTitle>
            <CardDescription>Total credits issued and circulating</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="credits" 
                  stroke="var(--color-credits)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-credits)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top 10 Producers */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Producers</CardTitle>
            <CardDescription>Leading hydrogen credit producers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[300px]">
              <BarChart data={top10Producers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="credits" fill="var(--color-credits)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Ledger Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="producer">Producer/Entity</Label>
              <Input
                id="producer"
                placeholder="Search by entity ID"
                value={producerFilter}
                onChange={(e) => setProducerFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="issue">Issued</SelectItem>
                  <SelectItem value="trade">Traded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Ledger</CardTitle>
          <CardDescription>
            Immutable record of all hydrogen credit transactions ({filteredEntries.length} entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <motion.tr
                  key={entry.txId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b"
                >
                  <TableCell className="font-mono">{entry.txId}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(entry.type)}>
                      {getTypeLabel(entry.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{entry.from}</TableCell>
                  <TableCell className="font-mono">{entry.to}</TableCell>
                  <TableCell className="font-semibold">{entry.credits}</TableCell>
                  <TableCell>{format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {entry.verified ? (
                      <Badge className="bg-producer/10 text-producer">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transaction Details</DialogTitle>
                        </DialogHeader>
                        {selectedEntry && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Transaction ID</Label>
                                <p className="font-mono text-sm">{selectedEntry.txId}</p>
                              </div>
                              <div>
                                <Label>Type</Label>
                                <Badge className={getTypeColor(selectedEntry.type)}>
                                  {getTypeLabel(selectedEntry.type)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>From</Label>
                                <p className="font-mono text-sm">{selectedEntry.from}</p>
                              </div>
                              <div>
                                <Label>To</Label>
                                <p className="font-mono text-sm">{selectedEntry.to}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Credits</Label>
                                <p className="text-2xl font-bold">{selectedEntry.credits}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                {selectedEntry.verified ? (
                                  <Badge className="bg-producer/10 text-producer">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified by Regulator
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Pending Verification</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <Label>Timestamp</Label>
                              <p>{format(new Date(selectedEntry.timestamp), 'PPpp')}</p>
                            </div>
                            
                            <div className="p-4 bg-muted rounded-lg">
                              <h4 className="font-semibold mb-2">Transaction Hash (Mock)</h4>
                              <p className="font-mono text-xs break-all">
                                0x{selectedEntry.txId.replace('tx-', '')}a1b2c3d4e5f6789012345678901234567890abcdef
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PublicLedger;