import { Dyon__factory } from "../typechain";
import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import abis from "./export.json";

export default function Dyon(signerOrProvider: Signer | Provider) {
  return Dyon__factory.connect(abis.contracts.Dyon.address, signerOrProvider);
}