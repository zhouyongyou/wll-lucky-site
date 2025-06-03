
const CONTRACT_ADDRESS = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const USD1_ADDRESS = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

async function load() {
  const contractABI = await fetch('contract.json').then(res => res.json());
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
  const usdt = new ethers.Contract(USD1_ADDRESS, contractABI, provider);

  // 倒數區塊
  const remaining = await contract.blocksUntilNextDraw();
  document.getElementById("countdown").innerText = remaining.toString();
  document.getElementById("countdown-time").innerText = `${(remaining * 1.5).toFixed(0)} 秒`;

  // 獎池金額
  const balance = await usdt.balanceOf(CONTRACT_ADDRESS);
  document.getElementById("jackpot").innerText = (balance / 1e18).toFixed(2);

  // 中獎事件
  const eventFilter = contract.filters.RewardDrawn();
  const events = await contract.queryFilter(eventFilter, -10000);
  const historyList = document.getElementById("history");
  if (events.length > 0) {
    const last = events[events.length - 1];
    document.getElementById("last-winner").innerText = last.args.winner;

    historyList.innerHTML = events.reverse().map(e => {
      const hash = e.transactionHash;
      const amount = (e.args.amount / 1e18).toFixed(2);
      const short = e.args.winner.slice(0, 6) + "..." + e.args.winner.slice(-4);
      return `<div class="entry">${short} 🥇 ${amount} USD1<br><a href="https://bscscan.com/tx/${hash}" target="_blank">View TX</a></div>`;
    }).join("");
  } else {
    document.getElementById("last-winner").innerText = "尚無資料 / Loading...";
  }
}

window.onload = load;
