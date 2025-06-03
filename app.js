const contractAddress = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const usdtAddress = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
const abi = /* PASTE YOUR ABI HERE */;

async function init() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await ethereum.enable();
    } else {
        alert("請安裝 MetaMask");
        return;
    }

    const contract = new web3.eth.Contract(abi, contractAddress);
    const usdtContract = new web3.eth.Contract([
        { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
        { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" }
    ], usdtAddress);

    const blocksLeft = await contract.methods.blocksUntilNextDraw().call();
    const lastWinnerEvents = await contract.getPastEvents("RewardDrawn", { fromBlock: 0, toBlock: "latest" });

    document.getElementById("countdown").innerText = `${blocksLeft} (~${(blocksLeft * 1.5).toFixed(0)} 秒)`;

    const usdtBalance = await usdtContract.methods.balanceOf(contractAddress).call();
    const decimals = await usdtContract.methods.decimals().call();
    const amount = (usdtBalance / (10 ** decimals)).toFixed(2);
    document.getElementById("poolAmount").innerText = amount;

    if (lastWinnerEvents.length > 0) {
        const lastWinner = lastWinnerEvents[lastWinnerEvents.length - 1];
        document.getElementById("lastWinner").innerText = lastWinner.returnValues.winner;
        const historyHTML = lastWinnerEvents.reverse().map(event => {
            const winner = event.returnValues.winner;
            const prize = (event.returnValues.amount / (10 ** decimals)).toFixed(2);
            const block = event.returnValues.blockNumber;
            return `<div class="history-item">${winner}<br>贏得：${prize} USD1<br>區塊：${block}</div>`;
        }).join("");
        document.getElementById("winnerHistory").innerHTML = historyHTML;
    } else {
        document.getElementById("lastWinner").innerText = "尚無資料";
        document.getElementById("winnerHistory").innerText = "尚無中獎紀錄";
    }
}

window.addEventListener("load", init);
