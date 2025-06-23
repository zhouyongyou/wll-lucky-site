import React from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors'; // 更新 import 方式

// --- 合約設定 ---
const WLL_TOKEN_ADDRESS = '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d';
const CONTRACT_ADDRESS = '0x119cc3d1D6FF0ab74Ca5E62CdccC101AE63f69C9';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const QUALIFY_THRESHOLD = BigInt('1000000000000');

// --- ABI 定義 (簡化版) ---
const WLL_TOKEN_ABI = [{ type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }];
const LOTTERY_ABI = [{ type: 'function', name: 'blocksUntilNextDraw', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] }];
const USDT_ABI = [{ type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }];

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

    const { data: userBalance, isLoading: isCheckingBalance } = useReadContract({
        abi: WLL_TOKEN_ABI,
        address: WLL_TOKEN_ADDRESS,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: isConnected }, // 更新為 query.enabled
    });

    const { data: prizePool, isLoading: isLoadingPrize } = useReadContract({
        abi: USDT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'balanceOf',
        args: [CONTRACT_ADDRESS],
    });

    const { data: countdownBlocks, isLoading: isLoadingCountdown } = useReadContract({
        abi: LOTTERY_ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'blocksUntilNextDraw',
        query: { refetchInterval: 15000 }, // 更新為 query.refetchInterval
    });

    const isQualified = userBalance ? userBalance >= QUALIFY_THRESHOLD : false;
    const prizeFormatted = prizePool ? (Number(prizePool) / 1e18).toFixed(2) : '0.00';
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
                <StatItem icon={PrizeIcon} title="獎池金額" value={`${prizeFormatted} USDT`} isLoading={isLoadingPrize} />
                <StatItem icon={WinnerIcon} title="最近中獎者" value="..." subValue="" isLoading={true} />
              </section>
            </main>
          </div>
        </div>
    );
}
