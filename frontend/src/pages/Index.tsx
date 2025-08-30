import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Search, ShoppingCart, TrendingUp, Factory, Atom, Eye, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { Header } from '@/components/shared/Header';

interface MarketplaceListing {
  offerId: string;
  producerId: string;
  producerName: string;
  creditsAvailable: number;
  pricePerCredit: number;
}

interface MarketStats {
  totalCredits: number;
  totalProduction: number;
  activeProducers: number;
  avgPrice: number;
}

const Index: React.FC = () => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const marketStats: MarketStats = {
    totalCredits: 200,
    totalProduction: 347,
    activeProducers: 4,
    avgPrice: 19.5
  };

  // Load marketplace data
  useEffect(() => {
    loadMarketplace();
  }, []);

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

  const filteredListings = listings.filter(listing =>
    listing.producerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const openBuyModal = (listing: MarketplaceListing) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits",
        variant: "destructive",
      });
      return;
    }
    setSelectedListing(listing);
    setBuyModalOpen(true);
    setPurchaseQuantity('');
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

  const topSellers = [...listings]
    .sort((a, b) => b.creditsAvailable - a.creditsAvailable)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-producer/5 via-public/5 to-buyer/5 py-20"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Atom className="h-16 w-16 mx-auto mb-6 text-producer" />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-producer via-public to-buyer bg-clip-text text-transparent">
              Hydrogen Credit Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The world's first transparent marketplace for verified hydrogen credits. 
              1 ton of hydrogen = 1 credit. Fully regulated and blockchain-verified.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search hydrogen producers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-producer">{marketStats.totalCredits}</div>
                <div className="text-sm text-muted-foreground">Credits Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-public">{marketStats.totalProduction}</div>
                <div className="text-sm text-muted-foreground">Tons Produced</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-regulator">{marketStats.activeProducers}</div>
                <div className="text-sm text-muted-foreground">Active Producers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-buyer">${marketStats.avgPrice}</div>
                <div className="text-sm text-muted-foreground">Avg. Price</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Top Sellers Carousel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Top Producers</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSellers.map((seller, index) => (
              <motion.div
                key={seller.offerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-producer">{seller.producerName}</CardTitle>
                      {index === 0 && <Star className="h-5 w-5 text-buyer fill-current" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-semibold">{seller.creditsAvailable} credits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">${seller.pricePerCredit}/credit</span>
                      </div>
                      <Button 
                        onClick={() => openBuyModal(seller)}
                        className="w-full mt-4 bg-producer hover:bg-producer/90"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Live Ledger Snapshot */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-public" />
                Live Market Activity
              </CardTitle>
              <CardDescription>Recent transactions on the hydrogen credit network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-producer rounded-full animate-pulse"></div>
                    <span className="text-sm">GreenH2 Ltd issued 45 new credits</span>
                  </div>
                  <Badge variant="secondary">2 min ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-buyer rounded-full animate-pulse"></div>
                    <span className="text-sm">BlueCorp purchased 15 credits from H2Works</span>
                  </div>
                  <Badge variant="secondary">5 min ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-regulator rounded-full animate-pulse"></div>
                    <span className="text-sm">Production report verified by regulator</span>
                  </div>
                  <Badge variant="secondary">8 min ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Market Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Market Listings</CardTitle>
              <CardDescription>
                All available hydrogen credits from verified producers
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
                        <div className="flex items-center space-x-3">
                          <Factory className="h-5 w-5 text-producer" />
                          <div>
                            <div className="font-medium">{listing.producerName}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {listing.producerId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-producer/10 text-producer">
                          {listing.creditsAvailable} credits
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        ${listing.pricePerCredit.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono">
                        ${(listing.creditsAvailable * listing.pricePerCredit).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => openBuyModal(listing)}
                            className="bg-buyer hover:bg-buyer/90 text-buyer-foreground"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredListings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No producers found matching "{searchQuery}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center py-12 bg-gradient-to-r from-producer/10 via-public/10 to-buyer/10 rounded-2xl"
        >
          <h2 className="text-3xl font-bold mb-4">Join the Hydrogen Economy</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a producer, buyer, or regulator, be part of the clean energy revolution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-producer hover:bg-producer/90 text-producer-foreground">
              Register as Producer
            </Button>
            <Button className="bg-buyer hover:bg-buyer/90 text-buyer-foreground">
              Start Buying Credits
            </Button>
            <Button variant="outline" className="border-regulator text-regulator hover:bg-regulator hover:text-regulator-foreground">
              Regulatory Portal
            </Button>
          </div>
        </motion.section>
      </div>

      {/* Buy Modal */}
      <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Hydrogen Credits</DialogTitle>
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
    </div>
  );
};

export default Index;
