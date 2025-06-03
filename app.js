
const WLL_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }
    ],
    "name": "RewardDrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "blocksUntilNextDraw",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_USDT",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const USD1_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const WLL_ADDRESS = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const USD1_ADDRESS = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";

async function init() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask to use this dApp!");
    return;
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.enable();

  const wll = new web3.eth.Contract(WLL_ABI, WLL_ADDRESS);
  const usd1 = new web3.eth.Contract(USD1_ABI, USD1_ADDRESS);

  // 倒數區塊 + 時間換算
  try {
    const blocks = await wll.methods.blocksUntilNextDraw().call();
    document.getElementById("blocks").innerText = `${blocks} (~${Math.round(blocks * 1.5)}s)`;
  } catch (e) {
    console.error("block fetch error", e);
  }

  // 讀取獎池金額
  try {
    const poolBalanceRaw = await usd1.methods.balanceOf(WLL_ADDRESS).call();
    const decimals = await usd1.methods.decimals().call();
    const pool = (poolBalanceRaw / 10 ** decimals).toFixed(2);
    document.getElementById("pool").innerText = `${pool} USD1`;
  } catch (e) {
    console.error("pool fetch error", e);
  }

  // 取得最近中獎紀錄
  try {
    const latestBlock = await web3.eth.getBlockNumber();
    const events = await wll.getPastEvents("RewardDrawn", {
      fromBlock: latestBlock - 5000,
      toBlock: "latest"
    });
    if (events.length > 0) {
      const last = events[events.length - 1];
      const winner = last.returnValues.winner;
      const amount = web3.utils.fromWei(last.returnValues.amount, "ether");
      const blockNumber = last.returnValues.blockNumber;
      const txHash = last.transactionHash;
      const history = document.getElementById("history");
      history.innerHTML = `
        <div class="card">
          🏆 <strong>Winner:</strong> ${winner}<br/>
          💰 <strong>Amount:</strong> ${amount} USD1<br/>
          🔗 <a href="https://bscscan.com/tx/${txHash}" target="_blank">TX Link</a>
        </div>
      `;
    }
  } catch (e) {
    console.error("history fetch error", e);
  }
}

window.addEventListener("load", init);
