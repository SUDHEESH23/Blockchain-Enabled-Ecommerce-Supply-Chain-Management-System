module.exports = {
  networks: {
    ganache: { // Changed from "Ganache" to "ganache"
      host: "127.0.0.1",    // Localhost (default: none)
      port: 7545,           // Standard Ganache GUI port
      network_id: "*",      // Match any network id (default: any)
      gas: 6721975,         // Gas limit for deploying
      gasPrice: 20000000000 // Gas price in wei
    }
  },
  compilers: {
    solc: {
      version: "0.8.0", // Make sure the version matches your contract
    }
  }
};
