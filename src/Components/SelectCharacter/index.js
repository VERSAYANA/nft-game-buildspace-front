import React, { useEffect, useState } from "react";
import LoadingIndicator from "../LoadingIndicator";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

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
      console.log("gameContract:", gameContract);
    } else {
      console.log("Install MetaMasket");
    }
  }, []);

  // useEffect(() => {
  //   const getCharacters = async () => {
  //     try {
  //       console.log("Getting contract characters to mint");

  //       /*
  //        * Call contract to get all mint-able characters
  //        */
  //       const charactersTxn = await gameContract.getAllDefaultCharacters();
  //       console.log("charactersTxn:", charactersTxn);

  //       /*
  //        * Go through all of our characters and transform the data
  //        */
  //       const characters = charactersTxn.map((characterData) =>
  //         transformCharacterData(characterData)
  //       );

  //       /*
  //        * Set all mint-able characters in state
  //        */
  //       setCharacters(characters);
  //     } catch (error) {
  //       console.error("Something went wrong fetching characters:", error);
  //     }
  //   };

  //   /*
  //    * If our gameContract is ready, let's get characters!
  //    */
  //   if (gameContract) {
  //     getCharacters();
  //   }
  // }, [gameContract]);
  useEffect(() => {
    const getCharacters = async () => {
      try {
        setMintingCharacter(true);
        console.log("Getting contract characters to mint");
        const characterTxns = await gameContract.getAllDefaultCharacters();
        const characters = characterTxns.map((txn) =>
          transformCharacterData(txn)
        );
        setCharacters(characters);
        console.log(characters);
        setMintingCharacter(false);
      } catch (error) {
        console.error(error);
        setMintingCharacter(false);
      }
    };

    const onCharacterMinted = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log("CharacterNFT: ", characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };

    if (gameContract) {
      getCharacters();

      gameContract.on("CharacterNFTMinted", onCharacterMinted);
    }

    return () => {
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMinted);
      }
    };
  }, [gameContract, setCharacterNFT]);

  const mintCharacterNFTAction = async (characterId) => {
    try {
      if (gameContract) {
        const txn = await gameContract.mintCharacterNFT(characterId);
        await txn.wait();
        console.log("mint txn", txn);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={() => mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;
