
const abi = [/* You should paste the full ABI here */];
const contractAddress = "0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9";
const usd1Address = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";

async function init() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask!');
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Countdown Blocks (assume some logic using block.timestamp if needed)
    const block = await provider.getBlock("latest");
    document.getElementById("blocksLeft").innerText = "approx " + Math.floor(120 * 1.5) + " seconds left";

    // Pool Amount (assuming reading balanceOf for this contract in USD1)
    const usd1 = new ethers.Contract(usd1Address, [
        "function balanceOf(address) external view returns (uint256)",
        "function decimals() view returns (uint8)"
    ], provider);
    const balance = await usd1.balanceOf(contractAddress);
    const decimals = await usd1.decimals();
    document.getElementById("poolAmount").innerText = (balance / 10 ** decimals).toFixed(2);

    // Last winner (simulate latest event scan)
    const events = await contract.queryFilter("RewardDrawn", -5000);
    const last = events[events.length - 1];
    document.getElementById("lastWinner").innerText = `${last.args.winner} (${last.args.amount / 10 ** 18} USD1)`;

    const container = document.getElementById("historyCards");
    events.reverse().forEach(evt => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <p><strong>Winner:</strong><br>${evt.args.winner}</p>
            <p><strong>Amount:</strong> ${evt.args.amount / 10 ** 18} USD1</p>
            <p><strong>Block:</strong> ${evt.args.blockNumber}</p>
        `;
        container.appendChild(card);
    });
}

window.addEventListener('load', init);
