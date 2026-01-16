import Link from 'next/link';

export default function TokushoPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-8 inline-block">
                    ← Back to Home
                </Link>

                <h1 className="text-3xl font-bold neon-text-cyan mb-2">特定商取引法に基づく表記</h1>
                <p className="text-gray-500 text-sm mb-8">Last Updated: January 17, 2026</p>

                <div className="prose prose-invert max-w-none space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">販売業者</h3>
                            <p className="text-gray-300">EtchVox</p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">運営責任者</h3>
                            <p className="text-gray-300">木南智章</p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">所在地</h3>
                            <p className="text-gray-300">請求に応じて滞りなく開示します</p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">電話番号</h3>
                            <p className="text-gray-300">請求に応じて滞りなく開示します</p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">メールアドレス</h3>
                            <p className="text-gray-300">
                                <a href="mailto:info@etchvox.com" className="text-cyan-400 hover:underline">
                                    info@etchvox.com
                                </a>
                            </p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">販売価格</h3>
                            <p className="text-gray-300">
                                各プランページに表示された価格（税込）
                                <br />
                                - Video Unlock（動画アンロック）: $5.00 USD
                                <br />
                                - AI Identity Audit（ソロ分析）: $10.00 USD
                                <br />
                                - Couple Resonance Report（カップル分析）: $15.00 USD
                            </p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">商品代金以外の必要料金</h3>
                            <p className="text-gray-300">
                                インターネット接続料金、通信料金等はお客様のご負担となります。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">お支払い方法</h3>
                            <p className="text-gray-300">クレジットカード決済（Stripe経由）</p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">お支払い時期</h3>
                            <p className="text-gray-300">
                                クレジットカード会社の規約によります。通常、お申し込み時に即時決済されます。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">商品の引き渡し時期</h3>
                            <p className="text-gray-300">
                                決済完了後、AIによる分析レポートが生成されます（通常10〜20秒）。生成完了次第、結果画面にてご確認いただけます。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">返品・交換・キャンセル等</h3>
                            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mt-2">
                                <strong className="text-red-400">デジタルコンテンツの性質上、返金不可</strong>
                                <p className="text-gray-400 mt-2 text-sm">
                                    本サービスはAI生成によるデジタルコンテンツのため、一度生成が開始された後の返金、交換、キャンセルはお受けできません。
                                    ご購入前に内容を十分にご確認ください。
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">動作環境</h3>
                            <p className="text-gray-300">
                                最新版のChrome、Safari、Firefox、Edgeブラウザが必要です。
                                マイク機能が使用可能なデバイスが必要です。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-cyan-400 font-bold mb-2">その他</h3>
                            <p className="text-gray-300">
                                ご不明な点がございましたら、<a href="mailto:info@etchvox.com" className="text-cyan-400 hover:underline">info@etchvox.com</a> までお問い合わせください。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
