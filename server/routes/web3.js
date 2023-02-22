const router = require("express").Router();
const Web3 = require("web3");
const { Block, Transaction } = require("../models");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8081")
);

const getBlockFunc = () =>
  web3.eth.getBlockNumber(async function (err, rtn) {
    let latest_block_number = rtn;
    const temp = await Block.findOne({ id: 1 });
    // console.log("temp", temp);

    if (temp) {
      console.log("걸렸다");

      const lastBlock = await Block.findOne({
        order: [["number", "desc"]],
      });
      const lastBlockNum = lastBlock.dataValues.number;

      console.log("lastBlockNum", lastBlockNum);
      console.log("rtn", rtn);

      for (let i = lastBlockNum + 1; i <= latest_block_number; i++) {
        web3.eth.getBlock(i, false, async function (err, block) {
          if (block.transactions[0]) {
            block.transactions = block.transactions[0];
            // await Transaction.create({ transaction: block.transactions });
          } else {
            block.transactions = "";
          }
          await Block.create(block);
          web3.eth.getBlockTransactionCount(i, true, function (err, cnt) {
            if (cnt > 0) {
              for (let j = lastBlockNum + 1; j < cnt; j++) {
                web3.eth.getTransactionFromBlock(
                  i,
                  j,
                  async function (err, tx) {
                    await Transaction.create(tx);
                    console.log(tx);
                  }
                );
              }
            }
          });
        });
      }
    } else {
      console.log("안걸렸다");

      for (let i = 0; i <= latest_block_number; i++) {
        web3.eth.getBlock(i, false, async function (err, block) {
          if (block.transactions[0]) {
            block.transactions = block.transactions[0];
            // await Transaction.create({ transaction: block.transactions });
          } else {
            block.transactions = "";
          }
          await Block.create(block);
          web3.eth.getBlockTransactionCount(i, true, function (err, cnt) {
            if (cnt > 0) {
              for (let j = 0; j < cnt; j++) {
                web3.eth.getTransactionFromBlock(
                  i,
                  j,
                  async function (err, tx) {
                    await Transaction.create(tx);
                    console.log(tx);
                  }
                );
              }
            }
          });
        });
      }
      // await Block.create(block);
      // console.log(block);
      // web3.eth.getBlock(i, false, async function (err, block) {
      //   if (block.transactions[0]) {
      //     block.transactions = block.transactions[0];
      //     console.log(block.transactions);
      //     await Transaction.create({ transaction: block.transactions });
      //   } else {
      //     block.transactions = "";
      //   }
      //   await Block.create(block);
      //   // console.log(block);
      // });
      // web3.eth.getBlock(i, true, async function (err, block) {
      //   block.transaction.forEach(function (tx) {
      //     console.log(tx);
      //   });
      // console.log(block);
    }
  });

router.post("/getInfo", async (req, res) => {
  try {
    switch (req.body.type) {
      case "block":
        const blockInfo = await Block.findOne({
          where: { number: req.body.value },
        });
        res.send({
          isError: false,
          info: blockInfo,
        });
        console.log(blockInfo);
        break;

      case "transaction":
        const transactionInfo = await Transaction.findOne({
          where: { hash: req.body.value },
        });
        res.send({
          isError: false,
          info: transactionInfo,
        });
        break;

      default:
        break;
    }
  } catch (error) {
    res.send({ isError: true });
  }
});

router.post("/getList", async (req, res) => {
  // let pageNum = req.query.page;
  // console.log("pageNum", pageNum);
  console.log(req.body.viewCount);
  let pageNum = req.body.num;
  let offset = 0;
  if (pageNum > 1) {
    offset = 20 * (pageNum - 1);
  }

  const blockArrLength = await Block.count();
  const transactionArrLength = await Transaction.count();
  const blockArr = await Block.findAll({
    order: [["number", "desc"]],
    offset: offset,
    limit: req.body.viewCount,
  });

  const transactionArr = await Transaction.findAll({
    order: [["blockNumber"], ["transactionIndex"]],
    offset: offset,
    limit: req.body.viewCount,
  });

  try {
    res.send({
      isError: false,
      arr: blockArr,
      transaction: transactionArr,
      blockLength: blockArrLength,
      transactionArrLength: transactionArrLength,
    });
  } catch (error) {
    res.send({ isError: true });
  }
});

router.post("/getBlock", async (req, res) => {
  // const blockArr = await Block.findAll({ order: ["number"] });
  const blockArr = await Block.findAll({
    limit: 5,
    order: [["number", "desc"]],
  });
  const transactionArr = await Transaction.findAll({
    limit: 5,
    order: [["blockNumber"], ["transactionIndex"]],
  });
  console.log(transactionArr);
  // const filter = web3.eth.filter("latest");
  web3.eth.subscribe("newBlockHeaders", (error, result) => {
    // console.log("newBlockHeaders : ", result);

    if (!error) {
      // console.log("newBlockHeaders : ", result);
    } else {
      return console.log("블록이 없습니다.");
    }
  });

  // console.log(blockArr);
  try {
    res.send({ isError: false, arr: blockArr, transaction: transactionArr });
  } catch (error) {
    res.send({ isError: true });
  }

  getBlockFunc();
});

// web3.eth.getAccounts().then((data) => console.log(data));
// web3.eth.getBlock().then(console.log);
module.exports = router;
