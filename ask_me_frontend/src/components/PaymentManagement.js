import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Clock
} from 'lucide-react';

export default function PaymentManagement({ activeSubTab }) {
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
      creatorName: 'GamerX Xtreme',
      viewerName: 'Vikas Roy',
      amount: '₹100',
      status: 'Pending',
      gatewayResponse: '102 Processing Gateway Response',
      paymentMethod: 'Paytm UPI',
      dateTime: '10 Aug 2026, 19:02:15'
    }
  ];

  useEffect(() => {
    if (activeSubTab === 'payments_all') {
      setActiveFilter('All');
    } else if (activeSubTab === 'payments_successful') {
      setActiveFilter('Successful');
    } else if (activeSubTab === 'payments_failed') {
      setActiveFilter('Failed');
    } else if (activeSubTab === 'payments_pending') {
      setActiveFilter('Pending');
    } else if (activeSubTab === 'payments_refunds') {
      setActiveFilter('Refunded');
    }
  }, [activeSubTab]);

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = activeFilter === 'All' || t.status === activeFilter;
    const matchesSearch = t.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.viewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#00F5D4]" />
            Payment Management & Gateway Audit Logs
          </h2>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            Audit live payment transactions, successful charges, gateway failures, and automatic refunds.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', 'Successful', 'Failed', 'Pending', 'Refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === status
                  ? 'bg-brand-gradient text-[#0A0A0F]'
                  : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B96]" />
        <input
          type="text"
          placeholder="Search by Transaction ID, Creator or Viewer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0A0A0F] border border-[#1C1C26] rounded-xl text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
        />
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
              <th className="pb-3 px-2">TXN ID</th>
              <th className="pb-3 px-2">CREATOR / VIEWER</th>
              <th className="pb-3 px-2">AMOUNT</th>
              <th className="pb-3 px-2">METHOD</th>
              <th className="pb-3 px-2">STATUS</th>
              <th className="pb-3 px-2">GATEWAY AUDIT RESPONSE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C26]">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-[#0A0A0F]/60 transition">
                <td className="py-3.5 px-2 font-mono text-[#00F5D4] font-bold">{t.id}</td>
                <td className="py-3.5 px-2">
                  <div className="font-bold text-white">{t.creatorName}</div>
                  <div className="text-[10px] text-[#8B8B96]">By {t.viewerName} • {t.dateTime}</div>
                </td>
                <td className="py-3.5 px-2 font-bold text-white">{t.amount}</td>
                <td className="py-3.5 px-2 text-[#8B8B96]">{t.paymentMethod}</td>
                <td className="py-3.5 px-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${
                    t.status === 'Successful' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' :
                    t.status === 'Failed' ? 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30' :
                    t.status === 'Pending' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30' :
                    'bg-[#7B2FFF]/10 text-[#7B2FFF] border border-[#7B2FFF]/30'
                  }`}>
                    {t.status === 'Successful' && <CheckCircle2 className="h-3 w-3" />}
                    {t.status === 'Failed' && <XCircle className="h-3 w-3" />}
                    {t.status === 'Pending' && <Clock className="h-3 w-3" />}
                    {t.status === 'Refunded' && <RotateCcw className="h-3 w-3" />}
                    {t.status}
                  </span>
                </td>
                <td className="py-3.5 px-2 font-mono text-[10px] text-[#8B8B96]">{t.gatewayResponse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
