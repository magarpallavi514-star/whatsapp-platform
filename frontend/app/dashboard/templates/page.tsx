"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Search, MoreVertical, CheckCircle, Clock, XCircle, Edit, Trash2, Eye, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth"

interface Template {
  _id: string
  name: string
  language: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  content: string
  variables: string[]
  components?: any[]
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  usageCount: number
  lastUsedAt?: string
  rejectedReason?: string
  createdAt: string
}

interface Stats {
  approved: number
  pending: number
  rejected: number
  draft: number
  total: number
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [stats, setStats] = useState<Stats>({ approved: 0, pending: 0, rejected: 0, draft: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    category: 'UTILITY' as 'MARKETING' | 'UTILITY' | 'AUTHENTICATION',
    content: '',
    hasMedia: false,
    mediaType: 'IMAGE' as 'IMAGE' | 'VIDEO' | 'DOCUMENT',
    mediaUrl: '',
    headerText: '',
    footerText: '',
    buttons: [] as Array<{ type: string; text: string; url?: string; phone?: string }>
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"

  const getHeaders = () => {
    const token = authService.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/templates`, {
        headers: getHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
        setStats(data.stats || { approved: 0, pending: 0, rejected: 0, draft: 0, total: 0 })
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Create template
  const createTemplate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/templates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (response.ok) {
        alert(result.message)
        fetchTemplates()
        closeModal()
      } else {
        alert(result.message || "Failed to create template")
      }
    } catch (error) {
      console.error("Error creating template:", error)
      alert("Failed to create template")
    }
  }

  // Delete template
  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    
    try {
      const response = await fetch(`${API_URL}/api/templates/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        alert("Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      alert("Failed to delete template")
    }
  }

  // Sync templates from WhatsApp Manager
  const syncTemplatesFromWhatsApp = async () => {
    try {
      setIsSyncing(true)
      const response = await fetch(`${API_URL}/api/settings/templates/sync`, {
        method: 'POST',
        headers: getHeaders(),
      })

      const result = await response.json()
      if (response.ok) {
        alert(`✅ ${result.message}\n\n📊 Created: ${result.created}\n🔄 Updated: ${result.updated}\n📈 Total Synced: ${result.synced}`)
        fetchTemplates()
      } else {
        alert(`❌ ${result.message || "Failed to sync templates"}`)
      }
    } catch (error) {
      console.error("Error syncing templates:", error)
      alert("❌ Failed to sync templates. Please try again.")
    } finally {
      setIsSyncing(false)
    }
  }

  // Modal handlers
  const openCreateModal = () => {
    setSelectedTemplate(null)
    setFormData({
      name: '',
      language: 'en',
      category: 'UTILITY',
      content: '',
      hasMedia: false,
      mediaType: 'IMAGE',
      mediaUrl: '',
      headerText: '',
      footerText: '',
      buttons: []
    })
    setShowModal(true)
  }

  const openViewModal = (template: Template) => {
    setSelectedTemplate(template)
    setShowViewModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setShowViewModal(false)
    setSelectedTemplate(null)
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Filter templates
  const filteredTemplates = templates.filter((template) =>
    template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)
    
    if (hours < 24) return `${Math.floor(hours)} hours ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return '1 day ago'
    if (days < 30) return `${days} days ago`
    return date.toLocaleDateString()
  }

  // Extract variables from content
  const extractVariables = (content: string): number => {
    const matches = content.match(/\{\{(\d+)\}\}/g)
    return matches ? matches.length : 0
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-1">Manage your WhatsApp message templates</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={syncTemplatesFromWhatsApp}
            disabled={isSyncing}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from WhatsApp'}
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Templates ({filteredTemplates.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-64"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">No templates found</p>
              <p className="text-sm text-gray-500 mb-4">Create your first WhatsApp message template</p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Template Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Language</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usage</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Used</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((template) => (
                    <tr key={template._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{template.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{template.category}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          template.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : template.status === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : template.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {template.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{template.language}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{template.usageCount || 0} times</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{formatDate(template.lastUsedAt)}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openViewModal(template)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteTemplate(template._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Create WhatsApp Template</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Template Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Templates must be approved by Meta before use</li>
                  <li>Use variables with {`{{1}}, {{2}}`}, etc. for dynamic content</li>
                  <li>Category: UTILITY for OTPs/updates, MARKETING for promotions</li>
                  <li>Keep messages clear and concise</li>
                </ul>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="order_confirmation"
                />
                <p className="text-xs text-gray-500 mt-1">Use lowercase and underscores only</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="UTILITY">UTILITY - Transactional updates</option>
                  <option value="MARKETING">MARKETING - Promotional messages</option>
                  <option value="AUTHENTICATION">AUTHENTICATION - OTPs and verification</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="en">English</option>
                  <option value="en_US">English (US)</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>

              {/* Media Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasMedia"
                  checked={formData.hasMedia}
                  onChange={(e) => setFormData({ ...formData, hasMedia: e.target.checked })}
                  className="h-4 w-4 text-green-600 rounded"
                />
                <label htmlFor="hasMedia" className="text-sm font-medium text-gray-700">
                  Include Media (Header)
                </label>
              </div>

              {/* Media Configuration */}
              {formData.hasMedia && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="DOCUMENT">Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media URL (Sample) *
                    </label>
                    <input
                      type="url"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sample URL for Meta approval. Actual media URL will be provided when sending.
                    </p>
                  </div>
                  {formData.mediaType !== 'IMAGE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.headerText}
                        onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        placeholder="Document title or video caption"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-sm"
                  placeholder="Hello {{1}}, your order {{2}} has been confirmed!"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables found: {extractVariables(formData.content)}
                </p>
              </div>

              {/* Footer Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Text (Optional)
                </label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Small text at the bottom (e.g., 'Reply STOP to unsubscribe')"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 60 characters</p>
              </div>

              {/* Preview */}
              {formData.content && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{formData.content}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-6 border-t justify-end sticky bottom-0 bg-white">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={createTemplate}
                disabled={!formData.name || !formData.content}
              >
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Template Details</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{selectedTemplate.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedTemplate.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : selectedTemplate.status === "pending"
                      ? "bg-orange-100 text-orange-700"
                      : selectedTemplate.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {selectedTemplate.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{selectedTemplate.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Language</p>
                  <p className="font-medium text-gray-900">{selectedTemplate.language}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usage Count</p>
                  <p className="font-medium text-gray-900">{selectedTemplate.usageCount || 0} times</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Used</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedTemplate.lastUsedAt)}</p>
                </div>
              </div>

              {/* Display components if available */}
              {selectedTemplate.components && selectedTemplate.components.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Template Components</p>
                  <div className="space-y-2">
                    {selectedTemplate.components.map((comp: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-600 uppercase">{comp.type}</span>
                          {comp.format && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{comp.format}</span>
                          )}
                        </div>
                        {comp.text && (
                          <p className="text-sm text-gray-900 font-mono">{comp.text}</p>
                        )}
                        {comp.example && comp.example.header_handle && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Sample Media URL:</p>
                            <a 
                              href={comp.example.header_handle[0]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline break-all"
                            >
                              {comp.example.header_handle[0]}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">Content</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap font-mono">{selectedTemplate.content}</p>
                </div>
              </div>

              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Variables</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTemplate.variables.map((v, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTemplate.status === 'rejected' && selectedTemplate.rejectedReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-800">{selectedTemplate.rejectedReason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-6 border-t justify-end sticky bottom-0 bg-white">
              <Button variant="outline" onClick={closeModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
