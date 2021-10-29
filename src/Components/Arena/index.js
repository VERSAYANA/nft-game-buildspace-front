import React, { useEffect, useState } from "react";
import LoadingIndicator from "../LoadingIndicator";
import { ethers } from "ethers";
import useSound from "use-sound";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";

const Arena = ({
  characterNFT,
  setCharacterNFT,
  attackState,
  setAttackState,
}) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  // const [attackState, setAttackState] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [playFightingSound, { stop }] = useSound("/fighitng.mp3", {
    volume: 0.5,
    loop: true,
  });

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log(bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };

    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      setBoss((prevState) => {
        return { ...prevState, hp: bossHp };
      });

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp };
      });
    };

    if (gameContract) {
      fetchBoss();
      gameContract.on("AttackComplete", onAttackComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
      }
    };
  }, [gameContract, setCharacterNFT]);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        playFightingSound();
        console.log("Attacking boss...");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log(attackTxn);
        setAttackState("hit");
        stop();

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <div className="arena-container">
      {/* Add your toast HTML right here */}
      {boss && (
        <div id="toast" className={showToast ? "show" : ""}>
          <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
      )}

      {/* Boss */}
      {boss && (
        <div className="grid-container">
          <div className="boss-container">
            <div className={`boss-content  ${attackState}`}>
              <h2 className="arena-heading">{boss.name}</h2>
              <div className="image-content">
                <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                <div className="health-bar">
                  <progress value={boss.hp} max={boss.maxHp} />
                  <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>

            {/* {attackState === "attacking" && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )} */}
          </div>
        </div>
      )}

      {boss && (
        <div className="grid-container">
          <div className="attack-container">
            {attackState === "attacking" ? (
              <div className="loading-indicator">
                <LoadingIndicator />
                <p>Attacking ⚔️</p>
              </div>
            ) : (
              <button className="cta-button" onClick={runAttackAction}>
                {`Attack ${boss.name}`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Character NFT */}
      {characterNFT && (
        <div className="grid-container">
          <div className="players-container">
            <div className="player-container">
              {/* <h2>Your Character</h2> */}
              <div className="player">
                <div className="image-content">
                  <h2 className="arena-heading">{characterNFT.name}</h2>
                  <img
                    src={characterNFT.imageURI}
                    alt={`Character ${characterNFT.name}`}
                  />
                  <div className="health-bar">
                    <progress
                      value={characterNFT.hp}
                      max={characterNFT.maxHp}
                    />
                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                  </div>
                </div>
                <div className="stats">
                  <h4>{`Attack Damage: ${characterNFT.attackDamage}`}</h4>
                </div>
              </div>
            </div>
            {/* <div className="active-players">
            <h2>Active Players</h2>
            <div className="players-list">{renderActivePlayersList()}</div>
          </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
