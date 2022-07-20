import { useEffect, useState, FormEvent, useCallback } from "react";
import { useAccount, useContract, useSigner } from "wagmi";

import ttStakingABI from "@/contracts/TTStaking.json";
import { NETWORK_ID } from "@/config";
import addresses from "@/contracts/addresses";
import { ethers } from "ethers";

export const TTStaking = () => {
  const chainId = Number(NETWORK_ID);
  const [to, setto] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userOwnedTokenIDS, setuserOwnedTokenIDS] = useState<string[]>([]);
  const [tokenID, settokenID] = useState("All");

  const { data: signerData } = useSigner();
  const { address } = useAccount();

  const ttStakingAddress = addresses[chainId].TTStaking;

  const ttStakingContract = useContract({
    addressOrName: ttStakingAddress,
    contractInterface: ttStakingABI,
    signerOrProvider: signerData,
  });

  const onSelectTokenID = (e: any) => settokenID(e.target.value);

  const getNFT = useCallback(async () => {
    if (signerData) {
      const balanceOfOwner = await ttStakingContract.balanceOf(address);
      let promises = [];
      for (let i = 0; i < balanceOfOwner.toNumber(); i++) {
        promises.push(ttStakingContract.tokenOfOwnerByIndex(address, i));
      }
      const ids = await Promise.all(promises);
      setuserOwnedTokenIDS(ids);
    }
  }, [address, signerData]);

  useEffect(() => {
    if (signerData) {
      setError("");
      setLoading(false);
      getNFT();
    } else {
      setLoading(false);
      // setError("please connect your wallet");
    }
  }, [signerData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!ethers.utils.isAddress(to.toLowerCase()))
        throw new Error("custom: send to address is not valid");

      setLoading(true);

      if (tokenID === "All") {
        for (let i = 0; i < userOwnedTokenIDS.length; i++) {
          const token = userOwnedTokenIDS[i];
          const tx = await ttStakingContract.transferFrom(address, to, token);
          await tx.wait();
        }
      } else {
        const tx = await ttStakingContract.transferFrom(address, to, tokenID);
        await tx.wait();
      }

      getNFT();

      setError("");
      setLoading(false);
      alert("success");
    } catch (error) {
      console.log("error:", error);
      // @ts-ignore
      if (error.message.startsWith("custom:")) {
        // @ts-ignore
        setError(error.message.split("custom:")[1]);
      } else {
        setError("txn failed, check contract");
      }
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ margin: "20px" }}>
      <h1 className="mb-4 text-lg">Mining transfer tool</h1>
      <form onSubmit={(e) => handleSubmit(e)} className="mr-4">
        {address && userOwnedTokenIDS.length === 0 && (
          <h3 className="my-2" style={{ color: "red" }}>
            You have no Mining NFT
          </h3>
        )}
        <div className="mb-4 flex">
          <h3 className="mr-2">Select token ID to transfer</h3>
          <select onChange={onSelectTokenID} value={tokenID}>
            {userOwnedTokenIDS.map((id) => {
              return (
                <option key={id.toString()} value={id.toString()}>
                  {id.toString()}
                </option>
              );
            })}
            <option>All</option>
          </select>
        </div>
        <input
          required
          value={to}
          placeholder="send to address"
          onChange={(e) => setto(e.target.value)}
        />
        <button
          style={{ marginLeft: "20px" }}
          type="submit"
          disabled={userOwnedTokenIDS.length < 1}
        >
          submit
        </button>
      </form>
      <div style={{ color: "red" }}>{error}</div>
    </div>
  );
};
