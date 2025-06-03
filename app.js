
const contractAddress = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const usd1Address = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
const abi = [{
    "inputs":[],"name":"blocksUntilNextDraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"
},
{
    "inputs":[],"name":"_USDT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"
},
{
    "inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"
},
{
    "anonymous":false,"inputs":[
        {"indexed":true,"internalType":"address","name":"winner","type":"address"},
        {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},
        {"indexed":false,"internalType":"uint256","name":"blockNumber","type":"uint256"}],
    "name":"RewardDrawn","type":"event"
}];

async function init() {
    if (typeof window.ethereum !== "undefined") {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const contract = new web3.eth.Contract(abi, contractAddress);
        
        // 倒數區塊數
        const blocks = await contract.methods.blocksUntilNextDraw().call();
        document.getElementById("countdownBlocks").innerText = blocks;

        // 獎池金額 (讀取 USD1 在合約中的餘額)
        const usd1Contract = new web3.eth.Contract(abi, usd1Address);
        const balance = await usd1Contract.methods.balanceOf(contractAddress).call();
        const humanReadable = parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(2);
        document.getElementById("jackpotAmount").innerText = `${humanReadable} USD1`;

        // 中獎紀錄
        const latest = await contract.getPastEvents("RewardDrawn", {
            fromBlock: "earliest",
            toBlock: "latest"
        });
        const sorted = latest.sort((a, b) => b.returnValues.blockNumber - a.returnValues.blockNumber);
        if (sorted.length > 0) {
            document.getElementById("recentWinner").innerText = `${sorted[0].returnValues.winner} (${parseFloat(web3.utils.fromWei(sorted[0].returnValues.amount, 'ether')).toFixed(2)} USD1)`;
        }

        // 全部紀錄
        const list = document.getElementById("historyList");
        sorted.forEach(item => {
            const li = document.createElement("li");
            li.innerText = `區塊 ${item.returnValues.blockNumber}：${item.returnValues.winner} 獲得 ${parseFloat(web3.utils.fromWei(item.returnValues.amount, 'ether')).toFixed(2)} USD1`;
            list.appendChild(li);
        });
    } else {
        alert("請安裝 MetaMask！");
    }
}

window.addEventListener("load", init);
