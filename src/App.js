import React, { useEffect, useState } from "react";
import SelectCharacter from "./Components/SelectCharacter";
import LoadingIndicator from "./Components/LoadingIndicator";

import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";
import useSound from "use-sound";

// import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import Arena from "./Components/Arena";

// Constants
const TWITTER_HANDLE = "VERSAYANA";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attackState, setAttackState] = useState("");
  const [playChooseYourHero] = useSound("/choose-your-hero2.mp3", {
    volume: 0.6,
  });

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        // console.log("Make sure you have MetaMask!");
        alert("Install MetaMask extension");
        return;
      } else {
        // console.log("We have the ethereum object", ethereum);

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          // console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          // console.log("No authorized account found");
          setIsLoading(false);
        }
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      setIsLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        // console.log("User has character NFT", txn);
        setCharacterNFT(transformCharacterData(txn));
      } else {
        // console.log("No character NFT found");
        setCharacterNFT(null);

        playChooseYourHero();
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      // console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    } else {
      // setIsLoading(false);
    }
  }, [currentAccount, playChooseYourHero]);

  // useEffect(() => {
  //   if (characterNFT === null) {
  //     playChooseYourHero();
  //   }
  // }, [characterNFT, playChooseYourHero]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img src="/Aegis.jpeg" alt="Monty Python Gif" />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started (Goerli test network)
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      // playChooseYourHero();

      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena
          characterNFT={characterNFT}
          setCharacterNFT={setCharacterNFT}
          attackState={attackState}
          setAttackState={setAttackState}
        />
      );
    }
  };

  return (
    <div
      className={`App ${attackState === "attacking" ? "fighting" : ""} ${
        attackState === "hit" ? "fight-done" : ""
      }`}
    >
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Become Immortal</p>
          {/* <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p> */}
          <p className="sub-text">
            Defeat Roshan and claim the Aegis of the Immorality!
          </p>
          {isLoading ? (
            <p className="sub-text">Use Goerli test network</p>
          ) : null}

          {renderContent()}
        </div>
        <div className="footer-container">
          {/* <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} /> */}
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
