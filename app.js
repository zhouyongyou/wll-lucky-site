const contractAddress = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const abi = []; // <- 這裡需要填入 ABI

async function init() {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            const contract = new web3.eth.Contract(abi, contractAddress);

            const jackpot = await contract.methods.getJackpot().call();
            document.getElementById("jackpotAmount").textContent = web3.utils.fromWei(jackpot, 'ether');

            const countdown = await contract.methods.getRemainingBlocks().call();
            document.getElementById("blockCountdown").textContent = countdown;

            const winner = await contract.methods.getLastWinner().call();
            document.getElementById("lastWinner").textContent = winner;
        } catch (err) {
            console.error("合約連線錯誤", err);
        }
    } else {
        alert("請安裝 MetaMask");
    }
}

window.onload = init;
