const express = require("express");
const app = express();
const cors = require("cors");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const {
  utf8ToBytes,
  toHex,
  hexToBytes,
} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x6568f153163460a1448cd7e7761f5c0fd8c67096": 101, // a0b3cbd40d6b19c8b6d41f3e087e93e5e2ac4a44ede517278208caa37bc8e35c 02a1d34e5281ebd52d09eef6afe4e25bc1ba9789f76c4443d3b38d265a3a403325
  "0x0d61988e047fc57b82aaaaab8d1ec011f474e114": 50, // 552258d7e0d0bf0b0210dfb2543cdf1fbf9d117fb4b755285c3a8bd50915f9a8 020db1814716fec9af473d4a6fed9e373c1081aacc0bf2b8d27e9fd88ae2678fd1
  "0x5a7d5a4124ff06b1be49f9f5cc4c2c61de313794": 75, // d02d782968d144c1a56944f2dd59def478b7d75b47b5db6946d514e576da7a7c 025dec9e58088b633162e28bfd153850a943090ac2aef9158ea55284cecb1bdafb
};

function getEthAddress(publicKey) {
  const publicKeyUint8Array = hexToBytes(publicKey);
  const hash = keccak256(
    publicKeyUint8Array.slice(1, publicKeyUint8Array.length)
  );
  return toHex(hash.slice(-20));
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, publicKey, hash, recipient, sendAmount } = req.body;

  const bytes = utf8ToBytes(
    JSON.stringify({
      sendAmount,
      recipient,
    })
  );

  const transactionHash = keccak256(bytes);

  if (toHex(transactionHash) !== hash) {
    return res.status(400).send({ message: "Hash is not valid!" });
  }

  if (!secp256k1.verify(signature, hash, publicKey)) {
    return res.status(400).send({ message: "Signature is not valid!" });
  }

  const sender = `0x${getEthAddress(publicKey)}`;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < sendAmount) {
    return res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= sendAmount;
    balances[recipient] += sendAmount;
    return res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
