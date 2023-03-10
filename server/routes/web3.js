const router = require("express").Router();
const Web3 = require("web3");
const { Block, Transaction } = require("../models");
const { Op } = require("sequelize");
const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8081")
);

const getBlockFunc = () =>
  web3.eth.getBlockNumber(async function (err, rtn) {
    let latest_block_number = rtn;
    const temp = await Block.findOne({ id: 1 });

    if (temp) {
      const lastBlock = await Block.findOne({
        order: [["number", "desc"]],
      });
      const lastBlockNum = lastBlock.dataValues.number;

      for (let i = lastBlockNum + 1; i <= latest_block_number; i++) {
        web3.eth.getBlock(i, false, async function (err, block) {
          if (block.transactions[0]) {
            block.txns = block.transactions.length;
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
                  }
                );
              }
            }
          });
        });
      }
    } else {
      for (let i = 0; i <= latest_block_number; i++) {
        web3.eth.getBlock(i, false, async function (err, block) {
          if (block.transactions[0]) {
            block.txns = block.transactions.length;
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
                  }
                );
              }
            }
          });
        });
      }
    }
  });

web3.eth.subscribe("newBlockHeaders", (error, result) => {
  getBlockFunc();
  if (!error) {
  } else {
    return;
  }
});

router.post("/getBalance", async (req, res) => {
  try {
    const balance = await web3.eth.getBalance(req.body.value);

    res.send({
      isError: false,
      balance: (balance / 10 ** 18).toFixed(7),
    });
  } catch (error) {
    res.send({ isError: true, error: error });
  }
});

router.post("/getWallet", async (req, res) => {
  try {
    let pageNum = req.body.num;
    let offset = 0;
    if (pageNum > 1) {
      offset = req.body.viewCount * (pageNum - 1);
    }
    const walletLength = await Transaction.count({
      where: {
        [Op.or]: [{ from: req.body.value }, { to: req.body.value }],
      },
    });
    const walletInfo = await Transaction.findAll({
      where: {
        [Op.or]: [{ from: req.body.value }, { to: req.body.value }],
      },
      order: [["nonce", "desc"]],
      offset: offset,
      limit: req.body.viewCount,
    });

    res.send({
      isError: false,
      info: walletInfo,
      length: walletLength,
    });
  } catch (error) {
    res.send({ isError: true });
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
  let pageNum = req.body.num;
  let offset = 0;
  if (pageNum > 1) {
    offset = req.body.viewCount * (pageNum - 1);
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

  try {
    res.send({ isError: false, arr: blockArr, transaction: transactionArr });
  } catch (error) {
    res.send({ isError: true });
  }

  getBlockFunc();
});

module.exports = router;
