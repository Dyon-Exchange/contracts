import { Token__factory } from "../typechain";
import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import abis from "./export.json";

export function Token(signerOrProvider: Signer | Provider) {
  return Token__factory.connect(abis.contracts.Token.address, signerOrProvider);
}
