'use client';

import React, { useState, useEffect } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Building2,
  Calendar,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function DynamicPolicyRenderer({
  slug,
  fallbackTitle,
  fallbackNode = null,
  badgeIcon: BadgeIcon = Scale,
  badgeLabel = 'Legal & Policy',
}) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consented, setConsented] = useState(false);
  const [consenting, setConsenting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchPolicy() {
      try {
        setLoading(true);
        const res = await fetch(API_ENDPOINTS.POLICIES.PUBLIC_BY_SLUG(slug));
        const json = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (res.ok && json.status === 'success' && json.data) {
          setPolicy(json.data);
          setError(null);
        } else if (res.status === 404) {
          setError('unpublished');
        } else {
          setError(json.message || 'Failed to load policy');
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn(`Policy fetch error for ${slug}, using fallback if present:`, err.message);
        setError('network_error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (slug) {
      fetchPolicy();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Handle optional DPDP consent acknowledgement
  const handleAcknowledgeConsent = async () => {
    if (!policy) return;
    setConsenting(true);
    try {
      await fetch(API_ENDPOINTS.POLICIES.RECORD_CONSENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy_id: policy.id,
          slug: policy.slug,
          version: policy.version,
          consent_type: policy.consent_type,
        }),
      });
      setConsented(true);
    } catch (err) {
      console.warn('Consent record error:', err);
      setConsented(true); // Still reflect in UI
    } finally {
      setConsenting(false);
    }
  };

  // If loading and fallback is not provided, show skeleton
  if (loading && !fallbackNode) {
    return (
      <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans flex flex-col">
        <LandingNavbar />
        <main className="flex-1 pt-32 pb-20 px-4 max-w-5xl mx-auto w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-sm text-[#8B8B96]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#EB1000]" />
            <span>Loading legal agreement...</span>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  // If unpublished and not found
  if (error === 'unpublished' && !fallbackNode) {
    return (
      <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans flex flex-col">
        <LandingNavbar />
        <main className="flex-1 pt-32 pb-20 px-4 max-w-3xl mx-auto w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">Policy In Review</h1>
          <p className="text-sm text-[#8E8E9F]">
            This policy is currently undergoing periodic legal review or is not published. Please check back shortly.
          </p>
        </main>
        <LandingFooter />
      </div>
    );
  }

  // If policy is successfully loaded from backend, render dynamic database content
  if (policy && policy.content) {
    return (
      <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
        <LandingNavbar />

        <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
          {/* HERO HEADER */}
          <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-extrabold uppercase tracking-wider">
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{policy.category || badgeLabel}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
              {policy.title}
            </h1>

            {/* ENTITY DETAILS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] max-w-2xl mx-auto text-xs sm:text-sm text-[#A0A0B2] space-y-1 text-center shadow-md">
              <p className="text-white font-bold flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-[#EB1000]" />
                <span>Operated by: FuturePast Ventures LLP</span>
              </p>
              <p>LLPIN: ACQ-4984</p>
              <p>Registered Office: Pune, Maharashtra, India</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#8E8E9F] font-medium pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#EB1000]" />
                Effective Date: <strong>{policy.effective_date}</strong>
              </span>
              <span>•</span>
              <span className="font-mono bg-[#141422] px-2 py-0.5 rounded border border-[#222234]">
                v{policy.version}
              </span>
            </div>
          </section>

          {/* POLICY BODY (Rendered HTML from Backend TipTap) */}
          <section className="space-y-6">
            <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
              <div
                className="prose prose-invert max-w-none text-[#D0D0E0] text-sm sm:text-base leading-relaxed space-y-4 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-heading [&>h2]:font-extrabold [&>h2]:text-white [&>h2]:pt-4 [&>h2]:border-t [&>h2]:border-[#1C1C28] [&>h3]:text-base sm:[&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-white [&>p]:text-[#A0A0B2] [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>blockquote]:p-4 [&>blockquote]:rounded-2xl [&>blockquote]:bg-[#141422] [&>blockquote]:border [&>blockquote]:border-[#222234] [&>blockquote]:text-xs sm:[&>blockquote]:text-sm [&>blockquote]:text-[#D0D0E0] [&>table]:w-full [&>table]:border-collapse [&>table]:my-4 [&>table_th]:bg-[#181826] [&>table_th]:p-3 [&>table_td]:p-3 [&>table_td]:border [&>table_td]:border-[#222234]"
                dangerouslySetInnerHTML={{ __html: policy.content }}
              />
            </div>

            {/* Optional DPDP Consent Acknowledgement Bar */}
            {policy.is_consent_required && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#141422] border border-[#222234] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#A0A0B2]">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    By using AskMe, you acknowledge and agree to this policy (Version {policy.version}).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAcknowledgeConsent}
                  disabled={consented || consenting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    consented
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : 'bg-[#EB1000] hover:bg-[#D00E00] text-white shadow-lg cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{consented ? 'Acknowledged' : consenting ? 'Saving...' : 'Acknowledge Policy'}</span>
                </button>
              </div>
            )}
          </section>
        </main>

        <LandingFooter />
      </div>
    );
  }

  // Otherwise, render fallbackNode if available
  if (fallbackNode) {
    return <>{fallbackNode}</>;
  }

  return null;
}

