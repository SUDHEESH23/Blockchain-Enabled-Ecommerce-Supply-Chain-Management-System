import Web3 from "web3";

export const formatPrice = (price) => (price ? Web3.utils.fromWei(price, "ether") : "0");

