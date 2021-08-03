import { Dyon__factory } from "../typechain";
import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import abis from "./export.json";

export type { Dyon } from "../typechain";

export function newContract(
  address: string,
  signerOrProvider: Signer | Provider
) {
  return Dyon__factory.connect(address, signerOrProvider);
}

export default function DyonContract(signerOrProvider: Signer | Provider) {
  return Dyon__factory.connect(abis.contracts.Dyon.address, signerOrProvider);
}
