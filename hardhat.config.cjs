module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true
    }
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/wTVReTh5ooHgm95FUBWYG",
      accounts: ["6d99aec052cce1f254f90321c75e700106dc36417b630c300dd8779410f970d3"]
    }
  }
};

