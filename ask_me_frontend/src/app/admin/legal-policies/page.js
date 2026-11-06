'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';

const PolicyEditor = dynamic(() => import('@/components/PolicyEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] flex items-center justify-center text-sm text-[#707085]">
      Loading TipTap Policy Editor...
    </div>
  ),
});
import {
  Scale,
  Search,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Send,
  Save,
  Trash2,
  X,
  FileText,
  ShieldCheck,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Tag,
  Check,
} from 'lucide-react';

const CATEGORIES = ['All', 'Legal', 'Privacy & Compliance', 'Financial', 'Safety & Community', 'Creator Agreement'];

export default function AdminLegalPoliciesPage() {
  const { toast } = useToast();

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'seo' | 'versioning'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryPolicy, setSelectedHistoryPolicy] = useState(null);
  const [historyVersions, setHistoryVersions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Legal',
    content: '',
    effective_date: new Date().toISOString().split('T')[0],
    display_order: 1,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_consent_required: false,
    consent_type: '',
    version: '1.0',
    changelog: '',
    is_material_change: false,
  });

  // Fetch policies
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.POLICIES.ADMIN_LIST, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        setPolicies(data.data || []);
      } else {
        toast?.error?.(data.message || 'Failed to fetch legal policies');
      }
    } catch (err) {
      console.error('Fetch policies error:', err);
      toast?.error?.('Network error while fetching policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Filtered policies list
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [policies, searchQuery, statusFilter, categoryFilter]);

  // Open Editor for Edit
  const handleOpenEditor = (policy) => {
    setEditingPolicy(policy);
    setActiveTab('content');
    // If draft exists, load draft_content; otherwise load live content
    const currentEditorContent = policy.has_draft && policy.draft_content ? policy.draft_content : policy.content;

    setFormData({
      title: policy.title || '',
      slug: policy.slug || '',
      category: policy.category || 'Legal',
      content: currentEditorContent || '',
      effective_date: policy.effective_date || new Date().toISOString().split('T')[0],
      display_order: policy.display_order || 1,
      meta_title: policy.meta_title || `${policy.title} | AskMe`,
      meta_description: policy.meta_description || '',
      meta_keywords: policy.meta_keywords || '',
      is_consent_required: !!policy.is_consent_required,
      consent_type: policy.consent_type || '',
      version: policy.version || '1.0',
      changelog: '',
      is_material_change: false,
    });
    setIsEditorOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setActiveTab('content');
    setFormData({
      title: '',
      slug: '',
      category: 'Legal',
      content: '<h2>1. Section Title</h2><p>Write your legal policy text here...</p>',
      effective_date: new Date().toISOString().split('T')[0],
      display_order: policies.length + 1,
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_consent_required: false,
      consent_type: '',
      version: '1.0',
      changelog: 'Initial version created.',
      is_material_change: false,
    });
    setIsEditorOpen(true);
  };

  // Open History Drawer
  const handleOpenHistory = async (policy) => {
    setSelectedHistoryPolicy(policy);
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.POLICIES.ADMIN_VERSIONS(policy.id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        setHistoryVersions(data.data || []);
      } else {
        toast?.error?.(data.message || 'Failed to load versions');
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open Preview Modal
  const handleOpenPreview = (policyOrData) => {
    setPreviewData(policyOrData);
    setIsPreviewOpen(true);
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    if (!editingPolicy) {
      toast?.error?.('Please create policy first before saving draft.');
      return;
    }
    setSubmitting(true);
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.POLICIES.ADMIN_UPDATE(editingPolicy.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          save_as_draft: true,
          draft_content: formData.content,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        toast?.success?.('Draft saved successfully! Live version remains unchanged.');
        fetchPolicies();
        setIsEditorOpen(false);
      } else {
        toast?.error?.(data.message || 'Failed to save draft');
      }
    } catch (err) {
      console.error('Save draft error:', err);
      toast?.error?.('Network error while saving draft.');
    } finally {
      setSubmitting(false);
    }
  };

  // Publish Policy Handler
  const handlePublish = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast?.error?.('Title and Slug are required.');
      return;
    }
    if (!formData.content || !formData.content.trim()) {
      toast?.error?.('Policy content cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const token = getAdminToken();
      let res;

      if (editingPolicy) {
        // Publish existing policy
        res = await fetch(API_ENDPOINTS.POLICIES.ADMIN_PUBLISH(editingPolicy.id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            content: formData.content,
            effective_date: formData.effective_date,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            meta_keywords: formData.meta_keywords,
            is_consent_required: formData.is_consent_required,
            consent_type: formData.consent_type,
            version: formData.version,
            changelog: formData.changelog,
            is_material_change: formData.is_material_change,
          }),
        });
      } else {
        // Create and publish new policy
        res = await fetch(API_ENDPOINTS.POLICIES.ADMIN_CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ...formData,
            status: 'published',
          }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        toast?.success?.(
          formData.is_material_change
            ? `Policy published as version ${formData.version} with DPDP re-consent trigger!`
            : `Policy published successfully as version ${formData.version}!`
        );
        fetchPolicies();
        setIsEditorOpen(false);
      } else {
        toast?.error?.(data.message || 'Failed to publish policy');
      }
    } catch (err) {
      console.error('Publish error:', err);
      toast?.error?.('Network error while publishing policy.');
    } finally {
      setSubmitting(false);
    }
  };

  // Unpublish / Set to Draft
  const handleTogglePublishStatus = async (policy) => {
    const isCurrentlyPublished = policy.status === 'published';
    const action = isCurrentlyPublished ? 'unpublish' : 'publish';

    if (
      !confirm(
        isCurrentlyPublished
          ? `Are you sure you want to unpublish "${policy.title}"? Users visiting the public URL will receive a 404/not available page.`
          : `Publish "${policy.title}" to make it visible to public visitors?`
      )
    ) {
      return;
    }

    try {
      const token = getAdminToken();
      const endpoint = isCurrentlyPublished
        ? API_ENDPOINTS.POLICIES.ADMIN_UNPUBLISH(policy.id)
        : API_ENDPOINTS.POLICIES.ADMIN_PUBLISH(policy.id);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          changelog: isCurrentlyPublished ? 'Unpublished by admin' : 'Re-published by admin',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        toast?.success?.(isCurrentlyPublished ? 'Policy unpublished (set to draft).' : 'Policy published successfully!');
        fetchPolicies();
      } else {
        toast?.error?.(data.message || 'Action failed.');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Discard Draft
  const handleDiscardDraft = async (policyId) => {
    if (!confirm('Discard all unpublished changes and revert to the live version?')) return;
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.POLICIES.ADMIN_DISCARD_DRAFT(policyId), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        toast?.success?.('Draft discarded successfully.');
        fetchPolicies();
        setIsEditorOpen(false);
      } else {
        toast?.error?.(data.message || 'Failed to discard draft.');
      }
    } catch (err) {
      console.error('Discard draft error:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in text-[#F5F5F7] selection:bg-[#EB1000] selection:text-white">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#1C1C26]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#EB1000]/10 text-[#EB1000] font-mono font-bold text-[11px] border border-[#EB1000]/30 uppercase tracking-wider">
              LEGAL & COMPLIANCE MODULE
            </span>
            <span className="text-xs text-[#8B8B96]">· DPDP Act 2023 & IT Act 2000</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white mt-1">
            Legal Policy Management
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8B96] mt-0.5">
            Manage all 12 platform legal policies, rich-text content, draft vs published states, and immutable audit versions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={fetchPolicies}
            className="p-2.5 rounded-xl bg-[#13131A] border border-[#1C1C26] text-[#8B8B96] hover:text-white transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EB1000] hover:bg-[#D00E00] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#EB1000]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Policy</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E]">
          <div className="flex items-center justify-between text-xs text-[#8B8B96]">
            <span>Total Policies</span>
            <Scale className="w-4 h-4 text-[#EB1000]" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{policies.length}</p>
          <span className="text-[11px] text-[#00F5D4] mt-0.5 block">12 Core Legal Agreements</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E]">
          <div className="flex items-center justify-between text-xs text-[#8B8B96]">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {policies.filter((p) => p.status === 'published').length}
          </p>
          <span className="text-[11px] text-[#8B8B96] mt-0.5 block">Accessible to Public</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E]">
          <div className="flex items-center justify-between text-xs text-[#8B8B96]">
            <span>Unpublished Drafts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {policies.filter((p) => p.has_draft || p.status === 'draft').length}
          </p>
          <span className="text-[11px] text-[#8B8B96] mt-0.5 block">Pending Review / Publish</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E]">
          <div className="flex items-center justify-between text-xs text-[#8B8B96]">
            <span>Consent Mandatory</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400 mt-2">
            {policies.filter((p) => p.is_consent_required).length}
          </p>
          <span className="text-[11px] text-[#8B8B96] mt-0.5 block">DPDP Act Tracked</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#707085] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies by title, slug or category..."
            className="w-full pl-10 pr-4 py-2 bg-[#07070C] border border-[#1E1E2E] rounded-xl text-xs sm:text-sm text-white placeholder-[#707085] focus:outline-none focus:border-[#EB1000] transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'published', 'draft', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-[#EB1000] text-white shadow-md'
                  : 'bg-[#141420] text-[#9090A0] hover:text-white hover:bg-[#1E1E2C]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Listing Table */}
      <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#12121E] border-b border-[#1E1E2E] text-xs font-semibold text-[#808096] uppercase tracking-wider">
                <th className="py-4 px-5">Policy Name & Slug</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Version & Date</th>
                <th className="py-4 px-4">Status & Drafts</th>
                <th className="py-4 px-4">DPDP Consent</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A28] text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#707085]">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#EB1000]" />
                      <span>Loading legal policies...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#707085]">
                    No policies found matching your search.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => {
                  const isPublished = policy.status === 'published';
                  const hasDraft = policy.has_draft;

                  return (
                    <tr
                      key={policy.id}
                      className="hover:bg-[#141422]/70 transition-colors group"
                    >
                      {/* Name & Slug */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-[#EB1000] transition-colors flex items-center gap-1.5">
                            {policy.title}
                          </span>
                          <span className="font-mono text-xs text-[#707085] flex items-center gap-1 mt-0.5">
                            /{policy.slug}
                            <Link
                              href={`/${policy.slug}`}
                              target="_blank"
                              className="text-[#EB1000] hover:text-white transition"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1A1A28] text-[#C0C0D4] border border-[#252538]">
                          {policy.category || 'Legal'}
                        </span>
                      </td>

                      {/* Version & Date */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-mono font-bold text-white bg-[#1A1A28] px-2 py-0.5 rounded w-fit border border-[#26263A]">
                            v{policy.version}
                          </span>
                          <span className="text-[#707085] mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {policy.effective_date}
                          </span>
                        </div>
                      </td>

                      {/* Status & Drafts */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isPublished
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {isPublished ? 'Published' : 'Draft'}
                          </span>

                          {hasDraft && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Sparkles className="w-2.5 h-2.5" />
                              Unpublished Draft
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Consent Requirement */}
                      <td className="py-4 px-4">
                        {policy.is_consent_required ? (
                          <span className="inline-flex items-center gap-1 text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Mandatory Consent
                          </span>
                        ) : (
                          <span className="text-xs text-[#606070]">Informational</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(policy)}
                            className="p-2 rounded-xl bg-[#141420] text-[#9090A0] hover:text-white hover:bg-[#1E1E2C] transition cursor-pointer"
                            title="Preview Content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Version History */}
                          <button
                            type="button"
                            onClick={() => handleOpenHistory(policy)}
                            className="p-2 rounded-xl bg-[#141420] text-[#9090A0] hover:text-white hover:bg-[#1E1E2C] transition cursor-pointer"
                            title="Version History & DPDP Audit"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditor(policy)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 hover:bg-[#EB1000] hover:text-white transition cursor-pointer text-xs font-bold"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Toggle Publish / Unpublish */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublishStatus(policy)}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                              isPublished
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                            }`}
                            title={isPublished ? 'Unpublish (Set to Draft)' : 'Publish to Live Website'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FULL EDITOR MODAL (TipTap Rich Text + SEO + DPDP Settings)  */}
      {/* ============================================================ */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-5xl bg-[#0D0D14] border border-[#222235] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1E1E2E] bg-[#11111C]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EB1000]/15 border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {editingPolicy ? `Edit: ${formData.title || editingPolicy.title}` : 'Create New Legal Policy'}
                    {editingPolicy?.has_draft && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Editing Draft
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#808096]">
                    Slug: <span className="font-mono text-white">/{formData.slug || 'custom-slug'}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-[#808096] hover:text-white hover:bg-[#1E1E2E] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Draft Notice if draft exists */}
            {editingPolicy?.has_draft && (
              <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    You have an unpublished draft saved. Visitors on the live site are currently seeing version{' '}
                    <strong>v{editingPolicy.version}</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDiscardDraft(editingPolicy.id)}
                  className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition text-[11px] font-bold"
                >
                  Discard Draft
                </button>
              </div>
            )}

            {/* Modal Tabs Header */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1E1E2E] bg-[#0E0E18] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'content'
                    ? 'border-[#EB1000] text-white'
                    : 'border-transparent text-[#707085] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Policy Content (TipTap Editor)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'seo'
                    ? 'border-[#EB1000] text-white'
                    : 'border-transparent text-[#707085] hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>SEO & Metadata</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('versioning')}
                className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'versioning'
                    ? 'border-[#EB1000] text-white'
                    : 'border-transparent text-[#707085] hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>DPDP Versioning & Re-consent</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-[#0A0A10]">
              {/* TAB 1: Content & Basic Info */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-[#A0A0B2] uppercase">Policy Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Terms and Conditions"
                        className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm text-white focus:outline-none focus:border-[#EB1000]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#A0A0B2] uppercase">Slug *</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="terms-and-conditions"
                        className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#EB1000]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#A0A0B2] uppercase">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm text-white focus:outline-none focus:border-[#EB1000]"
                      >
                        {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#A0A0B2] uppercase">Effective Date</label>
                      <input
                        type="date"
                        value={formData.effective_date}
                        onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm text-white focus:outline-none focus:border-[#EB1000]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#A0A0B2] uppercase">Display Order</label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm text-white focus:outline-none focus:border-[#EB1000]"
                      />
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#A0A0B2] uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#EB1000]" />
                        <span>Policy Body Content (Rich Text)</span>
                      </label>
                      <span className="text-[11px] text-[#707085]">
                        Full Headings, Lists, Links, Quotes & Tables Supported
                      </span>
                    </div>

                    <PolicyEditor
                      content={formData.content}
                      onChange={(newHtml) => setFormData({ ...formData, content: newHtml })}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SEO & Meta */}
              {activeTab === 'seo' && (
                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#A0A0B2] uppercase">Meta Title</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="e.g. Privacy Policy | AskMe"
                      className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm text-white focus:outline-none focus:border-[#EB1000]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#A0A0B2] uppercase">Meta Description</label>
                    <textarea
                      rows="3"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Search engine summary of this policy..."
                      className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm text-white focus:outline-none focus:border-[#EB1000]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#A0A0B2] uppercase">Meta Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="e.g. privacy policy, dpdp act, personal data, askme"
                      className="w-full px-3.5 py-2.5 bg-[#12121E] border border-[#222235] rounded-xl text-sm text-white focus:outline-none focus:border-[#EB1000]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: DPDP Versioning & Re-consent */}
              {activeTab === 'versioning' && (
                <div className="space-y-5 max-w-2xl">
                  <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#00F5D4]" />
                      <span>DPDP Act 2023 Consent Controls</span>
                    </h3>
                    <p className="text-xs text-[#A0A0B2]">
                      Specify whether users must accept this agreement during onboarding or interaction, and whether
                      material amendments necessitate re-noticing and renewed consent.
                    </p>

                    <label className="flex items-center gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={formData.is_consent_required}
                        onChange={(e) => setFormData({ ...formData, is_consent_required: e.target.checked })}
                        className="w-4 h-4 accent-[#EB1000] rounded"
                      />
                      <span className="text-xs sm:text-sm text-white font-medium">
                        Require Explicit User / Creator Consent for this Policy
                      </span>
                    </label>

                    {formData.is_consent_required && (
                      <div className="pt-2">
                        <label className="text-xs font-bold text-[#A0A0B2] uppercase">Consent Type Identifier</label>
                        <input
                          type="text"
                          value={formData.consent_type}
                          onChange={(e) => setFormData({ ...formData, consent_type: e.target.value })}
                          placeholder="e.g. terms_and_conditions"
                          className="w-full mt-1 px-3.5 py-2 bg-[#0A0A10] border border-[#222235] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#EB1000]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-[#EB1000]" />
                      <span>Publishing Version Snapshot</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#A0A0B2] uppercase">Target Version Number</label>
                        <input
                          type="text"
                          value={formData.version}
                          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                          placeholder="e.g. 1.1 or 2.0"
                          className="w-full px-3.5 py-2 bg-[#0A0A10] border border-[#222235] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#EB1000]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#A0A0B2] uppercase">Current Live Version</label>
                        <p className="px-3.5 py-2 bg-[#0A0A10] border border-[#222235] rounded-xl text-xs font-mono text-[#808096]">
                          {editingPolicy ? `v${editingPolicy.version}` : 'New Policy'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#A0A0B2] uppercase">
                        Changelog / Summary of Changes
                      </label>
                      <textarea
                        rows="2"
                        value={formData.changelog}
                        onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                        placeholder="Describe what changed in this version snapshot for the audit trail..."
                        className="w-full px-3.5 py-2 bg-[#0A0A10] border border-[#222235] rounded-xl text-xs text-white focus:outline-none focus:border-[#EB1000]"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/30">
                      <input
                        type="checkbox"
                        checked={formData.is_material_change}
                        onChange={(e) => setFormData({ ...formData, is_material_change: e.target.checked })}
                        className="w-4 h-4 accent-[#EB1000] rounded mt-0.5"
                      />
                      <div>
                        <span className="text-xs sm:text-sm text-white font-bold block">
                          Material Change (Requires DPDP User Re-consent)
                        </span>
                        <span className="text-[11px] text-[#A0A0B2] block mt-0.5">
                          Check this if changes affect data processing purposes, international sharing, or core rights.
                          This will mark the policy as requiring re-consent from active users.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#1E1E2E] bg-[#11111C] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenPreview({
                      title: formData.title,
                      content: formData.content,
                      version: formData.version,
                      effective_date: formData.effective_date,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1A28] hover:bg-[#252538] text-white text-xs font-semibold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {editingPolicy && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1A28] hover:bg-[#26263A] border border-[#2A2A3E] text-amber-400 hover:text-amber-300 text-xs font-bold transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#EB1000] hover:bg-[#D00E00] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#EB1000]/20 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Publishing...' : 'Publish to Live Site'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PUBLIC PREVIEW MODAL                                         */}
      {/* ============================================================ */}
      {isPreviewOpen && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#07070C] border border-[#1E1E2E] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#F5F5F7]">
            {/* Preview Top Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1E1E2E] bg-[#0E0E18]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EB1000]/20 text-[#EB1000] border border-[#EB1000]/30 uppercase">
                  LIVE PREVIEW
                </span>
                <span className="text-xs text-[#808096]">As visible to users on website</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-[#808096] hover:text-white hover:bg-[#1E1E28] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content Area */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-[#07070C]">
              <div className="text-center space-y-3 border-b border-[#1E1E2E] pb-6">
                <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase">
                  {previewData.title}
                </h1>
                <div className="text-xs text-[#808096] flex items-center justify-center gap-3">
                  <span>
                    Version: <strong>v{previewData.version}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Effective Date: <strong>{previewData.effective_date}</strong>
                  </span>
                </div>
              </div>

              {/* Rendered HTML */}
              <div
                className="prose prose-invert max-w-none text-[#D0D0E0] text-sm sm:text-base leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: previewData.content }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VERSION HISTORY & AUDIT DRAWER (DPDP Compliance)             */}
      {/* ============================================================ */}
      {isHistoryOpen && selectedHistoryPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#0D0D14] border-l border-[#222235] p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1E1E2E]">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-[#EB1000]" />
                  <div>
                    <h3 className="font-bold text-white text-base">Version Audit Trail</h3>
                    <p className="text-xs text-[#808096]">{selectedHistoryPolicy.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-lg text-[#808096] hover:text-white hover:bg-[#1E1E28] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[78vh] pr-1">
                {loadingHistory ? (
                  <div className="py-12 text-center text-xs text-[#707085]">Loading audit snapshots...</div>
                ) : historyVersions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#707085]">No versions recorded yet.</div>
                ) : (
                  historyVersions.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-2xl bg-[#12121E] border border-[#222235] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white bg-[#1A1A28] px-2 py-0.5 rounded border border-[#2B2B3E]">
                          v{v.version}
                        </span>
                        <span className="text-[11px] text-[#707085]">
                          {new Date(v.published_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-[#C0C0D4] text-xs">{v.changelog || 'Published updated policy.'}</p>

                      <div className="flex items-center justify-between text-[11px] text-[#808096] pt-1 border-t border-[#1E1E2E]">
                        <span>Publisher: {v.publisher_name || 'Admin'}</span>
                        {v.is_material_change && (
                          <span className="text-amber-400 font-bold">Material Change</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E1E2E] text-center">
              <span className="text-[11px] text-[#606075]">Immutable Records for DPDP Act 2023 Compliance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

