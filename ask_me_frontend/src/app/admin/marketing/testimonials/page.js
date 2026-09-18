'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Star,
  RefreshCw,
} from 'lucide-react';

const CATEGORY_OPTIONS = ['All', 'Technology', 'Finance', 'Gaming', 'Education', 'Health', 'General'];
const PLATFORM_OPTIONS = ['YouTube', 'Twitch', 'Instagram', 'Facebook', 'Kick', 'Other'];

export default function AdminTestimonialsPage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState('dark');

  // List State
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    creator_name: '',
    username: '',
    profile_image: '',
    testimonial: '',
    metric_label: '',
    metric_value: '',
    creator_type: '',
    platform: 'YouTube',
    social_handle: '',
    followers: '',
    profile_link: '',
    verified: true,
    category: 'Technology',
    display_order: 1,
    featured: false,
    show_on_landing_page: true,
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch Testimonials
  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.TESTIMONIALS.ADMIN, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTestimonials(data.data || []);
      } else {
        toast?.error?.(data.message || 'Failed to load testimonials');
      }
    } catch (err) {
      console.error('Fetch testimonials error:', err);
      toast?.error?.('Network error fetching testimonials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Filtered Testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.creator_name?.toLowerCase().includes(q);
        const matchesUser = item.username?.toLowerCase().includes(q);
        const matchesType = item.creator_type?.toLowerCase().includes(q);
        const matchesMsg = item.testimonial?.toLowerCase().includes(q);
        if (!matchesName && !matchesUser && !matchesType && !matchesMsg) return false;
      }
      return true;
    });
  }, [testimonials, statusFilter, categoryFilter, searchQuery]);

  // Open Add Form
  const handleOpenAdd = () => {
    const nextOrder = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.display_order || 0)) + 1 : 1;
    setEditingItem(null);
    setFormData({
      creator_name: '',
      username: '',
      profile_image: '',
      testimonial: '',
      metric_label: '',
      metric_value: '',
      creator_type: '',
      platform: 'YouTube',
      social_handle: '',
      followers: '',
      profile_link: '',
      verified: true,
      category: 'Technology',
      display_order: nextOrder,
      featured: false,
      show_on_landing_page: true,
      status: 'active',
    });
    setSelectedFile(null);
    setImagePreview('');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      creator_name: item.creator_name || '',
      username: item.username || '',
      profile_image: item.profile_image || '',
      testimonial: item.testimonial || '',
      metric_label: item.metric_label || '',
      metric_value: item.metric_value || '',
      creator_type: item.creator_type || '',
      platform: item.platform || 'YouTube',
      social_handle: item.social_handle || '',
      followers: item.followers || '',
      profile_link: item.profile_link || '',
      verified: item.verified !== undefined ? item.verified : true,
      category: item.category || 'Technology',
      display_order: item.display_order || 1,
      featured: item.featured !== undefined ? item.featured : false,
      show_on_landing_page: item.show_on_landing_page !== undefined ? item.show_on_landing_page : true,
      status: item.status || 'active',
    });
    setSelectedFile(null);
    setImagePreview(item.profile_image ? getMediaUrl(item.profile_image) : '');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // File Change Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast?.error?.('Only JPG, JPEG, PNG, and WEBP formats are supported.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast?.error?.('Image size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.creator_name || !formData.creator_name.trim()) {
      errors.creator_name = 'Creator Name is required.';
    } else if (formData.creator_name.length > 100) {
      errors.creator_name = 'Creator Name must not exceed 100 characters.';
    }

    if (!formData.username || !formData.username.trim()) {
      errors.username = 'Username / Handle is required.';
    } else if (formData.username.length > 100) {
      errors.username = 'Username must not exceed 100 characters.';
    }

    if (!formData.testimonial || !formData.testimonial.trim()) {
      errors.testimonial = 'Testimonial message is required.';
    } else if (formData.testimonial.length > 1000) {
      errors.testimonial = 'Testimonial message must not exceed 1000 characters.';
    }

    if (!formData.metric_label || !formData.metric_label.trim()) {
      errors.metric_label = 'Metric Label is required.';
    } else if (formData.metric_label.length > 150) {
      errors.metric_label = 'Metric Label must not exceed 150 characters.';
    }

    if (!formData.metric_value || !formData.metric_value.trim()) {
      errors.metric_value = 'Metric Value is required.';
    } else if (formData.metric_value.length > 100) {
      errors.metric_value = 'Metric Value must not exceed 100 characters.';
    }

    if (!formData.creator_type || !formData.creator_type.trim()) {
      errors.creator_type = 'Creator Type is required.';
    }

    if (!formData.display_order || parseInt(formData.display_order, 10) < 1) {
      errors.display_order = 'Display Order must be a number >= 1.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Add / Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = getAdminToken();
      const bodyData = new FormData();

      Object.keys(formData).forEach((key) => {
        bodyData.append(key, formData[key]);
      });

      if (selectedFile) {
        bodyData.append('profile_image', selectedFile);
      }

      const isEdit = !!editingItem;
      const url = isEdit
        ? `${API_ENDPOINTS.TESTIMONIALS.ADMIN}/${editingItem.id}`
        : API_ENDPOINTS.TESTIMONIALS.ADMIN;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: bodyData,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast?.success?.(isEdit ? 'Testimonial updated successfully!' : 'Testimonial added successfully!');
        setIsFormModalOpen(false);
        fetchTestimonials();
      } else {
        toast?.error?.(data.message || 'Failed to save testimonial');
      }
    } catch (err) {
      console.error('Submit form error:', err);
      toast?.error?.('Failed to submit form.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (item) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.TESTIMONIALS.ADMIN}/${item.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: item.status === 'active' ? 'inactive' : 'active' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast?.success?.(`Status changed to ${data.data?.status || 'updated'}`);
        fetchTestimonials();
      } else {
        toast?.error?.(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Delete Testimonial
  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.TESTIMONIALS.ADMIN}/${deletingItem.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast?.success?.('Testimonial deleted (soft delete).');
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchTestimonials();
      } else {
        toast?.error?.(data.message || 'Failed to delete testimonial');
      }
    } catch (err) {
      console.error('Delete testimonial error:', err);
      toast?.error?.('Failed to delete testimonial.');
    } finally {
      setSubmitting(false);
    }
  };

  // Move Order Up / Down
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const updatedList = [...testimonials];
    const tempOrder = updatedList[index].display_order;
    updatedList[index].display_order = updatedList[targetIndex].display_order;
    updatedList[targetIndex].display_order = tempOrder;

    // Swap items in list
    const tempItem = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = tempItem;

    setTestimonials(updatedList);

    // Save order via API
    try {
      const token = getAdminToken();
      const ordersPayload = updatedList.map((item) => ({
        id: item.id,
        display_order: item.display_order,
      }));

      await fetch(`${API_ENDPOINTS.TESTIMONIALS.ADMIN}/order`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orders: ordersPayload }),
      });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      {/* Header & Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#1C1C26]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#00F5D4]/10 text-[#00F5D4] font-mono font-bold text-[11px] border border-[#00F5D4]/30 uppercase tracking-wider">
                  MARKETING MODULE
                </span>
                <span className="text-xs text-[#8B8B96]">· Landing Page Content</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white mt-1">
                Creator Testimonials
              </h1>
              <p className="text-xs sm:text-sm text-[#8B8B96] mt-0.5">
                Manage testimonial cards displayed in the landing page section &quot;Loved by Top Live Streamers&quot;.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={fetchTestimonials}
                className="p-2.5 rounded-xl bg-[#13131A] border border-[#1C1C26] text-[#8B8B96] hover:text-white transition-colors cursor-pointer"
                title="Refresh list"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00D2B4] text-[#0A0A0F] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#00F5D4]/20 hover:opacity-95 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add Testimonial</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#13131A] border border-[#1C1C26]">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search creator name, @handle, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-9 pr-8 rounded-xl bg-[#0A0A0F] border border-[#222232] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4] transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E6E80]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E6E80] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-2 px-3 rounded-xl bg-[#0A0A0F] border border-[#222232] text-xs text-white focus:outline-none focus:border-[#00F5D4] cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>Category: {c}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl bg-[#0A0A0F] border border-[#222232] text-xs text-white focus:outline-none focus:border-[#00F5D4] cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Testimonials Table */}
          <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0A0A0F] border-b border-[#1C1C26] text-[#8B8B96] font-mono font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">ORDER</th>
                    <th className="py-3.5 px-4">CREATOR DETAILS</th>
                    <th className="py-3.5 px-4">CREATOR TYPE &amp; CAT</th>
                    <th className="py-3.5 px-4">PERFORMANCE METRIC</th>
                    <th className="py-3.5 px-4 text-center">STATUS</th>
                    <th className="py-3.5 px-4 text-center">LANDING PAGE</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C26] text-white font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8B8B96]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-6 w-6 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
                          <span>Loading creator testimonials...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTestimonials.length > 0 ? (
                    filteredTestimonials.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[#1A1A24]/60 transition-colors group">
                        {/* Order & Move Buttons */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono font-bold">
                            <span className="text-[#00F5D4] text-sm">#{item.display_order}</span>
                            <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveOrder(idx, 'up')}
                                className="p-0.5 hover:text-[#00F5D4] disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === filteredTestimonials.length - 1}
                                onClick={() => handleMoveOrder(idx, 'down')}
                                className="p-0.5 hover:text-[#00F5D4] disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Creator Details */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.profile_image ? getMediaUrl(item.profile_image) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={item.creator_name}
                              className="w-10 h-10 rounded-full object-cover border border-[#EB1000]/50 shrink-0 bg-[#0A0A0F]"
                            />
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-extrabold text-white text-xs flex items-center gap-1.5 truncate">
                                <span>{item.creator_name}</span>
                                {item.verified && (
                                  <span className="text-[#10B981]" title="Verified Creator">✓</span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#8B8B96] truncate">
                                {item.username} {item.followers ? `· ${item.followers}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Creator Type & Category */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-[#241014] border border-[#FF0000]/30 text-[#FF4D4D] text-[10px] font-bold">
                              {item.creator_type}
                            </span>
                            <div className="text-[10px] text-[#8B8B96] font-mono">
                              Category: {item.category || 'General'}
                            </div>
                          </div>
                        </td>

                        {/* Metric Label & Value */}
                        <td className="py-4 px-4">
                          <div className="p-2 rounded-xl bg-[#0A0A0F] border border-[#1C1C2A] text-[11px] space-y-0.5 max-w-xs">
                            <div className="text-[#8B8B96] text-[10px] font-medium truncate">{item.metric_label}</div>
                            <div className="text-[#EB1000] font-extrabold font-mono text-xs">{item.metric_value}</div>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              item.status === 'active'
                                ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 hover:bg-[#10B981]/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                            }`}
                          >
                            {item.status}
                          </button>
                        </td>

                        {/* Show on Landing Page */}
                        <td className="py-4 px-4 text-center">
                          {item.show_on_landing_page ? (
                            <span className="px-2.5 py-1 rounded-md bg-[#00F5D4]/10 text-[#00F5D4] text-[10px] font-bold border border-[#00F5D4]/30">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 text-[10px] font-bold">
                              No
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewItem(item);
                                setIsPreviewModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#1C1C2A] text-[#8B8B96] hover:text-white hover:bg-[#252538] transition-colors cursor-pointer"
                              title="Preview Testimonial Card"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg bg-[#1C1C2A] text-[#00F5D4] hover:bg-[#00F5D4]/20 transition-colors cursor-pointer"
                              title="Edit Testimonial"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingItem(item);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#1C1C2A] text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Delete Testimonial"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8B8B96]">
                        No testimonials found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT FORM MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-[#0D0D14] border border-[#222234] p-6 sm:p-8 shadow-2xl space-y-6 text-left relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E1E2C] pb-4">
              <div>
                <h3 className="font-heading font-black text-white text-xl">
                  {editingItem ? 'Edit Creator Testimonial' : 'Add New Creator Testimonial'}
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Configure creator details, metrics, and landing page visibility.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="h-8 w-8 rounded-full bg-[#181824] border border-[#262638] text-[#8B8B96] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-6">
              
              {/* SECTION A: TESTIMONIAL CONTENT */}
              <div className="p-4 rounded-2xl bg-[#12121C] border border-[#1E1E2C] space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F5D4] flex items-center gap-1.5">
                  <span>A. TESTIMONIAL CONTENT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Creator Name */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Creator Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechBurner Live"
                      value={formData.creator_name}
                      onChange={(e) => setFormData({ ...formData, creator_name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                    />
                    {formErrors.creator_name && <p className="text-[11px] text-rose-400 mt-1">{formErrors.creator_name}</p>}
                  </div>

                  {/* Username / Handle */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Username / Handle <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. @techburner"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                    />
                    {formErrors.username && <p className="text-[11px] text-rose-400 mt-1">{formErrors.username}</p>}
                  </div>
                </div>

                {/* Creator Type */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Creator Type / Badge Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. YouTube Live Creator, Finance Streamer, Twitch & Kick Streamer"
                    value={formData.creator_type}
                    onChange={(e) => setFormData({ ...formData, creator_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                  />
                  {formErrors.creator_type && <p className="text-[11px] text-rose-400 mt-1">{formErrors.creator_type}</p>}
                </div>

                {/* Testimonial Message */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Testimonial Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    maxLength={1000}
                    placeholder="e.g. AskMe completely transformed my live stream..."
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                  />
                  <div className="flex justify-between text-[10px] text-[#6E6E80] mt-1">
                    <span>Max 1000 characters</span>
                    <span>{formData.testimonial?.length || 0}/1000</span>
                  </div>
                  {formErrors.testimonial && <p className="text-[11px] text-rose-400 mt-1">{formErrors.testimonial}</p>}
                </div>

                {/* Profile Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Creator Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-[#0A0A0F] border border-[#222234] flex items-center justify-center shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-[#6E6E80]" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="text-xs text-[#8B8B96] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00F5D4] file:text-[#0A0A0F] hover:file:opacity-90 cursor-pointer"
                      />
                      <p className="text-[10px] text-[#8B8B96]">
                        Supported formats: JPG, JPEG, PNG, WEBP. Recommended square image.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: METRIC / PERFORMANCE DATA */}
              <div className="p-4 rounded-2xl bg-[#12121C] border border-[#1E1E2C] space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F5D4]">
                  B. METRIC / PERFORMANCE DATA
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Metric Label */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Metric Label <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Average Live Q&A Payout"
                      value={formData.metric_label}
                      onChange={(e) => setFormData({ ...formData, metric_label: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                    />
                    {formErrors.metric_label && <p className="text-[11px] text-rose-400 mt-1">{formErrors.metric_label}</p>}
                  </div>

                  {/* Metric Value */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Metric Value <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹3.2K+ /stream, 99.4%, < 35ms"
                      value={formData.metric_value}
                      onChange={(e) => setFormData({ ...formData, metric_value: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                    />
                    {formErrors.metric_value && <p className="text-[11px] text-rose-400 mt-1">{formErrors.metric_value}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION C: CREATOR INFORMATION */}
              <div className="p-4 rounded-2xl bg-[#12121C] border border-[#1E1E2C] space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F5D4]">
                  C. CREATOR INFORMATION
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Social Platform */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Social Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                    >
                      {PLATFORM_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Followers Count */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Followers / Subs Count
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3.4M Subs, 620K Followers"
                      value={formData.followers}
                      onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  {/* Verified Checkmark Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Verified Checkmark
                    </label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="inline-flex items-center gap-2 text-xs text-white font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.verified}
                          onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                          className="rounded accent-[#00F5D4]"
                        />
                        <span>Show Green Check ✓</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Profile Link */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Profile Channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@channelname"
                    value={formData.profile_link}
                    onChange={(e) => setFormData({ ...formData, profile_link: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
              </div>

              {/* SECTION D: DISPLAY SETTINGS */}
              <div className="p-4 rounded-2xl bg-[#12121C] border border-[#1E1E2C] space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F5D4]">
                  D. DISPLAY SETTINGS
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Display Order */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Display Order <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0A0A0F] border border-[#222234] text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                    >
                      {CATEGORY_OPTIONS.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checkbox Options */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-white">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_on_landing_page}
                      onChange={(e) => setFormData({ ...formData, show_on_landing_page: e.target.checked })}
                      className="rounded accent-[#00F5D4]"
                    />
                    <span>Show on Landing Page</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded accent-[#00F5D4]"
                    />
                    <span>Mark as Featured</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#1E1E2C] pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#181824] border border-[#262638] text-white text-xs font-bold hover:bg-[#202030] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00D2B4] text-[#0A0A0F] font-extrabold text-xs shadow-lg shadow-[#00F5D4]/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Create Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0D0D14] border border-[#222234] p-6 shadow-2xl space-y-5 text-left relative">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="font-heading font-black text-white text-lg">
                Confirm Delete Testimonial
              </h3>
            </div>
            <p className="text-xs text-[#8B8B96] leading-relaxed">
              Are you sure you want to delete the testimonial for <strong className="text-white">{deletingItem.creator_name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E1E2C]">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#181824] border border-[#262638] text-white text-xs font-bold hover:bg-[#202030] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LANDING PAGE PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#0D0D14] border border-[#222234] p-6 shadow-2xl space-y-4 text-left relative">
            <div className="flex items-center justify-between border-b border-[#1E1E2C] pb-3">
              <span className="text-xs font-mono font-bold text-[#00F5D4]">
                LANDING PAGE CARD PREVIEW
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-xs text-[#8B8B96] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Testimonial Card Component (Reusing exact Landing Page Design) */}
            <div className="p-5 rounded-2xl bg-[#12121C] border border-[#202032] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/40 transition-all text-left shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#EB1000] font-serif font-black text-2xl leading-none opacity-80">“</span>
                </div>
                <p className="text-xs text-[#A0A0B5] italic leading-relaxed font-normal">
                  &quot;{previewItem.testimonial}&quot;
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-[#1A1A28] flex items-center justify-between text-[11px]">
                  <span className="text-[#7A7A8E] font-medium">{previewItem.metric_label}</span>
                  <span className="text-[#EB1000] font-extrabold font-mono">{previewItem.metric_value}</span>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <img
                    src={previewItem.profile_image ? getMediaUrl(previewItem.profile_image) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={previewItem.creator_name}
                    className="w-9 h-9 rounded-full object-cover border border-[#EB1000]/50 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="font-extrabold text-white text-xs flex items-center gap-1 truncate">
                      {previewItem.creator_name} {previewItem.verified && <span className="text-[#10B981]">✓</span>}
                    </div>
                    <div className="text-[10px] text-[#7A7A8E] truncate">
                      {previewItem.username} {previewItem.followers ? `· ${previewItem.followers}` : ''}
                    </div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#241014] text-[#FF4D4D] text-[9px] font-bold">
                      {previewItem.creator_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#161622] border border-[#262638] text-xs font-bold text-white hover:bg-[#202030] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
