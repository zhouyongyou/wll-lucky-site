
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
        // 一開始先載入一次，之後每 30 秒自動更新
        loadData();
        setInterval(loadData, 30000);
    } else {
        alert("請安裝或啟用 Web3 錢包（如 MetaMask）以查看資料。");
    }
}

async function loadData() {
    try {
        // 1. 倒數區塊數 & 預估剩餘時間
        const blocks = await contract.methods.blocksUntilNextDraw().call();
        const seconds = Math.floor(blocks * 1.5);
        const minutes = Math.floor(seconds / 60);
        const sec = seconds % 60;
        document.getElementById("countdown").innerText = `${blocks}`;
        document.getElementById("countdown-time").innerText = `約 ${minutes} 分 ${sec} 秒`;

        // 2. 獎池金額 (USDT)
        const usdt = new web3.eth.Contract(
            [
                {
                    constant: true,
                    inputs: [{ name: "_owner", type: "address" }],
                    name: "balanceOf",
                    outputs: [{ name: "", type: "uint256" }],
                    type: "function",
                },
            ],
            usdtAddress
        );
        const poolAmount = await usdt.methods.balanceOf(contractAddress).call();
        document.getElementById("prize").innerText = `${(poolAmount / 1e18).toFixed(2)} USD1`;

        // 3. 取得所有 RewardDrawn 事件，並顯示在歷史列表
        const events = await contract.getPastEvents("RewardDrawn", {
            fromBlock: 0,
            toBlock: "latest",
        });

        const historyContainer = document.getElementById("history-list");
        historyContainer.innerHTML = ""; // 清空舊資料

        if (events.length === 0) {
            const msg = document.createElement("p");
            msg.className = "loading-msg";
            msg.innerText = "目前尚無中獎紀錄";
            historyContainer.appendChild(msg);
        } else {
            // 事件倒序，最新的放最後，方便顯示最後中獎者
            events.reverse().forEach((e) => {
                const item = document.createElement("div");
                item.className = "card";
                const winnerAddr = e.returnValues.winner;
                const shortAddr = `${winnerAddr.slice(0, 6)}...${winnerAddr.slice(-4)}`;
                const amount = (e.returnValues.amount / 1e18).toFixed(2);
                item.innerHTML = `<span>${shortAddr}</span><span>${amount} USD1</span>`;
                historyContainer.appendChild(item);
            });
            // 顯示最後一次的完整地址
            const lastWinner = events[events.length - 1].returnValues.winner;
            document.getElementById("winner").innerText = lastWinner;
        }
    } catch (err) {
        console.error("載入資料時發生錯誤：", err);
    }
}

// 頁面載入時啟動
window.addEventListener("load", init);
