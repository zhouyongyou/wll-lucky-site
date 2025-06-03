
const contractAddress = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const usdtAddress = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
let contract;
let web3;

async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const abi = await fetch("contract.json").then(res => res.json());
        contract = new web3.eth.Contract(abi, contractAddress);
        loadData();
    }
}

async function loadData() {
    const blocks = await contract.methods.blocksUntilNextDraw().call();
    const seconds = Math.floor(blocks * 1.5);
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    document.getElementById("countdown").innerText = `倒數區塊數：${blocks}`;
    document.getElementById("countdown-time").innerText = `預估剩餘時間：約 ${minutes} 分 ${sec} 秒`;

    const usdt = new web3.eth.Contract([
        { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" }
    ], usdtAddress);
    const poolAmount = await usdt.methods.balanceOf(contractAddress).call();
    document.getElementById("prize").innerText = `獎池金額：${(poolAmount / 1e18).toFixed(2)} USD1`;

    const events = await contract.getPastEvents("RewardDrawn", { fromBlock: 0, toBlock: "latest" });
    const history = document.getElementById("history-list");
    history.innerHTML = "";
    events.reverse().forEach(e => {
        const item = document.createElement("div");
        item.className = "card";
        item.innerText = `${e.returnValues.winner.slice(0, 6)}...${e.returnValues.winner.slice(-4)} - ${(e.returnValues.amount / 1e18).toFixed(2)} USD1`;
        history.appendChild(item);
    });

    if (events.length > 0) {
        const lastWinner = events[events.length - 1].returnValues.winner;
        document.getElementById("winner").innerText = `最近中獎者：${lastWinner}`;
    }
}

window.onload = init;
