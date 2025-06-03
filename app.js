async function main() {
    const blocksSpan = document.getElementById('blocks-left');
    const timeSpan = document.getElementById('time-left');
    const poolSpan = document.getElementById('pool-amount');
    const winnerSpan = document.getElementById('last-winner');

    try {
        const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        const abi = await fetch('contract.json').then(res => res.json());
        const contract = new ethers.Contract("0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9", abi, provider);

        const blocksLeft = await contract.blocksUntilNextDraw();
        blocksSpan.textContent = blocksLeft;
        timeSpan.textContent = `約 ${Math.floor(blocksLeft * 1.5 / 60)} 分 ${Math.floor((blocksLeft * 1.5) % 60)} 秒`;

        const usd1 = new ethers.Contract("0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d", [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ], provider);
        const amount = await usd1.balanceOf("0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9");
        const decimals = await usd1.decimals();
        poolSpan.textContent = (amount / (10 ** decimals)).toFixed(2);

        // Optional: get latest winner via event or default placeholder
        winnerSpan.textContent = "即將揭曉 / TBA";
    } catch (e) {
        blocksSpan.textContent = timeSpan.textContent = poolSpan.textContent = winnerSpan.textContent = "錯誤 / Error";
        console.error(e);
    }
}
main();