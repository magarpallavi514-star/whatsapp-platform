'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  type: 'broadcast' | 'drip' | 'automation' | 'ab-test';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
  audience: {
    type: string;
    estimatedReach: number;
  };
  recipients: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  stats: {
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export default function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = authService.getCurrentUser();

  // State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('recent');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch campaigns
  useEffect(() => {
    if (!user?.accountId) return;

    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          limit: limit.toString(),
          skip: ((page - 1) * limit).toString(),
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter }),
          ...(searchQuery && { search: searchQuery })
        });

        const token = authService.getToken();
        const response = await fetch(
          `/api/campaigns?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user?.accountId, page, statusFilter, typeFilter, searchQuery, limit]);

  // Handle delete
  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const token = authService.getToken();
      const response = await fetch(
        `/api/campaigns/${campaignId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete campaign');

      setCampaigns(campaigns.filter(c => c._id !== campaignId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  // Handle status action
  const handleStatusAction = async (campaignId: string, action: 'start' | 'pause' | 'resume' | 'cancel') => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `/api/campaigns/${campaignId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error(`Failed to ${action} campaign`);

      const updatedCampaign = await response.json();
      setCampaigns(campaigns.map(c => c._id === campaignId ? updatedCampaign.campaign : c));
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action} campaign`);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      running: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  // Type badge icon
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      broadcast: '📢',
      drip: '💧',
      automation: '⚙️',
      'ab-test': '🧪'
    };
    return icons[type] || '📧';
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Create and manage your WhatsApp campaigns</p>
          </div>
          <Link
            href="/dashboard/campaigns/create"
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            <span className="text-xl mr-2">+</span>
            New Campaign
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="broadcast">Broadcast</option>
              <option value="drip">Drip</option>
              <option value="automation">Automation</option>
              <option value="ab-test">A/B Testing</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="recent">Recent</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name A-Z</option>
            </select>

            {/* Clear Filters */}
            {(statusFilter || typeFilter || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No campaigns found</p>
                <Link
                  href="/dashboard/campaigns/create"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                  Create your first campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Delivery Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Open Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      {/* Campaign Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {campaign.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {campaign.description || 'No description'}
                          </p>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg mr-2">{getTypeIcon(campaign.type)}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {campaign.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>

                      {/* Recipients */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {campaign.recipients.sent} / {campaign.recipients.total}
                          </p>
                          <p className="text-xs">
                            {campaign.recipients.pending} pending
                          </p>
                        </div>
                      </td>

                      {/* Delivery Rate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
                            <div
                              className="h-2 bg-green-600 rounded-full"
                              style={{ width: `${campaign.stats.deliveryRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {campaign.stats.deliveryRate}%
                          </span>
                        </div>
                      </td>

                      {/* Open Rate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
                            <div
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${campaign.stats.openRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {campaign.stats.openRate}%
                          </span>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(campaign.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {/* View/Edit */}
                          <Link
                            href={`/dashboard/campaigns/${campaign._id}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View details"
                          >
                            👁️
                          </Link>

                          {/* Start */}
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => handleStatusAction(campaign._id, 'start')}
                              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                              title="Start campaign"
                            >
                              ▶️
                            </button>
                          )}

                          {/* Pause */}
                          {campaign.status === 'running' && (
                            <button
                              onClick={() => handleStatusAction(campaign._id, 'pause')}
                              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Pause campaign"
                            >
                              ⏸️
                            </button>
                          )}

                          {/* Resume */}
                          {campaign.status === 'paused' && (
                            <button
                              onClick={() => handleStatusAction(campaign._id, 'resume')}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Resume campaign"
                            >
                              ▶️
                            </button>
                          )}

                          {/* Delete */}
                          {(campaign.status === 'draft' || campaign.status === 'failed') && (
                            <button
                              onClick={() => handleDelete(campaign._id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete campaign"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && campaigns.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold">{page}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={campaigns.length < limit}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
