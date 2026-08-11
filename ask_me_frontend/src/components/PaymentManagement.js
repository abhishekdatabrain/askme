import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard,
  User,
  ArrowUpRight
} from 'lucide-react';

export default function PaymentManagement() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 'TXN-9901',
      creatorName: 'TechBurner Live',
      viewerName: 'Rohan Sharma',
      amount: '₹500',
      status: 'Successful',
      gatewayResponse: '200 OK (Razorpay: pay_Nzk89123)',
      paymentMethod: 'UPI / PhonePe',
      dateTime: '10 Aug 2026, 18:42:10'
    },
    {
      id: 'TXN-9902',
      creatorName: 'CA Rachana Ranade',
      viewerName: 'Aniket Verma',
      amount: '₹1,000',
      status: 'Successful',
      gatewayResponse: '200 OK (Stripe: ch_3M920192)',
      paymentMethod: 'Credit Card',
      dateTime: '10 Aug 2026, 18:35:14'
    },
    {
      id: 'TXN-9903',
      creatorName: 'CodeWithAnish',
      viewerName: 'Priya Patel',
      amount: '₹250',
      status: 'Failed',
      gatewayResponse: '400 Bad Request (UPI Timeout)',
      paymentMethod: 'Google Pay',
      dateTime: '10 Aug 2026, 17:50:02'
    },
    {
      id: 'TXN-9904',
      creatorName: 'TechBurner Live',
      viewerName: 'Amit Kumar',
      amount: '₹2,000',
      status: 'Refunded',
      gatewayResponse: '200 Refund Processed (askMail Unanswered)',
      paymentMethod: 'Netbanking',
      dateTime: '09 Aug 2026, 21:10:45'
    },
    {
      id: 'TXN-9905',
      creatorName: 'Sarah AI & Tech',
      viewerName: 'David Miller',
      amount: '₹100',
      status: 'Successful',
      gatewayResponse: '200 OK (Razorpay: pay_Kkm99120)',
      paymentMethod: 'Paytm Wallet',
      dateTime: '09 Aug 2026, 19:22:30'
    }
  ];

  const filteredTxns = transactions.filter(t => {
    const matchesFilter = activeFilter === 'All' || t.status === activeFilter;
    const matchesSearch = t.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.viewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#FFD60A]" />
            Payment Management
          </h2>
          <p className="text-xs text-[#8B8B96] mt-1">
            Monitor real-time viewer transactions, payment gateway status (Razorpay/Stripe), failed attempts, and automatic escrow refunds.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Successful', 'Failed', 'Refunded'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-brand-gradient text-[#0A0A0F] shadow-md'
                  : 'bg-[#13131A] text-[#8B8B96] hover:text-white border border-[#1C1C26]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1C1C26] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Transaction Ledger ({filteredTxns.length})
          </span>
          <div className="relative">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-[#8B8B96]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TXN ID, creator, viewer..."
              className="rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0A0F] border-b border-[#1C1C26] text-[#8B8B96] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Creator / Recipient</th>
                <th className="px-6 py-4">Viewer / Sender</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Method & Gateway Response</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C26]">
              {filteredTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#1C1C26]/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#00F5D4] font-bold">
                    {txn.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {txn.creatorName}
                  </td>
                  <td className="px-6 py-4 text-[#8B8B96]">
                    {txn.viewerName}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-[#FFD60A]">
                    {txn.amount}
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <div className="text-white font-semibold flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-[#00F5D4]" /> {txn.paymentMethod}
                    </div>
                    <span className="text-[10px] text-[#8B8B96] font-mono block">
                      {txn.gatewayResponse}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#8B8B96] font-mono text-[11px]">
                    {txn.dateTime}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      txn.status === 'Successful'
                        ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                        : txn.status === 'Failed'
                        ? 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                        : 'bg-[#7B2FFF]/10 text-[#7B2FFF] border border-[#7B2FFF]/30'
                    }`}>
                      {txn.status === 'Successful' && <CheckCircle2 className="h-3 w-3" />}
                      {txn.status === 'Failed' && <XCircle className="h-3 w-3" />}
                      {txn.status === 'Refunded' && <RotateCcw className="h-3 w-3" />}
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
