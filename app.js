
const web3 = new Web3('https://bsc-dataseed.binance.org/');
const contractAddress = '0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9';
const abi = []; // 這裡應該放 ABI，目前省略

async function loadData() {
    try {
        const contract = new web3.eth.Contract(abi, contractAddress);
        // 以下為模擬，應根據合約實際方法名稱填寫
        const pool = await contract.methods.getRewardPool().call();
        const blockLeft = await contract.methods.getBlocksLeft().call();
        const winner = await contract.methods.lastWinner().call();

        document.getElementById('poolAmount').textContent = `${web3.utils.fromWei(pool)} USDT`;
        document.getElementById('countdown').textContent = `${blockLeft} blocks`;
        document.getElementById('lastWinner').textContent = winner;
    } catch (error) {
        console.error("區塊鏈讀取失敗", error);
    }
}

loadData();
