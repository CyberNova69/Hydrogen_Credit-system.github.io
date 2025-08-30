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
import { ShoppingCart, Wallet, TrendingUp, Download, Eye, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface MarketplaceListing {
  offerId: string;
  producerId: string;
  producerName: string;
  creditsAvailable: number;
  pricePerCredit: number;
}

interface Transaction {
  txId: string;
  type: 'trade';
  amount: number;
  counterparty: string;
  timestamp: string;
  status: 'pending' | 'completed';
  pricePerCredit?: number;
  totalPrice?: number;
}

const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketplaceListing[]>([
    {
      offerId: "offer-1",
      producerId: "prod-1",
      producerName: "GreenH2 Ltd",
      creditsAvailable: 50,
      pricePerCredit: 20
    },
    {
      offerId: "offer-2",
      producerId: "prod-2",
      producerName: "H2Works",
      creditsAvailable: 30,
      pricePerCredit: 18
    }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  
  // Filters
  const [minCredits, setMinCredits] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  const [filteredListings, setFilteredListings] = useState(listings);

  // Redirect if not buyer
  useEffect(() => {
    if (user && user.role !== 'buyer') {
      window.location.href = '/';
      return;
    }
  }, [user]);

  // Load data
  useEffect(() => {
    if (user && user.role === 'buyer') {
      loadMarketplace();
      loadUserTransactions();
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...listings];

    // Apply filters
    if (minCredits) {
      filtered = filtered.filter(l => l.creditsAvailable >= parseInt(minCredits));
    }
    if (maxPrice) {
      filtered = filtered.filter(l => l.pricePerCredit <= parseFloat(maxPrice));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.pricePerCredit - b.pricePerCredit;
        case 'price-desc':
          return b.pricePerCredit - a.pricePerCredit;
        case 'credits-asc':
          return a.creditsAvailable - b.creditsAvailable;
        case 'credits-desc':
          return b.creditsAvailable - a.creditsAvailable;
        case 'producer':
          return a.producerName.localeCompare(b.producerName);
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  }, [listings, minCredits, maxPrice, sortBy]);

  const loadMarketplace = async () => {
    try {
      const response = await api.getMarketplace();
      if (response.data) {
        setListings(response.data);
      }
    } catch (error) {
      console.error('Failed to load marketplace:', error);
    }
  };

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

  const executePurchase = async () => {
    if (!user || !selectedListing || !purchaseQuantity) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(purchaseQuantity);
    const totalPrice = quantity * selectedListing.pricePerCredit;

    if (quantity <= 0 || quantity > selectedListing.creditsAvailable) {
      toast({
        title: "Error",
        description: "Invalid quantity selected",
        variant: "destructive",
      });
      return;
    }

    if ((user.budget || 0) < totalPrice) {
      toast({
        title: "Error",
        description: "Insufficient budget for this purchase",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);
    try {
      await api.executeTrade({
        buyerId: user.id,
        offerId: selectedListing.offerId,
        quantity,
      });

      // Update local state
      setListings(prev => prev.map(l => 
        l.offerId === selectedListing.offerId 
          ? { ...l, creditsAvailable: l.creditsAvailable - quantity }
          : l
      ).filter(l => l.creditsAvailable > 0));

      // Add transaction to local state
      const newTransaction: Transaction = {
        txId: `tx-${Date.now()}`,
        type: 'trade',
        amount: quantity,
        counterparty: selectedListing.producerName,
        timestamp: new Date().toISOString(),
        status: 'completed',
        pricePerCredit: selectedListing.pricePerCredit,
        totalPrice,
      };
      setTransactions(prev => [newTransaction, ...prev]);

      setBuyModalOpen(false);
      setPurchaseQuantity('');
      setSelectedListing(null);

      toast({
        title: "Success",
        description: `Purchased ${quantity} credits from ${selectedListing.producerName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete purchase",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const openBuyModal = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setBuyModalOpen(true);
    setPurchaseQuantity('');
  };

  const exportTransactions = () => {
    // Mock CSV export
    toast({
      title: "Export Started",
      description: "Transaction history is being prepared for download",
    });
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You must be logged in as a buyer to access this page.</p>
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
          <h1 className="text-3xl font-bold text-buyer">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Purchase hydrogen credits from verified producers</p>
        </div>
        <Button 
          variant="outline" 
          onClick={exportTransactions}
          className="border-buyer text-buyer hover:bg-buyer hover:text-buyer-foreground"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Owned</p>
                <p className="text-3xl font-bold text-buyer">{user.credits || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-buyer" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Budget</p>
                <p className="text-3xl font-bold text-foreground">${user.budget || 0}</p>
              </div>
              <Wallet className="h-8 w-8 text-producer" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                <p className="text-3xl font-bold text-foreground">{transactions.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-public" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Marketplace Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="minCredits">Min Credits</Label>
              <Input
                id="minCredits"
                type="number"
                placeholder="Minimum credits"
                value={minCredits}
                onChange={(e) => setMinCredits(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                step="0.01"
                placeholder="Maximum price per credit"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="credits-asc">Credits: Low to High</SelectItem>
                  <SelectItem value="credits-desc">Credits: High to Low</SelectItem>
                  <SelectItem value="producer">Producer Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setMinCredits('');
                  setMaxPrice('');
                  setSortBy('price-asc');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Available Credits</CardTitle>
          <CardDescription>
            Purchase credits from verified hydrogen producers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producer</TableHead>
                <TableHead>Available Credits</TableHead>
                <TableHead>Price per Credit</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.offerId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{listing.producerName}</div>
                      <div className="text-sm text-muted-foreground">
                        Producer ID: {listing.producerId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {listing.creditsAvailable} credits
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    ${listing.pricePerCredit.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono">
                    ${(listing.creditsAvailable * listing.pricePerCredit).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm"
                      onClick={() => openBuyModal(listing)}
                      className="bg-buyer hover:bg-buyer/90 text-buyer-foreground"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Buy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredListings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No credits available matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your credit purchase history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Producer</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Price/Credit</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.txId}>
                  <TableCell className="font-mono">{tx.txId}</TableCell>
                  <TableCell>{format(new Date(tx.timestamp), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{tx.counterparty}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell className="font-mono">
                    ${tx.pricePerCredit?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono">
                    ${tx.totalPrice?.toFixed(2) || 'N/A'}
                  </TableCell>
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

          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buy Modal */}
      <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Credits</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Producer</h4>
                <p>{selectedListing.producerName}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Available Credits</h4>
                <p>{selectedListing.creditsAvailable} credits</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Price per Credit</h4>
                <p>${selectedListing.pricePerCredit.toFixed(2)}</p>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity to Purchase</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedListing.creditsAvailable}
                  placeholder="Enter quantity"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(e.target.value)}
                />
              </div>
              
              {purchaseQuantity && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{purchaseQuantity} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per credit:</span>
                    <span>${selectedListing.pricePerCredit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${(parseInt(purchaseQuantity || '0') * selectedListing.pricePerCredit).toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={executePurchase}
                disabled={isPurchasing || !purchaseQuantity || parseInt(purchaseQuantity) <= 0}
                className="w-full bg-buyer hover:bg-buyer/90 text-buyer-foreground"
              >
                {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BuyerDashboard;