import styled from "styled-components";
import BlockBoxComponent from "../components/BlockBox";
import Web3 from "web3";
import axios from "axios";
import { useEffect, useState } from "react";

const BlockContainer = () => {
  const request = axios.create({
    baseURL: "http://localhost:8080/api",
  });
  const [blockArr, setBlockArr] = useState([]);
  const [transactionArr, setTransactionArr] = useState([]);

  useEffect(() => {
    // setBlock(await axios.post("web3/getBlock"));
    async function getBlock() {
      const data = await request.post("/web3/getBlock");
      setBlockArr(data.data.arr);
      setTransactionArr(data.data.transaction);
    }
    getBlock();
  }, []);
  return (
    <BlockBoxComponent blockArr={blockArr} transactionArr={transactionArr} />
  );
};

const Fbox = styled.div`
  display: flex;
`;

const Vbox = styled.div`
  display: flex;
  flex-direction: column;
`;
export default BlockContainer;
