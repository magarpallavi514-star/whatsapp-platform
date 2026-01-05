"use client"

import { useState, useEffect } from "react"
import { Bot, Plus, Play, Pause, Edit, Trash2, X, Search, MessageSquare, Zap, List } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
const API_KEY = "wpk_live_f0b8a01652eb0b9950484f3b4674bd800e9e3e9a216f200f34b0502a0591ac5d";

interface ReplyOption {
  id: string;
  type: 'text' | 'buttons' | 'list' | 'question' | 'condition' | 'calendar' | 'form';
  text?: string;
  buttons?: Array<{ 
    id: string; 
    title: string; 
    url?: string;
    nextStepId?: string; // For conditional branching
  }>;
  listItems?: Array<{ 
    id: string; 
    title: string; 
    description?: string;
    nextStepId?: string; // For conditional branching
  }>;
  delay?: number;
  saveAs?: string; // Variable name to save response
  waitForResponse?: boolean; // Whether to wait for user response
  condition?: {
    variable: string;
    branches: Array<{ value: string; nextStepId: string; }>;
    defaultNextStepId?: string;
  };
  calendarConfig?: {
    enabled: boolean;
    availableDays: string[];
    timeSlots: string[];
    duration: number;
  };
}

interface ReplyContent {
  text?: string;
  templateName?: string;
  templateParams?: string[];
  workflow?: ReplyOption[];
}

interface Chatbot {
  _id: string;
  name: string;
  description?: string;
  keywords: string[];
  matchType: 'exact' | 'contains' | 'starts_with';
  replyType: 'text' | 'template' | 'workflow';
  replyContent: ReplyContent;
  isActive: boolean;
  phoneNumberId?: string;
  triggerCount: number;
  successRate: number;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatbotStats {
  totalBots: number;
  activeBots: number;
  totalInteractions: number;
  avgSuccessRate: number;
  automationRate: number;
}

export default function ChatbotPage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [stats, setStats] = useState<ChatbotStats>({
    totalBots: 0,
    activeBots: 0,
    totalInteractions: 0,
    avgSuccessRate: 0,
    automationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBot, setEditingBot] = useState<Chatbot | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    matchType: 'contains',
    replyType: 'text',
    replyText: '',
    templateName: '',
    workflow: [] as ReplyOption[],
    timeoutMinutes: 1
  });

  // Workflow state
  const [currentWorkflowItem, setCurrentWorkflowItem] = useState<ReplyOption>({
    id: Date.now().toString(),
    type: 'text',
    text: '',
    buttons: [],
    listItems: [],
    delay: 0,
    saveAs: '',
    waitForResponse: false
  });
  const [newButtonTitle, setNewButtonTitle] = useState('');
  const [newButtonUrl, setNewButtonUrl] = useState('');
  const [newButtonNextStep, setNewButtonNextStep] = useState('');
  const [newListItem, setNewListItem] = useState({ title: '', description: '' });
  const [enableConditionalBranching, setEnableConditionalBranching] = useState(false);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chatbots`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      console.log('📡 Fetch response status:', response.status);
      
      if (response.status === 401) {
        console.error('❌ Authentication failed - API key may be invalid');
        alert('Authentication failed. Please check your API key.');
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched bots:', data.bots?.length || 0);
        setBots(data.bots || []);
        setStats(data.stats || stats);
      } else {
        console.error('❌ Failed to fetch bots:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      if (!formData.name || keywords.length === 0) {
        alert('Please provide a name and at least one keyword');
        return;
      }

      // Validate reply content based on type
      if (formData.replyType === 'text' && !formData.replyText.trim()) {
        alert('Please provide a reply message');
        return;
      }

      if (formData.replyType === 'template' && !formData.templateName.trim()) {
        alert('Please provide a template name');
        return;
      }

      if (formData.replyType === 'workflow' && formData.workflow.length === 0) {
        alert('Please add at least one workflow step');
        return;
      }

      const replyContent: ReplyContent = formData.replyType === 'text' 
        ? { text: formData.replyText }
        : formData.replyType === 'workflow'
        ? { workflow: formData.workflow }
        : { templateName: formData.templateName };

      const payload = {
        name: formData.name,
        description: formData.description,
        keywords,
        matchType: formData.matchType,
        replyType: formData.replyType,
        replyContent
      };

      console.log('💾 Saving chatbot:', payload);
      console.log('📍 API URL:', API_URL);

      const url = editingBot 
        ? `${API_URL}/api/chatbots/${editingBot._id}`
        : `${API_URL}/api/chatbots`;
      
      console.log('📡 Request URL:', url);
      console.log('🔧 Method:', editingBot ? 'PUT' : 'POST');
      
      const method = editingBot ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (response.ok) {
        console.log('✅ Chatbot saved successfully');
        await fetchBots();
        closeModal();
      } else {
        console.error('❌ Save failed with status:', response.status);
        let errorMessage = 'Failed to save chatbot';
        try {
          const error = await response.json();
          console.error('❌ Save error:', error);
          errorMessage = error.error || error.message || errorMessage;
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          const textError = await response.text();
          console.error('❌ Response text:', textError);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('❌ Failed to save chatbot:', error);
      alert('Failed to save chatbot: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const toggleBot = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/chatbots/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (response.ok) {
        await fetchBots();
      }
    } catch (error) {
      console.error('Failed to toggle chatbot:', error);
    }
  };

  const deleteBot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chatbot?')) return;

    try {
      const response = await fetch(`${API_URL}/api/chatbots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (response.ok) {
        await fetchBots();
      }
    } catch (error) {
      console.error('Failed to delete chatbot:', error);
    }
  };

  const openCreateModal = () => {
    setEditingBot(null);
    setFormData({
      name: '',
      description: '',
      keywords: '',
      matchType: 'contains',
      replyType: 'text',
      replyText: '',
      templateName: '',
      workflow: [],
      timeoutMinutes: 1
    });
    setCurrentWorkflowItem({
      id: Date.now().toString(),
      type: 'text',
      text: '',
      buttons: [],
      listItems: [],
      delay: 0
    });
    setNewButtonTitle('');
    setNewButtonUrl('');
    setShowModal(true);
  };

  const openEditModal = (bot: Chatbot) => {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      description: bot.description || '',
      keywords: bot.keywords.join(', '),
      matchType: bot.matchType,
      replyType: bot.replyType,
      replyText: bot.replyContent.text || '',
      templateName: bot.replyContent.templateName || '',
      workflow: bot.replyContent.workflow || [],
      timeoutMinutes: 1
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBot(null);
  };

  const getStatusText = (bot: Chatbot) => {
    if (bot.isActive) return 'Active';
    if (bot.triggerCount === 0) return 'Draft';
    return 'Paused';
  };

  const getLastActiveText = (bot: Chatbot) => {
    if (!bot.lastTriggeredAt) return '-';
    const diff = Date.now() - new Date(bot.lastTriggeredAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chatbots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot</h1>
          <p className="text-gray-600 mt-1">Build and manage your AI chatbots</p>
        </div>
        <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Bot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Bots</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalBots}</p>
          <p className="text-xs text-green-600 mt-1">{stats.activeBots} active</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Interactions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalInteractions.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-1">all time</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Avg Success Rate</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgSuccessRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-600 mt-1">across all bots</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Automation Rate</p>
          <p className="text-2xl font-bold text-gray-900">{stats.automationRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-600 mt-1">of conversations</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search bots by name or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Bots Grid */}
      {filteredBots.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No chatbots yet</h3>
          <p className="text-gray-600 mb-4">Create your first chatbot to automate conversations</p>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBots.map((bot) => (
            <div key={bot._id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bot.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                      bot.isActive
                        ? "bg-green-100 text-green-700"
                        : bot.triggerCount === 0
                        ? "bg-gray-100 text-gray-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {getStatusText(bot)}
                    </span>
                  </div>
                </div>
              </div>

              {bot.description && (
                <p className="text-sm text-gray-600 mb-3">{bot.description}</p>
              )}

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {bot.keywords.slice(0, 5).map((keyword, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {keyword}
                    </span>
                  ))}
                  {bot.keywords.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{bot.keywords.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Reply Type:</p>
                <div className="flex items-center gap-2">
                  {bot.replyType === 'workflow' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Workflow ({bot.replyContent.workflow?.length || 0} steps)
                    </span>
                  ) : bot.replyType === 'template' ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Template
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Text
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Interactions</p>
                  <p className="text-xl font-bold text-gray-900">{bot.triggerCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-xl font-bold text-gray-900">
                    {bot.successRate > 0 ? `${bot.successRate}%` : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Last active: {getLastActiveText(bot)}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => toggleBot(bot._id)}
                    variant="outline" 
                    size="sm"
                  >
                    {bot.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => openEditModal(bot)}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => deleteBot(bot._id)}
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBot ? 'Edit Chatbot' : 'Create New Chatbot'}
              </h2>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Customer Support Bot"
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this bot do?"
                  rows={2}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords * (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., hello, hi, hey, support, help"
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These keywords will trigger the bot response
                </p>
              </div>

              {/* Match Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Type
                </label>
                <select
                  value={formData.matchType}
                  onChange={(e) => setFormData({ ...formData, matchType: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="contains">Contains (most flexible)</option>
                  <option value="exact">Exact match</option>
                  <option value="starts_with">Starts with</option>
                </select>
              </div>

              {/* Reply Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reply Type
                </label>
                <select
                  value={formData.replyType}
                  onChange={(e) => setFormData({ ...formData, replyType: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="text">Text Message</option>
                  <option value="workflow">Workflow (Interactive)</option>
                  <option value="template">WhatsApp Template</option>
                </select>
              </div>

              {/* Reply Content */}
              {formData.replyType === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply Message *
                  </label>
                  <textarea
                    value={formData.replyText}
                    onChange={(e) => setFormData({ ...formData, replyText: e.target.value })}
                    placeholder="The message to send when keywords match..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                  />
                </div>
              ) : formData.replyType === 'workflow' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Workflow Builder
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Response Timeout:</label>
                      <select
                        value={formData.timeoutMinutes}
                        onChange={(e) => setFormData({ ...formData, timeoutMinutes: parseInt(e.target.value) })}
                        className="px-2 py-1 bg-white text-gray-900 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-green-500"
                      >
                        <option value={1}>1 minute</option>
                        <option value={2}>2 minutes</option>
                        <option value={3}>3 minutes</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800">
                      ⏰ <strong>Auto-timeout:</strong> If user doesn't reply within <strong>{formData.timeoutMinutes} minute{formData.timeoutMinutes > 1 ? 's' : ''}</strong>, 
                      bot will send a thank you message and save partial data.
                    </p>
                  </div>
                  
                  {/* Current Workflow Item */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Add Response Step</span>
                    </div>

                    {/* Item Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Response Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentWorkflowItem({ ...currentWorkflowItem, type: 'text' })}
                          className={`flex-1 px-3 py-2 rounded-lg border ${
                            currentWorkflowItem.type === 'text' 
                              ? 'bg-green-50 border-green-500 text-green-700' 
                              : 'bg-white border-gray-300 text-gray-700'
                          }`}
                        >
                          <MessageSquare className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs">Text</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentWorkflowItem({ ...currentWorkflowItem, type: 'buttons' })}
                          className={`flex-1 px-3 py-2 rounded-lg border ${
                            currentWorkflowItem.type === 'buttons' 
                              ? 'bg-green-50 border-green-500 text-green-700' 
                              : 'bg-white border-gray-300 text-gray-700'
                          }`}
                        >
                          <Zap className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs">Buttons</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentWorkflowItem({ ...currentWorkflowItem, type: 'list' })}
                          className={`flex-1 px-3 py-2 rounded-lg border ${
                            currentWorkflowItem.type === 'list' 
                              ? 'bg-green-50 border-green-500 text-green-700' 
                              : 'bg-white border-gray-300 text-gray-700'
                          }`}
                        >
                          <List className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs">List</span>
                        </button>
                      </div>
                    </div>

                    {/* Text Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Message Text
                      </label>
                      <textarea
                        value={currentWorkflowItem.text || ''}
                        onChange={(e) => setCurrentWorkflowItem({ ...currentWorkflowItem, text: e.target.value })}
                        placeholder="Enter the message text..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
                      />
                    </div>

                    {/* Buttons Section */}
                    {currentWorkflowItem.type === 'buttons' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Buttons (max 3)
                        </label>
                        <div className="space-y-2">
                          {currentWorkflowItem.buttons?.map((btn) => (
                            <div key={btn.id} className="bg-white px-3 py-2 rounded border border-gray-300">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="flex-1 text-sm font-medium text-gray-900">{btn.title}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentWorkflowItem({
                                      ...currentWorkflowItem,
                                      buttons: currentWorkflowItem.buttons?.filter(b => b.id !== btn.id)
                                    });
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              {btn.url && (
                                <a 
                                  href={btn.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline truncate block mb-1"
                                >
                                  🔗 {btn.url}
                                </a>
                              )}
                              {btn.nextStepId && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                                    🔀 Jumps to: {btn.nextStepId}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                          {(!currentWorkflowItem.buttons || currentWorkflowItem.buttons.length < 3) && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={newButtonTitle}
                                onChange={(e) => setNewButtonTitle(e.target.value)}
                                placeholder="Button text (e.g., Yes, No, More Info)"
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                              />
                              <input
                                type="url"
                                value={newButtonUrl}
                                onChange={(e) => setNewButtonUrl(e.target.value)}
                                placeholder="Link URL (optional, e.g., https://example.com)"
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                              />
                              
                              {/* Conditional Branching Toggle */}
                              <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                <input
                                  type="checkbox"
                                  id="enableBranching"
                                  checked={enableConditionalBranching}
                                  onChange={(e) => {
                                    setEnableConditionalBranching(e.target.checked);
                                    if (!e.target.checked) setNewButtonNextStep('');
                                  }}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="enableBranching" className="flex-1 cursor-pointer">
                                  <span className="text-sm font-medium text-purple-900">🔀 Enable Conditional Branching</span>
                                  <p className="text-xs text-purple-700 mt-0.5">Go to different step based on this button click</p>
                                </label>
                              </div>

                              {/* Next Step Selection */}
                              {enableConditionalBranching && (
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <label className="block text-xs font-medium text-purple-900 mb-2">
                                    Jump to Step (Enter Step ID)
                                  </label>
                                  <input
                                    type="text"
                                    value={newButtonNextStep}
                                    onChange={(e) => setNewButtonNextStep(e.target.value)}
                                    placeholder="e.g., step_5, pricing_flow, contact_form"
                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-purple-300 rounded-lg text-sm placeholder:text-gray-400"
                                  />
                                  <p className="text-xs text-purple-700 mt-1">
                                    💡 Enter the ID of the step you want to jump to when this button is clicked
                                  </p>
                                </div>
                              )}
                              
                              <Button
                                type="button"
                                onClick={() => {
                                  if (newButtonTitle.trim()) {
                                    setCurrentWorkflowItem({
                                      ...currentWorkflowItem,
                                      buttons: [
                                        ...(currentWorkflowItem.buttons || []),
                                        { 
                                          id: Date.now().toString(), 
                                          title: newButtonTitle.trim(),
                                          url: newButtonUrl.trim() || undefined,
                                          nextStepId: enableConditionalBranching && newButtonNextStep.trim() ? newButtonNextStep.trim() : undefined
                                        }
                                      ]
                                    });
                                    setNewButtonTitle('');
                                    setNewButtonUrl('');
                                    setNewButtonNextStep('');
                                    setEnableConditionalBranching(false);
                                  }
                                }}
                                size="sm"
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Button
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* List Items Section */}
                    {currentWorkflowItem.type === 'list' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          List Items (max 10)
                        </label>
                        <div className="space-y-2">
                          {currentWorkflowItem.listItems?.map((item) => (
                            <div key={item.id} className="bg-white px-3 py-2 rounded border">
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{item.title}</div>
                                  {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentWorkflowItem({
                                      ...currentWorkflowItem,
                                      listItems: currentWorkflowItem.listItems?.filter(i => i.id !== item.id)
                                    });
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!currentWorkflowItem.listItems || currentWorkflowItem.listItems.length < 10) && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={newListItem.title}
                                onChange={(e) => setNewListItem({ ...newListItem, title: e.target.value })}
                                placeholder="List item title"
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                              />
                              <input
                                type="text"
                                value={newListItem.description}
                                onChange={(e) => setNewListItem({ ...newListItem, description: e.target.value })}
                                placeholder="Description (optional)"
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  if (newListItem.title.trim()) {
                                    setCurrentWorkflowItem({
                                      ...currentWorkflowItem,
                                      listItems: [
                                        ...(currentWorkflowItem.listItems || []),
                                        { 
                                          id: Date.now().toString(), 
                                          title: newListItem.title.trim(),
                                          description: newListItem.description.trim() || undefined
                                        }
                                      ]
                                    });
                                    setNewListItem({ title: '', description: '' });
                                  }
                                }}
                                size="sm"
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add List Item
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Delay (seconds)
                      </label>
                      <input
                        type="number"
                        value={currentWorkflowItem.delay || 0}
                        onChange={(e) => setCurrentWorkflowItem({ ...currentWorkflowItem, delay: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="30"
                        className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    {/* Wait for Response */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="waitForResponse"
                        checked={currentWorkflowItem.waitForResponse || false}
                        onChange={(e) => setCurrentWorkflowItem({ 
                          ...currentWorkflowItem, 
                          waitForResponse: e.target.checked,
                          type: e.target.checked ? 'question' : 'text'
                        })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="waitForResponse" className="flex-1 cursor-pointer">
                        <span className="text-sm font-medium text-gray-900">Wait for user response</span>
                        <p className="text-xs text-gray-600 mt-1">Bot will pause and wait for the user to reply before continuing</p>
                      </label>
                    </div>

                    {/* Save Response As */}
                    {currentWorkflowItem.waitForResponse && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Save Response As (Variable Name)
                        </label>
                        <input
                          type="text"
                          value={currentWorkflowItem.saveAs || ''}
                          onChange={(e) => setCurrentWorkflowItem({ ...currentWorkflowItem, saveAs: e.target.value })}
                          placeholder="e.g., name, email, phone, etc."
                          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-600 mt-1">💡 This will save the user's response for later use</p>
                      </div>
                    )}

                    {/* Add to Workflow */}
                    <Button
                      type="button"
                      onClick={() => {
                        if (currentWorkflowItem.text?.trim()) {
                          setFormData({
                            ...formData,
                            workflow: [...formData.workflow, currentWorkflowItem]
                          });
                          setCurrentWorkflowItem({
                            id: Date.now().toString(),
                            type: 'text',
                            text: '',
                            buttons: [],
                            listItems: [],
                            delay: 0,
                            saveAs: '',
                            waitForResponse: false
                          });
                          setNewButtonTitle('');
                          setNewButtonUrl('');
                          setNewListItem({ title: '', description: '' });
                        }
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step to Workflow
                    </Button>
                  </div>

                  {/* Workflow Steps List */}
                  {formData.workflow.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Workflow Steps ({formData.workflow.length})
                      </label>
                      {formData.workflow.map((item, index) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {item.type === 'text' && <MessageSquare className="h-4 w-4 text-gray-500" />}
                                {item.type === 'question' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                                {item.type === 'buttons' && <Zap className="h-4 w-4 text-green-600" />}
                                {item.type === 'list' && <List className="h-4 w-4 text-blue-600" />}
                                <span className="text-xs font-medium text-gray-600 uppercase">{item.type}</span>
                                {item.delay && item.delay > 0 && (
                                  <span className="text-xs text-gray-500">• {item.delay}s delay</span>
                                )}
                                {item.waitForResponse && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    ⏳ Waits
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 line-clamp-2">{item.text}</p>
                              {item.saveAs && (
                                <div className="mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                    💾 Saves as: {item.saveAs}
                                  </span>
                                </div>
                              )}
                              {item.buttons && item.buttons.length > 0 && (
                                <div className="space-y-1 mt-2">
                                  {item.buttons.map(btn => (
                                    <div key={btn.id} className="flex items-center gap-2">
                                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                        {btn.title}
                                      </span>
                                      {btn.url && (
                                        <span className="text-xs text-blue-600 truncate">
                                          → {btn.url}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.listItems && item.listItems.length > 0 && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {item.listItems.length} list items
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  workflow: formData.workflow.filter((_, i) => i !== index)
                                });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    placeholder="e.g., welcome_message"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be an approved WhatsApp template
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <Button onClick={closeModal} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdate} className="bg-green-600 hover:bg-green-700">
                {editingBot ? 'Update Bot' : 'Create Bot'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
