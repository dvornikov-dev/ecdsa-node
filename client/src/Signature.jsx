import { useState } from "react";
import { keccak256 } from "ethereum-cryptography/keccak";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";

function Signature() {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [signature, setSignature] = useState("");
  const [hash, setHash] = useState("");
  const [publicKey, setPublicKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function generateSignature(evt) {
    evt.preventDefault();

    const transcation = {
      sendAmount: parseInt(sendAmount), 
      recipient
    }

    const bytes = utf8ToBytes(JSON.stringify(transcation));

    const hash = keccak256(bytes);

    const sign = secp256k1.sign(toHex(hash), privateKey);

    const publicKey = sign.recoverPublicKey(hash).toHex();

    setPublicKey(publicKey);
    setSignature(sign.toCompactHex());
    setHash(toHex(hash));
  }

  return (
    <form className="container transfer" onSubmit={generateSignature}>
      <h1>Sign trans</h1>

      <label>
        Send Amount
        <input  
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Private key
        <input
          placeholder="Type a private key"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <p>
        Signature: {signature} <br />
        Public key: {publicKey} <br />
        Trans hash: {hash} <br />
      </p>

      <input type="submit" className="button" value="Sign" />
    </form>
  );
}

export default Signature;
