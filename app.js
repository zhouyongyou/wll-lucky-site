
const contractAddress = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const usd1TokenAddress = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";

async function init() {
    if (typeof window.ethereum === 'undefined') {
        alert("請先安裝 MetaMask！");
        return;
    }

    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const response = await fetch('abi/contract.json');
    const abi = await response.json();
    const contract = new web3.eth.Contract(abi, contractAddress);

    try {
        const blocksLeft = await contract.methods.blocksUntilNextDraw().call();
        document.getElementById("block-countdown").innerText = "倒數區塊：" + blocksLeft;

        const poolBalance = await getUSDTBalance(web3, usd1TokenAddress, contractAddress);
        document.getElementById("jackpot-amount").innerText = "獎池金額：" + poolBalance + " USD1";

        const pastEvents = await contract.getPastEvents("RewardDrawn", {
            fromBlock: 0,
            toBlock: "latest"
        });

        const winnerList = document.getElementById("winner-list");
        winnerList.innerHTML = "";

        pastEvents.reverse().forEach((event, index) => {
            const { winner, amount, blockNumber } = event.returnValues;
            const li = document.createElement("li");
            li.innerText = `#${index + 1} - ${winner} 贏得 ${web3.utils.fromWei(amount, 'ether')} USD1 (Block: ${blockNumber})`;
            winnerList.appendChild(li);
        });

        if (pastEvents.length > 0) {
            const last = pastEvents[pastEvents.length - 1].returnValues;
            document.getElementById("latest-winner").innerText = `最近中獎者：${last.winner}`;
        }
    } catch (err) {
        console.error("錯誤：", err);
    }
}

async function getUSDTBalance(web3, tokenAddress, walletAddress) {
    const minABI = [
        {
            constant: true,
            inputs: [{ name: "_owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
            type: "function",
        },
        {
            constant: true,
            inputs: [],
            name: "decimals",
            outputs: [{ name: "", type: "uint8" }],
            type: "function",
        },
    ];

    const tokenContract = new web3.eth.Contract(minABI, tokenAddress);
    const balance = await tokenContract.methods.balanceOf(walletAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    return (balance / (10 ** decimals)).toFixed(2);
}

window.addEventListener('load', init);
