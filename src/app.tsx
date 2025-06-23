import React from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';

// --- 合約設定 ---
const WLL_TOKEN_ADDRESS = '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d';
const CONTRACT_ADDRESS = '0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9';
const QUALIFY_THRESHOLD = BigInt('1000000000000');

// --- ABI 定義 (簡化版) ---
const WLL_TOKEN_ABI = [{ type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }];
const LOTTERY_ABI = [{ type: 'function', name: 'blocksUntilNextDraw', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] }];

// --- UI 組件 ---
const StatItem = ({ icon, title, value, subValue, isLoading }) => (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg text-center transition-all duration-300 hover:shadow-teal-500/20 hover:scale-105">
        <div className="flex items-center justify-center text-teal-300 mb-3">{icon}<h2 className="text-xl font-bold ml-2">{title}</h2></div>
        <div className="h-16 flex flex-col justify-center">{isLoading ? <div className="animate-pulse h-8 bg-gray-700 rounded-md w-3/4 mx-auto"></div> : (<><p className="text-3xl font-mono text-white">{value}</p>{subValue && <p className="text-md text-gray-400 mt-1">{subValue}</p>}</>)}</div>
    </div>
);

// --- 主應用程式 ---
export default function App() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    // 讀取用戶的 WLL 餘額
    const { data: userBalance, isLoading: isCheckingBalance } = useReadContract({
        abi: WLL_TOKEN_ABI,
        address: WLL_TOKEN_ADDRESS,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: isConnected },
    });

    // 🌟 修正：讀取獎池的 WLL 餘額，而不是 USDT
    const { data: prizePool, isLoading: isLoadingPrize } = useReadContract({
        abi: WLL_TOKEN_ABI,
        address: CONTRACT_ADDRESS, // 讀取樂透合約地址的 WLL 餘額
        functionName: 'balanceOf',
        args: [CONTRACT_ADDRESS],
        query: { refetchInterval: 30000 }, // 每 30 秒刷新
    });

    const { data: countdownBlocks, isLoading: isLoadingCountdown } = useReadContract({
        abi: LOTTERY_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'blocksUntilNextDraw',
        query: { refetchInterval: 15000 },
    });

    const isQualified = userBalance ? userBalance >= QUALIFY_THRESHOLD : false;
    // 🌟 修正：格式化 WLL 數量，並使用正確的單位
    const prizeFormatted = prizePool ? prizePool.toLocaleString() : '0';
    const countdownTime = countdownBlocks ? `約 ${Math.floor(Number(countdownBlocks) * 3 / 60)} 分 ${Math.floor(Number(countdownBlocks) * 3 % 60)} 秒` : '';

    const TimerIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    const PrizeIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
    const WinnerIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V6a2 2 0 0 0-2-2H7.83a2 2 0 0 0-1.42.59L3.6 7.41a2 2 0 0 0-.59 1.42V14a2 2 0 0 0 2 2h2"></path><path d="M14 12v2a2 2 0 0 0 2 2h4.17a2 2 0 0 0 1.41-.59l2.82-2.82a2 2 0 0 0 .59-1.41V8a2 2 0 0 0-2-2h-2"></path><path d="M7 12h10"></path></svg>;

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
          <div className="container mx-auto p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-10">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold text-white">$WLL - Lucky Lottery</h1>
                <p className="text-gray-400 mt-1">每 30 分鐘，一位幸運兒獨得大獎！</p>
              </div>
              <div>
                {isConnected ? (
                  <div className="flex items-center space-x-4 bg-gray-800 p-2 rounded-lg">
                    <p className="text-sm font-mono" title={address}>{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</p>
                    <button onClick={() => disconnect()} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-bold transition-colors">中斷連線</button>
                  </div>
                ) : (
                  <button onClick={() => connect({ connector: injected() })} className="bg-teal-500 hover:bg-teal-600 px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-teal-500/20">✨ 連接錢包</button>
                )}
              </div>
            </header>

            <main>
              {isConnected && (
                <section className="mb-10 p-6 bg-gradient-to-r from-gray-800 to-gray-800/80 rounded-xl border border-teal-500/30 shadow-xl">
                  <h2 className="text-2xl font-bold text-teal-300 mb-4">您的抽獎資格狀態</h2>
                  {isCheckingBalance ? (<div className="animate-pulse h-8 bg-gray-700 rounded-md w-1/2"></div>) : (
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-8">
                      <div className="flex items-center text-2xl">
                        {isQualified ? <span className="text-green-400 mr-3">✅</span> : <span className="text-red-400 mr-3">❌</span>}
                        <p className={isQualified ? 'text-green-400' : 'text-red-400'}>{isQualified ? '您已符合抽獎資格！' : '您尚未符合抽獎資格'}</p>
                      </div>
                      <div className="text-gray-300 font-mono text-sm">
                        <p>您的 $WLL 餘額: {userBalance?.toLocaleString() ?? '0'}</p>
                        <p className="text-gray-500">資格門檻: {QUALIFY_THRESHOLD.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </section>
              )}
              
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatItem icon={TimerIcon} title="倒數區塊" value={countdownBlocks?.toString() ?? '...'} subValue={countdownTime} isLoading={isLoadingCountdown} />
                {/* 🌟 修正：顯示正確的單位 $WLL */}
                <StatItem icon={PrizeIcon} title="獎池金額" value={`${prizeFormatted} $WLL`} isLoading={isLoadingPrize} />
                <StatItem icon={WinnerIcon} title="最近中獎者" value="..." subValue="" isLoading={true} />
              </section>

              {/* 🌟 新增：加回說明區塊，讓網站內容更完整 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-teal-300 mb-4">🎯 How It Works / 運作機制</h2>
                  <ul className="list-none space-y-3 text-gray-300">
                    <li className="flex items-start"><span className="text-teal-400 mr-3 mt-1">🔹</span>總供應量: 1,000,000,000,000,000</li>
                    <li className="flex items-start"><span className="text-teal-400 mr-3 mt-1">🔹</span>需至少持有 0.1% 才有資格 (≥ 1,000,000,000,000)</li>
                    <li className="flex items-start"><span className="text-teal-400 mr-3 mt-1">🔹</span>每 30 分鐘自動抽獎一次 (約 600 個區塊)</li>
                    <li className="flex items-start"><span className="text-teal-400 mr-3 mt-1">🔹</span>買/賣稅: 總共 5%
                      <ul className="list-none pl-6 mt-2 text-gray-400 border-l-2 border-gray-700">
                        <li>└ 4% 進入樂透獎池</li>
                        <li>└ 1% 用於市場營銷</li>
                      </ul>
                    </li>
                  </ul>
                </section>

                <section className="bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-teal-300 mb-4">📜 Full History / 所有中獎紀錄</h2>
                  <p className="mb-4 text-gray-400">
                    在此查看所有獎勵交易：
                    <a href="https://bscscan.com/advanced-filter?tkn=0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d&txntype=2&fadd=0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9&tadd=!0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-200 transition-colors">
                      在 BscScan 上查看 ↗
                    </a>
                  </p>
                  <div className="text-gray-500 text-center py-4">(歷史紀錄功能待開發)</div>
                </section>
              </div>
            </main>

            <footer className="text-center mt-12 py-6 border-t border-gray-800">
                <h3 className="text-xl font-bold text-teal-300 mb-4">🌐 Community / 社群連結</h3>
                <div className="space-x-6 text-lg">
                    <a href="https://x.com/WLLonBSC" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-teal-300 transition-colors">🐦 Twitter</a>
                    <span className="text-gray-700">|</span>
                    <a href="https://t.me/WLLonBSC" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-teal-300 transition-colors">💬 Telegram</a>
                </div>
            </footer>
          </div>
        </div>
    );
}
