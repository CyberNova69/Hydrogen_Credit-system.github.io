const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Path to connection profile
const ccpPath = path.resolve(__dirname, "../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json");
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

// ===== API Routes =====

// Buyer purchases credits
app.post("/api/purchase", async (req, res) => {
  try {
    const { buyerId, producerId, amount } = req.body;

    const wallet = await Wallets.newFileSystemWallet("./wallet");
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "appUser",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("hydrogenCC");

    await contract.submitTransaction("PurchaseCredits", buyerId, producerId, amount.toString());

    res.json({ status: "success", buyerId, producerId, amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Regulator approves production
app.post("/api/approve", async (req, res) => {
  try {
    const { producerId, quantity } = req.body;
    res.json({ status: "approved", producerId, quantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public ledger view
app.get("/api/ledger", async (req, res) => {
  try {
    res.json({ credits: [{ id: "asset1", owner: "Alice", value: 100 }] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
