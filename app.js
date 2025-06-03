const contractAddress = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const abi = [/* 寫入你的 ABI */];

let contract;

async function init() {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        contract = new web3.eth.Contract(abi, contractAddress);
        loadPoolData();
    } else {
        alert("請安裝 MetaMask 等 Web3 錢包");
    }
}

async function loadPoolData() {
    try {
        const pool = await contract.methods.getCurrentPool().call();
        const blockLeft = await contract.methods.getBlocksUntilNextDraw().call();
        const winner = await contract.methods.getLastWinner().call();

        document.getElementById("poolAmount").innerText = (pool / 1e18).toFixed(2);
        document.getElementById("countdown").innerText = blockLeft;
        document.getElementById("lastWinner").innerText = winner;

        loadHistory();
    } catch (err) {
        console.error("讀取資料失敗：", err);
    }
}

async function loadHistory() {
    const events = await contract.getPastEvents("WinnerPicked", {
        fromBlock: 0,
        toBlock: "latest"
    });

    const historyList = document.getElementById("history");
    historyList.innerHTML = "";

    events.reverse().forEach(e => {
        const li = document.createElement("li");
        li.textContent = `🏆 ${e.returnValues.winner} 獲得 ${e.returnValues.amount / 1e18} USDT`;
        historyList.appendChild(li);
    });
}

window.onload = init;
