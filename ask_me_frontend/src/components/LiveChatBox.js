'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/config/socket';
import { API_ENDPOINTS } from '@/config/api';
import { Send, Heart, DollarSign, MessageSquare, CornerDownRight, CheckCircle2, Shield, Sparkles, User, RefreshCw, X } from 'lucide-react';

export default function LiveChatBox({ sessionId = 1, userType = 'viewer', userId = 0, userName = 'Viewer', creatorName = 'Creator' }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [replyingToDonation, setReplyingToDonation] = useState(null); // Donation message object being replied to
  const [replyText, setReplyText] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      // Join Room live_session_{sessionId}
      socket.emit('join_session', { sessionId, userType, userId, userName });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onChatHistory = (data) => {
      if (data.sessionId == sessionId) {
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 100);
      }
    };

    const onNewMessage = (msg) => {
      if (msg.sessionId == sessionId) {
        setMessages(prev => {
          // Avoid duplicate messages if already present
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    const onNewDonation = (msg) => {
      if (msg.sessionId == sessionId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    const onDonationReplied = (replyMsg) => {
      if (replyMsg.sessionId == sessionId) {
        setMessages(prev => {
          if (prev.some(m => m.id === replyMsg.id)) return prev;
          return [...prev, replyMsg];
        });
        setTimeout(scrollToBottom, 100);
      }
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat_history', onChatHistory);
    socket.on('new_message', onNewMessage);
    socket.on('new_donation', onNewDonation);
    socket.on('donation_replied', onDonationReplied);

    // Initial fetch fallback if socket delayed
    fetch(`${API_ENDPOINTS.CREATORS.CHAT_MESSAGES}/${sessionId}/messages`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data?.messages) {
          setMessages(prev => (prev.length === 0 ? data.data.messages : prev));
        }
      })
      .catch(() => null);

    return () => {
      socket.emit('leave_session', { sessionId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat_history', onChatHistory);
      socket.off('new_message', onNewMessage);
      socket.off('new_donation', onNewDonation);
      socket.off('donation_replied', onDonationReplied);
    };
  }, [sessionId, userType, userId, userName]);

  // Send Normal Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim()) return;

    const socket = getSocket();
    socket.emit('send_message', {
      sessionId,
      senderType: userType,
      senderId: userId,
      senderName: userName,
      message: inputText.trim(),
    });

    setInputText('');
  };

  // Creator Submits Reply to Donation Message
  const handleSendDonationReply = async (e) => {
    e.preventDefault();
    if (!replyingToDonation || !replyText || !replyText.trim()) return;

    const donationId = replyingToDonation.donationId || replyingToDonation.id;
    const socket = getSocket();

    // 1. Emit via Socket.IO
    socket.emit('send_donation_reply', {
      sessionId,
      senderId: userId || 1,
      senderName: userName || creatorName || 'Creator Host',
      donationId,
      message: replyText.trim(),
    });

    // 2. Fallback REST API call
    try {
      await fetch(API_ENDPOINTS.CREATORS.CHAT_REPLY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          creatorId: userId || 1,
          senderName: userName || creatorName || 'Creator Host',
          donationId,
          message: replyText.trim(),
        })
      });
    } catch (err) {
      console.warn('REST reply notice:', err.message);
    }

    setReplyingToDonation(null);
    setReplyText('');
  };

  return (
    <div className="flex flex-col h-[460px] bg-[#13131A] border border-[#1C1C26] rounded-3xl overflow-hidden shadow-2xl font-sans">
      
      {/* Live Chat Room Header */}
      <div className="p-3.5 bg-[#0A0A0F]/90 border-b border-[#1C1C26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#00E676] animate-pulse" />
          <span className="font-heading font-black text-xs text-white uppercase tracking-wider">
            Live Stream Chat (Room: live_session_{sessionId})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#8B8B96] bg-[#1C1C26] px-2 py-0.5 rounded-full">
            {isConnected ? '⚡ Socket Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-[#0A0A0F]/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#8B8B96]">
            <MessageSquare className="h-8 w-8 stroke-1 text-[#8B8B96]/60" />
            <p className="text-xs font-semibold">No chat messages yet.</p>
            <p className="text-[11px]">Be the first to send a message or support with a donation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCreator = msg.senderType === 'creator';
            const isDonation = msg.messageType === 'donation';
            const isDonationReply = msg.messageType === 'donation_reply';

            // Find parent donation message if this is a reply
            const parentDonation = isDonationReply
              ? messages.find(m => m.donationId === msg.donationId || m.id === msg.donationId)
              : null;

            return (
              <div key={msg.id || index} className="space-y-1 animate-fade-in">
                
                {/* DONATION MESSAGE (Highlight Card) */}
                {isDonation && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFD60A]/15 via-[#13131A] to-[#00E676]/10 border-2 border-[#FFD60A]/40 space-y-2 shadow-lg relative glow-pay">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFD60A] text-[#0A0A0F] font-black text-[11px] shadow-sm flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> DONATION
                        </span>
                        <span className="font-bold text-xs text-white">
                          {msg.senderName || 'Supporter'}
                        </span>
                      </div>

                      {msg.amount && (
                        <span className="font-heading font-black text-sm text-[#00E676]">
                          ₹{parseFloat(msg.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#00F5D4] italic font-semibold pl-1">
                      "{msg.message}"
                    </p>

                    {/* Creator Quick Reply Button */}
                    {userType === 'creator' && (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToDonation(msg);
                            setReplyText('');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[#00F5D4]/20 border border-[#00F5D4]/40 text-[#00F5D4] text-[10px] font-bold hover:bg-[#00F5D4]/30 transition flex items-center gap-1"
                        >
                          <CornerDownRight className="h-3 w-3" /> Reply to Donation
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* DONATION REPLY MESSAGE (Creator Reply Card) */}
                {isDonationReply && (
                  <div className="p-3 rounded-2xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 space-y-1 ml-4 shadow-md">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#7B2FFF] font-bold">
                      <CornerDownRight className="h-3 w-3" />
                      <span>{msg.senderName || creatorName || 'Creator'} replied:</span>
                    </div>

                    <p className="text-xs text-white font-bold pl-3 border-l-2 border-[#7B2FFF]">
                      {msg.message}
                    </p>
                  </div>
                )}

                {/* NORMAL CHAT MESSAGE */}
                {!isDonation && !isDonationReply && (
                  <div className={`p-2.5 rounded-2xl text-xs space-y-0.5 ${
                    isCreator
                      ? 'bg-[#00F5D4]/10 border border-[#00F5D4]/30 ml-4'
                      : 'bg-[#1A1A26] border border-[#1C1C26]'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-[11px] ${isCreator ? 'text-[#00F5D4]' : 'text-white'}`}>
                        {msg.senderName || (isCreator ? 'Creator Host' : 'Viewer')}
                      </span>
                      {isCreator && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#00F5D4] text-[#0A0A0F]">
                          HOST
                        </span>
                      )}
                    </div>
                    <p className="text-[#F5F5F7] text-xs leading-relaxed">{msg.message}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CREATOR INLINE REPLY BOX */}
      {replyingToDonation && (
        <div className="p-3 bg-[#7B2FFF]/15 border-t border-[#7B2FFF]/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-white">
            <span className="font-bold flex items-center gap-1">
              <CornerDownRight className="h-3.5 w-3.5 text-[#00F5D4]" /> Replying to {replyingToDonation.senderName}'s donation
            </span>
            <button
              onClick={() => setReplyingToDonation(null)}
              className="text-[#8B8B96] hover:text-white p-0.5 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSendDonationReply} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Thank ${replyingToDonation.senderName}... e.g. Thank you Rahul ❤️`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#7B2FFF]/40 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[#7B2FFF] text-white text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" /> Send Reply
            </button>
          </form>
        </div>
      )}

      {/* INPUT BAR */}
      {!replyingToDonation && (
        <form onSubmit={handleSendMessage} className="p-3 bg-[#0A0A0F] border-t border-[#1C1C26] flex items-center gap-2">
          <input
            type="text"
            placeholder={userType === 'creator' ? 'Send a message as Host...' : 'Chat with creator & stream viewers...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-[#13131A] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-extrabold shadow-md glow-teal hover:opacity-95 flex items-center gap-1"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        </form>
      )}
    </div>
  );
}
