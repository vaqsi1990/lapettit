"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import Image from 'next/image';

import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
 
  Edit,
  Trash2,
  Plus,
  Search,
  Phone,
  MapPin,
  Cake,
  MessageCircle,
  Mail
} from 'lucide-react';
import { getCakes, getOrders, deleteCake, deleteOrder, getCakeById } from '@/lib/action';
import { formatPrice } from '@/lib/utils';

import AddCakeForm from '@/components/AddCakeForm';

import EditCakeForm from '@/components/EditCakeForm';

interface Cake {
  id: number;
  name: string;
  imageUrl: string | null;
  category: string;
  productType?: string;
  pieces: number | null;
  marzipanPrice: number | null;
  creamPrice: number | null;
  hasMarzipan: boolean;
  hasCream: boolean;
  fillings: string[];
  isCustomizable: boolean;
  available: boolean;
  price?: number | null;
  setItems?: string[];
  setDescription?: string | null;
  sliceWeight?: string | null;
  sliceDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  total: number;
  status: string;
  createdAt: Date;
  items: {
    id: number;
    quantity: number;
    cakeName?: string;
    age?: string;
    position?: string;
    cake: {
      id: number;
      name: string;
      pieces: number | null;
      marzipanPrice: number | null;
      creamPrice: number | null;
      hasMarzipan: boolean;
      hasCream: boolean;
      isCustomizable: boolean;
    };
  }[];
}

interface SurveySession {
  id: number;
  sessionId: string;
  currentStep: number;
  isComplete: boolean;
  isChatEnded?: boolean;  // Chat conversation ended status
  waitingForPrice?: boolean;  // Waiting for admin to calculate and send price
  calculatedPrice?: number | null;  // Price calculated by admin
  productId: number | null;
  createdAt: Date;
  responses: {
    id: number;
    questionId: number;
    questionText: string;
    answerType: string;
    selectedOption: number | null;
    answerText: string | null;
    fileUrl: string | null;
    fileName: string | null;
    createdAt: Date;
  }[];
  messages?: ChatMessage[];
}

interface ChatMessage {
  id: number;
  sessionId: number;
  senderType: 'bot' | 'user' | 'admin';
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [surveySessions, setSurveySessions] = useState<SurveySession[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<{ id: number; text: string; type: string; options?: string[] }[]>([]);
  const [selectedChatSession, setSelectedChatSession] = useState<SurveySession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [liveChatSessions, setLiveChatSessions] = useState<SurveySession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());
  const [productImages, setProductImages] = useState<Map<number, string>>(new Map());
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState<string>('');
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isSendingPrice, setIsSendingPrice] = useState(false);
  const { showToast } = useToast();

  // Fetch live chat sessions (sessions with messages or completed)
  useEffect(() => {
    const fetchLiveChatSessions = async () => {
      try {
        const response = await fetch('/api/chat-survey/responses');
        const data = await response.json();
        if (data.success && data.sessions) {
          // Filter sessions that are complete (ready for live chat), waiting for price, or have messages
          const sessionsWithChat = data.sessions.filter((session: SurveySession) => {
            return session.isComplete || session.waitingForPrice || (session.messages && session.messages.length > 0);
          });
          setLiveChatSessions(sessionsWithChat);
          
          // Update selected session if it exists
          if (selectedChatSession) {
            const updatedSession = data.sessions.find((s: SurveySession) => s.id === selectedChatSession.id);
            if (updatedSession) {
              setSelectedChatSession(updatedSession);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching live chat sessions:', error);
      }
    };

    if (activeTab === 'live-chat') {
      fetchLiveChatSessions();
      // Poll for new chat sessions every 5 seconds when on live-chat tab
      const interval = setInterval(fetchLiveChatSessions, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedChatSession?.id]);

  // Poll for new messages when a chat session is selected
  useEffect(() => {
    if (!selectedChatSession || activeTab !== 'live-chat') return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat-survey/messages/${selectedChatSession.sessionId}`);
        const data = await response.json();
        if (data.success && data.messages) {
          setChatMessages(data.messages || []);
          
          // Scroll to bottom after loading messages
          setTimeout(() => {
            const messagesContainer = document.getElementById('chat-messages');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Fetch messages immediately
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedChatSession?.sessionId, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cakes
        const cakesResult = await getCakes();
        if (cakesResult.success && cakesResult.data) {
          setCakes(cakesResult.data);
        }

        // Fetch orders
        const ordersResult = await getOrders();
        if (ordersResult.success && ordersResult.data) {
          setOrders(ordersResult.data);
        }

        // Fetch survey responses
        const surveyResponse = await fetch('/api/chat-survey/responses');
        const surveyData = await surveyResponse.json();
        if (surveyData.success && surveyData.sessions) {
          setSurveySessions(surveyData.sessions);
          
          // Fetch product images for sessions with productId
          const productIds = surveyData.sessions
            .filter((s: SurveySession) => s.productId)
            .map((s: SurveySession) => s.productId)
            .filter((id: number | null): id is number => id !== null);
          
          if (productIds.length > 0) {
            const uniqueProductIds: number[] = Array.from(new Set<number>(productIds));
            const productImagesMap = new Map<number, string>();
            
            // Fetch each product
            await Promise.all(
              uniqueProductIds.map(async (productId: number) => {
                try {
                  const productResult = await getCakeById(productId);
                  if (productResult.success && productResult.data) {
                    productImagesMap.set(productId, productResult.data.imageUrl || '/catalog/1.jpg');
                  }
                } catch (error) {
                  console.error(`Error fetching product ${productId}:`, error);
                }
              })
            );
            
            setProductImages(productImagesMap);
          }
        }

        // Fetch survey questions
        const questionsResponse = await fetch('/api/chat-survey/questions');
        const questionsData = await questionsResponse.json();
        if (questionsData.success && questionsData.questions) {
          setSurveyQuestions(questionsData.questions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle cake deletion
  const handleDeleteCake = async (cakeId: number) => {
    if (window.confirm('ნამდვილად გსურთ ამ ტორტის წაშლა?')) {
      try {
        const result = await deleteCake(cakeId);
        if (result.success) {
          showToast('success', 'ტორტი წარმატებით წაიშალა');
          // Remove the cake from the local state
          setCakes(cakes.filter(cake => cake.id !== cakeId));
        } else {
          showToast('error', `შეცდომა: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting cake:', error);
        showToast('error', 'ტორტის წაშლისას მოხდა შეცდომა');
      }
    }
  };

  // Handle cake editing
  const handleEditCake = (cake: Cake) => {
    setEditingCake(cake);
  };

  const handleUpdateCake = async (updatedCake: Cake) => {
    try {
      const response = await fetch(`/api/cake/${updatedCake.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCake),
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', 'ტორტი წარმატებით განახლდა!');
        // Update the cake in the local state
        setCakes(cakes.map(cake => cake.id === updatedCake.id ? updatedCake : cake));
        setEditingCake(null);
      } else {
        showToast('error', `შეცდომა: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating cake:', error);
      showToast('error', 'ტორტის განახლებისას მოხდა შეცდომა');
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm('ნამდვილად გსურთ ამ შეკვეთის წაშლა?')) {
      try {
        const result = await deleteOrder(orderId);
        if (result.success) {
          showToast('success', 'შეკვეთა წარმატებით წაიშალა');
          // Remove the order from the local state
          setOrders(orders.filter(order => order.id !== orderId));
        } else {
          showToast('error', `შეცდომა: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        showToast('error', 'შეკვეთის წაშლისას მოხდა შეცდომა');
      }
    }
  };

  // Handle order approval
  const handleApproveOrder = async (orderId: number) => {
    if (window.confirm('ნამდვილად გსურთ ამ შეკვეთის დადასტურება? კლიენტს გაიგზავნება დადასტურების მეილი.')) {
      try {
        const response = await fetch('/api/orders', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId,
            status: 'APPROVED',
            action: 'approve'
          }),
        });

        const result = await response.json();

        if (result.success) {
          showToast('success', 'შეკვეთა წარმატებით დადასტურდა! კლიენტს გაიგზავნა მეილი.');
          // Update the order in the local state
          setOrders(orders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'APPROVED' }
              : order
          ));
        } else {
          showToast('error', `შეცდომა: ${result.error}`);
        }
      } catch (error) {
        console.error('Error approving order:', error);
        showToast('error', 'შეკვეთის დადასტურებისას მოხდა შეცდომა');
      }
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (orderId: number) => {
    if (window.confirm('ნამდვილად გსურთ ამ შეკვეთის უარყოფა? კლიენტს გაიგზავნება უარყოფის მეილი.')) {
      try {
        const response = await fetch('/api/orders', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId,
            status: 'REJECTED',
            action: 'reject'
          }),
        });

        const result = await response.json();

        if (result.success) {
          showToast('success', 'შეკვეთა უარყოფილია! კლიენტს გაიგზავნა უარყოფის მეილი.');
          // Update the order in the local state
          setOrders(orders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'REJECTED' }
              : order
          ));
        } else {
          showToast('error', `შეცდომა: ${result.error}`);
        }
      } catch (error) {
        console.error('Error rejecting order:', error);
        showToast('error', 'შეკვეთის უარყოფისას მოხდა შეცდომა');
      }
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          status: newStatus,
          action: 'update'
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', 'შეკვეთის სტატუსი წარმატებით განახლდა!');
        // Update the order in the local state
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
      } else {
        showToast('error', `შეცდომა: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('error', 'შეკვეთის სტატუსის განახლებისას მოხდა შეცდომა');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-black';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'მიმდინარე';
      case 'APPROVED': return 'დადასტურებული';
      case 'REJECTED': return 'უარყოფილი';
      case 'IN_PROGRESS': return 'მზადდება';
      case 'DELIVERED': return 'მიწოდებული';
      case 'CANCELLED': return 'გაუქმებული';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingOrdersCount = orders.filter(order => order.status === 'PENDING').length;

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
  const totalCustomers = new Set(orders.map(order => order.customerPhone)).size;

  // Send admin message
  const sendAdminMessage = async () => {
    console.log('sendAdminMessage called', { 
      adminMessage, 
      hasSelectedSession: !!selectedChatSession, 
      isSendingMessage 
    });
    
    if (!adminMessage || !adminMessage.trim()) {
      console.log('Admin message is empty');
      return;
    }
    if (!selectedChatSession) {
      console.log('No chat session selected');
      showToast('error', 'გთხოვთ აირჩიოთ ჩათი');
      return;
    }
    if (isSendingMessage) {
      console.log('Already sending message');
      return;
    }

    const messageText = adminMessage.trim();
    const currentMessage = messageText; // Save before clearing
    setAdminMessage('');
    setIsSendingMessage(true);

    try {
      console.log('Sending admin message:', messageText, 'to session:', selectedChatSession.sessionId);
      const response = await fetch('/api/chat-survey/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedChatSession.sessionId,
          senderType: 'admin',
          content: messageText
        })
      });

      const data = await response.json();
      console.log('Response from API:', data);
      if (data.success) {
        // Add message to local state
        setChatMessages(prev => [...prev, data.message]);
        showToast('success', 'შეტყობინება გაიგზავნა');
        // Scroll to bottom after sending message
        setTimeout(() => {
          const messagesContainer = document.getElementById('chat-messages');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      } else {
        console.error('API returned error:', data);
        showToast('error', data.error || 'შეცდომა შეტყობინების გაგზავნისას');
        // Restore message if failed
        setAdminMessage(currentMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('error', 'შეცდომა შეტყობინების გაგზავნისას');
      // Restore message if failed
      setAdminMessage(currentMessage);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-color pt-10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="md:text-[30px] text-[20px] font-bold text-black mb-2">ადმინ პანელი</h1>
          <p className="text-black  text-[18px]">თქვენი ტორტების ვებსაიტის მართვა</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            {[
       
              { id: 'orders', label: 'შეკვეთები', icon: ShoppingCart },
              { id: 'cakes', label: 'ტორტები', icon: Cake },
              { id: 'add-cake', label: 'ახალი ტორტი', icon: Plus },
              { id: 'customers', label: 'კლიენტები', icon: Users },
              { id: 'survey-responses', label: 'კითხვებზე პასუხები', icon: Package },
              { id: 'live-chat', label: 'Live Chat', icon: MessageCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 md:text-[20px] text-[18px] ${
                  activeTab === tab.id
                    ? 'bg-[#d90b6b] text-white shadow-lg'
                    : 'text-gray-600 hover:text-[#d90b6b] hover:bg-pink-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'საერთო შემოსავალი', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-green-500' },
                { title: 'მიმდინარე შეკვეთები', value: pendingOrders.toString(), icon: ShoppingCart, color: 'bg-yellow-500' },
                { title: 'სულ ტორტები', value: cakes.length.toString(), icon: Package, color: 'bg-pink-500' },
                { title: 'სულ კლიენტები', value: totalCustomers.toString(), icon: Users, color: 'bg-blue-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white text-black placeholder:text-black rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-black mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white text-black placeholder:text-black rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-black mb-6">ბოლო შეკვეთები</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-black rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#d90b6b] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{order.customerName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-black">{order.customerName}</p>
                        <p className="text-sm text-black">{order.customerPhone}</p>
                      </div>
                    </div>
                                         <div className="text-right">
                       <p className="font-bold text-[#d90b6b]">{formatPrice(order.total)}</p>
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                         {getStatusText(order.status)}
                       </span>
                       <p className="text-xs text-gray-500 mt-1">
                         {order.items.map(item => `${item.cake.name} (${item.quantity})`).join(', ')}
                       </p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="bg-white text-black placeholder:text-black rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ძიება კლიენტის სახელით ან ტელეფონით..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                >
                  <option value="all">ყველა სტატუსი</option>
                  <option value="PENDING">მიმდინარე ({pendingOrdersCount})</option>
                  <option value="APPROVED">დადასტურებული</option>
                  <option value="REJECTED">უარყოფილი</option>
                  <option value="IN_PROGRESS">მზადდება</option>
                  <option value="DELIVERED">მიწოდებული</option>
                  <option value="CANCELLED">გაუქმებული</option>
                </select>
                {pendingOrdersCount > 0 && (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium">
                    {pendingOrdersCount} შეკვეთა ელოდება დადასტურებას
                  </div>
                )}
              </div>
            </div>

            {/* Orders List - Detailed Cards */}
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white text-black placeholder:text-black rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-white p-6 border-b border-black">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-[#d90b6b] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">{order.customerName.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="md:text-[18px] text-[16px] font-bold text-black">{order.customerName}</h3>
                          <div className="flex items-center space-x-4 md:text-[18px] text-[16px] text-black mt-1">
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {order.customerPhone}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {order.address}
                            </span>
                          </div>
                        </div>
                      </div>
                                             <div className="text-right">
                         
                        
                         <div className="md:text-[18px] text-[16px] text-black mt-2">
                           {new Date(order.createdAt).toLocaleDateString('ka-GE', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </div>
                         {/* Status Badge */}
                         <div className="flex items-center justify-end mt-2">
                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                             {getStatusText(order.status)}
                           </span>
                         </div>
                         {/* Email Status Indicator */}
                         <div className="flex items-center justify-end mt-2 space-x-2">
                           <Mail className="w-4 h-4 text-gray-400" />
                           <span className="text-xs text-gray-500">
                             {order.customerEmail ? 'ელ-ფოსტა მითითებულია' : 'ელ-ფოსტა არ არის'}
                           </span>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    {/* Regular Cake Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        
                          ტორტების შეკვეთა
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                                  <Cake className="w-6 h-6 text-[#d90b6b]" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{item.cake.name}</p>
                              
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-[#d90b6b]">{formatPrice(order.total)}</div>
                                <div className="md:text-[18px] text-[16px] text-black">რაოდენობა: {item.quantity}</div>
                                <div className="text-sm text-gray-500">
                                  {item.cake.pieces && `${item.cake.pieces} ნაჭერი`}
                                  {item.cake.hasMarzipan && ' • მარცეპანი'}
                                  {item.cake.hasCream && ' • კრემი'}
                                </div>
                                <div className="text-sm text-pink-600 mt-1">
                                  {item.cake.isCustomizable ? 'შიგთავსი არჩეულია' : 'სტანდარტული ტორტი'}
                                </div>
                                {item.cake.isCustomizable && (item.cakeName || item.age) && (
                                  <div className="text-sm text-purple-600 mt-1">
                                    <strong>პერსონალიზაცია:</strong>
                                    {item.cakeName && ` სახელი: ${item.cakeName}`}
                                    {item.age && `, ასაკი: ${item.age}`}
                                    {item.position && `, პოზიცია: ${item.position === 'bottom' ? 'ქვევით' : item.position === 'center' ? 'ცენტრში' : 'ზევით'}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                  
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                      {order.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleApproveOrder(order.id)}
                            className="px-4 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors flex items-center space-x-2 md:text-[18px] text-[16px]"
                          >
                            <Edit className="w-4 h-4" />
                            <span>დადასტურება</span>
                          </button>
                          <button 
                            onClick={() => handleRejectOrder(order.id)}
                            className="px-4 py-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors flex items-center space-x-2 md:text-[18px] text-[16px]"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>უარყოფა</span>
                          </button>
                        </>
                      )}
                      {order.status !== 'PENDING' && (
                        <button 
                          onClick={() => {
                            const newStatus = order.status === 'APPROVED' ? 'IN_PROGRESS' : 
                                            order.status === 'IN_PROGRESS' ? 'DELIVERED' : 
                                            order.status;
                            handleUpdateOrderStatus(order.id, newStatus);
                          }}
                          className="px-4 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 md:text-[18px] text-[16px]"
                        >
                          <Edit className="w-4 h-4" />
                          <span>
                            {order.status === 'APPROVED' ? 'მზადდება' : 
                             order.status === 'IN_PROGRESS' ? 'მიწოდებული' : 
                             'რედაქტირება'}
                          </span>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-4 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 md:text-[18px] text-[16px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>წაშლა</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cakes Tab */}
        {activeTab === 'cakes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Add New Cake Button */}
            <div className="flex justify-between items-center">
              <h2 className="md:text-[20px] text-[18px] font-bold text-black">ტორტების მართვა</h2>
              <button className="bg-[#d90b6b] hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors md:text-[18px] text-[16px]">
                <Plus className="w-5 h-5" />
                <span>ახალი ტორტი</span>
              </button>
            </div>

            {/* Cakes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cakes.map((cake) => (
                <motion.div
                  key={cake.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={cake.imageUrl || '/catalog/1.jpg'}
                      alt={cake.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                      {cake.category}
                    </div>

                  </div>
                  <div className="p-6">
                    <h3 className="md:text-[18px] text-[16px] font-semibold text-black mb-2">{cake.name}</h3>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        {cake.pieces && <span>{cake.pieces} ნაჭერი</span>}
                        {cake.hasMarzipan && <span className="ml-2">• მარცეპანი</span>}
                        {cake.hasCream && <span className="ml-2">• კრემი</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cake.price && <span className="font-bold text-[#d90b6b]">ფასი: {formatPrice(cake.price)}</span>}
                        {cake.marzipanPrice && <span className="ml-2">მარცეპანი: {formatPrice(cake.marzipanPrice)}</span>}
                        {cake.creamPrice && <span className="ml-2">კრემი: {formatPrice(cake.creamPrice)}</span>}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-gray-400">
                          {cake.isCustomizable ? 'შესაძლებელია კასტომიზაცია' : 'სტანდარტული ტორტი'}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditCake(cake)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors md:text-[18px] text-[16px]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCake(cake.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Edit Cake Modal */}
        {editingCake && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">ტორტის რედაქტირება</h2>
                  <button
                    onClick={() => setEditingCake(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <EditCakeForm 
                  cake={editingCake} 
                  onUpdate={handleUpdateCake}
                  onCancel={() => setEditingCake(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Cake Tab */}
        {activeTab === 'add-cake' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="md:text-[24px] text-[20px] font-bold text-black mb-6">ახალი ტორტის დამატება</h2>
              <AddCakeForm onCakeAdded={() => {
                // Refresh cakes list
                const fetchCakes = async () => {
                  try {
                    const cakesResult = await getCakes();
                    if (cakesResult.success && cakesResult.data) {
                      setCakes(cakesResult.data);
                    }
                  } catch (error) {
                    console.error('Error fetching cakes:', error);
                  }
                };
                fetchCakes();
                setActiveTab('cakes');
              }} />
            </div>
          </motion.div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Customer Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'სულ კლიენტები', 
                  value: new Set(orders.map(order => `${order.customerName}-${order.customerPhone}`)).size.toString(), 
                  icon: Users, 
                  color: 'bg-blue-500' 
                },
                { 
                  title: 'ელ-ფოსტით', 
                  value: orders.filter(order => order.customerEmail).reduce((acc, order) => {
                    const key = `${order.customerName}-${order.customerPhone}`;
                    if (!acc.has(key)) acc.add(key);
                    return acc;
                  }, new Set()).size.toString(), 
                  icon: Mail, 
                  color: 'bg-green-500' 
                },
                { 
                  title: 'საშუალო შეკვეთა', 
                  value: formatPrice(orders.reduce((sum, order) => sum + order.total, 0) / orders.length || 0), 
                  icon: ShoppingCart, 
                  color: 'bg-yellow-500' 
                },
                { 
                  title: 'საშუალო კლიენტის ღირებულება', 
                  value: formatPrice(orders.reduce((sum, order) => sum + order.total, 0) / new Set(orders.map(order => `${order.customerName}-${order.customerPhone}`)).size || 0), 
                  icon: DollarSign, 
                  color: 'bg-purple-500' 
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-black mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Customer Search and Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ძიება კლიენტის სახელით, ტელეფონით ან ელ-ფოსტით..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                >
                  <option value="all">ყველა კლიენტი</option>
                  <option value="with_email">ელ-ფოსტით</option>
                  <option value="without_email">ელ-ფოსტის გარეშე</option>
                  <option value="recent">ბოლო 30 დღე</option>
                  <option value="vip">VIP კლიენტები</option>
                </select>
              </div>
            </div>

            {/* Simple Customers List - Only Customer Information */}
            <div className="bg-white text-black placeholder:text-black rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">კლიენტების სია</h2>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {(() => {
                    const customerMap = new Map<string, boolean>();
                    orders.forEach((order: Order) => {
                      const key = `${order.customerName}-${order.customerPhone}`;
                      if (!customerMap.has(key)) {
                        customerMap.set(key, true);
                      }
                    });
                    return `${customerMap.size} უნიკალური კლიენტი`;
                  })()}
                </div>
              </div>
              
              {/* Customer Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-black">კლიენტი</th>
                      <th className="text-left py-3 px-4 font-semibold text-black">კონტაქტი</th>
                      <th className="text-left py-3 px-4 font-semibold text-black">მისამართი</th>
                      <th className="text-left py-3 px-4 font-semibold text-black">სტატისტიკა</th>
                      <th className="text-left py-3 px-4 font-semibold text-black">მოქმედებები</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Create unique customers with aggregated data
                      const customerMap = new Map<string, {
                        customerName: string;
                        customerPhone: string;
                        customerEmail?: string;
                        address: string;
                        orders: Order[];
                        totalSpent: number;
                        firstOrder: Date;
                        lastOrder: Date;
                      }>();
                      
                      orders.forEach((order: Order) => {
                        const key = `${order.customerName}-${order.customerPhone}`;
                        if (!customerMap.has(key)) {
                          customerMap.set(key, {
                            customerName: order.customerName,
                            customerPhone: order.customerPhone,
                            customerEmail: order.customerEmail,
                            address: order.address,
                            orders: [],
                            totalSpent: 0,
                            firstOrder: order.createdAt,
                            lastOrder: order.createdAt
                          });
                        }
                        
                        const customer = customerMap.get(key)!;
                        customer.orders.push(order);
                        customer.totalSpent += order.total;
                        
                        if (new Date(order.createdAt) < new Date(customer.firstOrder)) {
                          customer.firstOrder = order.createdAt;
                        }
                        if (new Date(order.createdAt) > new Date(customer.lastOrder)) {
                          customer.lastOrder = order.createdAt;
                        }
                      });

                      // Convert to array and apply filters
                      let customers = Array.from(customerMap.values());
                      
                      // Apply search filter
                      if (searchTerm) {
                        customers = customers.filter(customer => 
                          customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.customerPhone.includes(searchTerm) ||
                          (customer.customerEmail && customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                      }

                      // Apply status filter
                      if (filterStatus === 'with_email') {
                        customers = customers.filter(customer => customer.customerEmail);
                      } else if (filterStatus === 'without_email') {
                        customers = customers.filter(customer => !customer.customerEmail);
                      } else if (filterStatus === 'recent') {
                        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                        customers = customers.filter(customer => new Date(customer.lastOrder) > thirtyDaysAgo);
                      } else if (filterStatus === 'vip') {
                        customers = customers.filter(customer => customer.totalSpent > 100);
                      }

                      // Sort by name alphabetically
                      customers.sort((a, b) => a.customerName.localeCompare(b.customerName));

                      return customers.map((customer, index) => (
                        <motion.tr
                          key={`${customer.customerName}-${customer.customerPhone}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          {/* Customer Name & Avatar */}
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-[#d90b6b] rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{customer.customerName.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-black text-lg">{customer.customerName}</p>
                                <p className="text-sm text-gray-500">ID: {customer.customerPhone.slice(-4)}</p>
                              </div>
                            </div>
                          </td>

                          {/* Contact Information */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{customer.customerPhone}</span>
                              </div>
                              {customer.customerEmail ? (
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-green-500" />
                                  <span className="text-gray-700 text-sm">{customer.customerEmail}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-red-400" />
                                  <span className="text-gray-500 text-sm">ელ-ფოსტა არ არის</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Address */}
                          <td className="py-4 px-4">
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                              <span className="text-gray-700 text-sm max-w-xs">{customer.address}</span>
                            </div>
                          </td>

                          {/* Statistics */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-black">შეკვეთები:</span>
                                <span className="font-semibold text-black">{customer.orders.length}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-black">სულ:</span>
                                <span className="font-bold text-[#d90b6b]">{formatPrice(customer.totalSpent)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-black">ბოლო:</span>
                                <span className="text-xs text-black">
                                  {new Date(customer.lastOrder).toLocaleDateString('ka-GE', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors">
                                <Mail className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors">
                                <Users className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Chat Tab */}
        {activeTab === 'live-chat' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
            style={{ height: 'calc(100vh - 250px)' }}
          >
            <div className="flex h-full">
              {/* Left Sidebar - Sessions List */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-bold text-black">Live Chat</h2>
                  <p className="text-sm text-gray-600 mt-1">{liveChatSessions.length} აქტიური ჩატი</p>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {liveChatSessions.length === 0 ? (
                    <div className="text-center py-12 px-4 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">აქტიური ჩატები არ არის</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {liveChatSessions.map((session: SurveySession) => {
                        const nameResponse = session.responses.find((r: { questionId: number }) => r.questionId === 9);
                        const userName = nameResponse?.answerText || `Session: ${session.sessionId.slice(0, 10)}...`;
                        const isSelected = selectedChatSession?.id === session.id;
                        
                        return (
                          <div
                            key={session.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-pink-50 border-l-4 border-pink-500' : ''
                            }`}
                            onClick={async () => {
                              try {
                                const messagesResponse = await fetch(`/api/chat-survey/messages/${session.sessionId}`);
                                const messagesData = await messagesResponse.json();
                                if (messagesData.success) {
                                  setChatMessages(messagesData.messages || []);
                                  setSelectedChatSession(session);
                                  // Reset price calculation state
                                  if (session.waitingForPrice) {
                                    setCalculatedPrice(null);
                                    setPriceInput('');
                                  } else {
                                    setCalculatedPrice(session.calculatedPrice || null);
                                    if (session.calculatedPrice) {
                                      setPriceInput(session.calculatedPrice.toFixed(2));
                                    }
                                  }
                                  // Clear admin message input
                                  setAdminMessage('');
                                }
                              } catch (error) {
                                console.error('Error loading messages:', error);
                                showToast('error', 'შეცდომა შეტყობინებების ჩატვირთვისას');
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-pink-500' 
                                  : 'bg-gradient-to-r from-pink-500 to-purple-500'
                              }`}>
                                <span className="text-white font-semibold text-sm">
                                  {userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold truncate ${
                                  isSelected ? 'text-pink-600' : 'text-black'
                                }`}>
                                  {userName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {new Date(session.createdAt).toLocaleDateString('ka-GE', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Chat Window */}
              <div className="flex-1 flex flex-col">
                {selectedChatSession ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {(() => {
                                const nameResponse = selectedChatSession.responses.find((r: { questionId: number }) => r.questionId === 9);
                                const userName = nameResponse?.answerText || 'User';
                                return userName.charAt(0).toUpperCase();
                              })()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-black">
                              {(() => {
                                const nameResponse = selectedChatSession.responses.find((r: { questionId: number }) => r.questionId === 9);
                                return nameResponse?.answerText || `Session: ${selectedChatSession.sessionId.slice(0, 15)}...`;
                              })()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedChatSession.createdAt).toLocaleDateString('ka-GE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedChatSession.isChatEnded
                            ? 'bg-gray-100 text-gray-800'
                            : selectedChatSession.isComplete
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedChatSession.isChatEnded 
                            ? 'დასრულებული' 
                            : selectedChatSession.isComplete 
                            ? 'Survey დასრულებული' 
                            : 'მიმდინარე'}
                        </span>
                        <div className="flex gap-2">
                          {!selectedChatSession.isChatEnded && (
                            <button
                              onClick={async () => {
                                if (window.confirm('ნამდვილად გსურთ ამ ჩათის დასრულება?')) {
                                  try {
                                    const response = await fetch('/api/chat-survey/end-chat', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        sessionId: selectedChatSession.sessionId
                                      })
                                    });

                                    const data = await response.json();
                                    if (data.success) {
                                      // Send ending message
                                      await fetch('/api/chat-survey/messages', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          sessionId: selectedChatSession.sessionId,
                                          senderType: 'bot',
                                          content: 'ადმინისტრატორმა დაასრულა საუბარი. გმადლობთ თქვენი დროისთვის!'
                                        })
                                      });

                                      // Update local state
                                      setSelectedChatSession({ ...selectedChatSession, isChatEnded: true });
                                      showToast('success', 'ჩათი დასრულებულია');
                                    }
                                  } catch (error) {
                                    console.error('Error ending chat:', error);
                                    showToast('error', 'შეცდომა ჩათის დასრულებისას');
                                  }
                                }
                              }}
                              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                              title="ჩათის დასრულება"
                            >
                              დასრულება
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (window.confirm('ნამდვილად გსურთ ამ ჩათის წაშლა? ყველა შეტყობინება და პასუხიც წაიშლება.')) {
                                try {
                                  const deleteResponse = await fetch(`/api/chat-survey/sessions/${selectedChatSession.sessionId}`, {
                                    method: 'DELETE'
                                  });

                                  if (deleteResponse.ok) {
                                    // Remove from live chat sessions list
                                    setLiveChatSessions(prev => prev.filter(s => s.id !== selectedChatSession.id));
                                    // Close chat modal
                                    setSelectedChatSession(null);
                                    setChatMessages([]);
                                    setAdminMessage('');
                                    showToast('success', 'ჩათი წაიშლა');
                                  } else {
                                    showToast('error', 'შეცდომა ჩათის წაშლისას');
                                  }
                                } catch (error) {
                                  console.error('Error deleting chat:', error);
                                  showToast('error', 'შეცდომა ჩათის წაშლისას');
                                }
                              }
                            }}
                            className="px-3 py-1 text-sm bg-red-200 hover:bg-red-300 text-red-700 rounded-lg transition-colors flex items-center gap-1"
                            title="ჩათის წაშლა"
                          >
                            <Trash2 className="w-4 h-4" />
                            წაშლა
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Survey Info Panel - Uploaded Images, Slices, and Price */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <h3 className="font-semibold text-gray-800 mb-3">📋 შეკვეთის ინფორმაცია</h3>
                      
                      {/* Uploaded Images */}
                      {(() => {
                        const imageResponses = selectedChatSession.responses.filter((r) => r.questionId === 4 && r.fileUrl);
                        if (imageResponses.length > 0) {
                          return (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">🖼️ ატვირთული სურათები:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {imageResponses.map((response) => {
                                  if (!response.fileUrl) return null;
                                  return (
                                    <div key={response.id} className="relative">
                                      {(response.fileUrl.includes('.jpg') || response.fileUrl.includes('.jpeg') || response.fileUrl.includes('.png') || response.fileUrl.includes('.gif') || response.fileUrl.includes('uploadthing') || response.fileUrl.includes('utfs.io')) ? (
                                        <Image
                                          src={response.fileUrl}
                                          alt={response.fileName || 'ატვირთული სურათი'}
                                          width={200}
                                          height={200}
                                          className="rounded-lg object-cover w-full h-32"
                                          unoptimized={response.fileUrl.includes('uploadthing') || response.fileUrl.includes('utfs.io')}
                                        />
                                      ) : (
                                        <a
                                          href={response.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block p-2 bg-gray-100 rounded-lg text-sm text-blue-600 hover:underline"
                                        >
                                          {response.fileName || 'ფაილი'}
                                        </a>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Number of Slices */}
                      {(() => {
                        const slicesResponse = selectedChatSession.responses.find((r: { questionId: number }) => r.questionId === 3);
                        if (slicesResponse) {
                          const slicesOptions = ["8-10 ნაჭრიანი", "10-12 ნაჭრიანი", "15-20 ნაჭრიანი", "25-30 ნაჭრიანი"];
                          const slicesText = slicesResponse.selectedOption !== null ? slicesOptions[slicesResponse.selectedOption] : 'არ არის მითითებული';
                          return (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-1">🍰 ნაჭრების რაოდენობა:</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{slicesText}</p>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Price Display/Input */}
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">💰 ფასი:</p>
                        {selectedChatSession.calculatedPrice ? (
                          <p className="text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                            {selectedChatSession.calculatedPrice.toFixed(2)} ₾
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">ფასი არ არის გამოთვლილი</p>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div id="chat-messages" className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <p>შეტყობინებები არ არის</p>
                        </div>
                      ) : (
                        chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderType === 'admin'
                                  ? 'bg-blue-500 text-white'
                                  : message.senderType === 'bot'
                                  ? 'bg-gray-200 text-gray-800'
                                  : 'bg-white text-gray-800 border border-gray-200'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {message.imageUrl && (
                                <div className="mt-2">
                                  <Image
                                    src={message.imageUrl}
                                    alt="Message image"
                                    width={200}
                                    height={200}
                                    className="rounded-lg"
                                  />
                                </div>
                              )}
                              {message.fileUrl && (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs underline mt-2 block"
                                >
                                  {message.fileName || 'ფაილი'}
                                </a>
                              )}
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString('ka-GE', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Price Calculation Area - Always visible when session is selected */}
                    {!selectedChatSession.isChatEnded && (
                      <div className={`p-4 border-t ${selectedChatSession.waitingForPrice ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="mb-3">
                          <h4 className={`font-semibold mb-2 ${selectedChatSession.waitingForPrice ? 'text-yellow-900' : 'text-gray-800'}`}>
                            💰 ფასის გამოთვლა და გაგზავნა
                          </h4>
                          {selectedChatSession.waitingForPrice && (
                            <p className="text-sm text-yellow-800 mb-3">მომხმარებელი ელოდება ფასის გამოთვლას</p>
                          )}
                          
                          {/* Calculate Price Button - Only show if waiting for price and not calculated yet */}
                          {selectedChatSession.waitingForPrice && !calculatedPrice && (
                            <button
                              onClick={async () => {
                                setIsCalculatingPrice(true);
                                try {
                                  const response = await fetch('/api/chat-survey/calculate-price', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      sessionId: selectedChatSession.sessionId
                                    })
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    setCalculatedPrice(data.priceRange.min);
                                    setPriceInput(data.priceRange.min.toFixed(2));
                                    showToast('success', `გამოთვლილი ფასი: ${data.priceRange.min.toFixed(2)} - ${data.priceRange.max.toFixed(2)} ₾`);
                                  } else {
                                    showToast('error', 'შეცდომა ფასის გამოთვლისას');
                                  }
                                } catch (error) {
                                  console.error('Error calculating price:', error);
                                  showToast('error', 'შეცდომა ფასის გამოთვლისას');
                                } finally {
                                  setIsCalculatingPrice(false);
                                }
                              }}
                              disabled={isCalculatingPrice}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
                            >
                              {isCalculatingPrice ? 'გამოთვლა...' : 'ფასის ავტომატური გამოთვლა'}
                            </button>
                          )}
                          
                          {/* Price Input and Send - Always visible */}
                          <div className="space-y-2">
                            <label className={`block text-sm font-medium mb-1 ${selectedChatSession.waitingForPrice ? 'text-yellow-900' : 'text-gray-700'}`}>
                              {selectedChatSession.calculatedPrice ? 'ფასის რედაქტირება:' : 'ხელით ფასის შეყვანა:'}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={priceInput || selectedChatSession.calculatedPrice?.toFixed(2) || ''}
                                onChange={(e) => setPriceInput(e.target.value)}
                                placeholder="შეიყვანეთ ფასი (₾)"
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
                                step="0.01"
                                min="0"
                              />
                              <button
                                onClick={async () => {
                                  const priceToSend = priceInput || selectedChatSession.calculatedPrice;
                                  if (!priceToSend || parseFloat(priceToSend.toString()) <= 0) {
                                    showToast('error', 'გთხოვთ შეიყვანოთ სწორი ფასი');
                                    return;
                                  }
                                  setIsSendingPrice(true);
                                  try {
                                    const response = await fetch('/api/chat-survey/send-price', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        sessionId: selectedChatSession.sessionId,
                                        price: parseFloat(priceToSend.toString())
                                      })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                      // Refresh messages immediately to show price message
                                      const messagesResponse = await fetch(`/api/chat-survey/messages/${selectedChatSession.sessionId}`);
                                      const messagesData = await messagesResponse.json();
                                      if (messagesData.success) {
                                        setChatMessages(messagesData.messages || []);
                                        
                                        // Scroll to bottom to show new price message
                                        setTimeout(() => {
                                          const messagesContainer = document.getElementById('chat-messages');
                                          if (messagesContainer) {
                                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                          }
                                        }, 100);
                                      }
                                      
                                      // Refresh session data
                                      const sessionResponse = await fetch('/api/chat-survey/responses');
                                      const sessionData = await sessionResponse.json();
                                      if (sessionData.success && sessionData.sessions) {
                                        const updatedSession = sessionData.sessions.find((s: SurveySession) => s.sessionId === selectedChatSession.sessionId);
                                        if (updatedSession) {
                                          setSelectedChatSession(updatedSession);
                                          setCalculatedPrice(updatedSession.calculatedPrice || null);
                                          if (updatedSession.calculatedPrice) {
                                            setPriceInput(updatedSession.calculatedPrice.toFixed(2));
                                          } else {
                                            setPriceInput('');
                                          }
                                        }
                                      }
                                      showToast('success', 'ფასი გაიგზავნა მომხმარებელს');
                                    } else {
                                      showToast('error', 'შეცდომა ფასის გაგზავნისას');
                                    }
                                  } catch (error) {
                                    console.error('Error sending price:', error);
                                    showToast('error', 'შეცდომა ფასის გაგზავნისას');
                                  } finally {
                                    setIsSendingPrice(false);
                                  }
                                }}
                                disabled={(!priceInput && !selectedChatSession.calculatedPrice) || isSendingPrice}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {isSendingPrice ? 'გაგზავნა...' : 'ფასის გაგზავნა'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Input Area - Always visible when chat is not ended */}
                    {!selectedChatSession.isChatEnded ? (
                      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={adminMessage}
                            onChange={(e) => {
                              setAdminMessage(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && adminMessage.trim() && !isSendingMessage) {
                                e.preventDefault();
                                sendAdminMessage();
                              }
                            }}
                            placeholder="ჩაწერეთ პასუხი..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                            disabled={isSendingMessage}
                            autoFocus={false}
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (adminMessage.trim() && !isSendingMessage && selectedChatSession) {
                                sendAdminMessage();
                              }
                            }}
                            disabled={!adminMessage.trim() || isSendingMessage || !selectedChatSession}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                              adminMessage.trim() && !isSendingMessage && selectedChatSession
                                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            type="button"
                          >
                            {isSendingMessage ? 'გაგზავნა...' : 'გაგზავნა'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-center text-gray-600">
                          <p className="font-medium">ჩათი დასრულებულია</p>
                          <p className="text-sm mt-1">საუბარი დასრულებულია</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">აირჩიეთ სესია ჩათის დასაწყებად</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Survey Responses Tab */}
        {activeTab === 'survey-responses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">კითხვებზე პასუხები</h2>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {surveySessions.filter(session => session.responses.length > 0).length} სესია
                </div>
              </div>

                      {/* Survey Sessions List */}
                      <div className="space-y-6">
                        {surveySessions.filter(session => session.responses.length > 0).length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">ჯერ არ არის პასუხები</p>
                          </div>
                        ) : (
                          surveySessions.filter(session => session.responses.length > 0).map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Session Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">#{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                {/* Product Image if productId exists */}
                                {session.productId && productImages.has(session.productId) && (
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                      src={productImages.get(session.productId)!}
                                      alt="Product"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-black">
                                    {(() => {
                                      const nameResponse = session.responses.find(r => r.questionId === 9);
                                      return nameResponse?.answerText || 'სესიის ID: ' + session.sessionId.slice(0, 20);
                                    })()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(session.createdAt).toLocaleDateString('ka-GE', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {session.productId && (
                                    <p className="text-xs text-pink-600 mt-1">
                                      პროდუქტი ID: {session.productId}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedSessions);
                              if (newExpanded.has(session.id)) {
                                newExpanded.delete(session.id);
                              } else {
                                newExpanded.add(session.id);
                              }
                              setExpandedSessions(newExpanded);
                            }}
                            className="px-4 py-2 text-sm bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition-colors flex items-center space-x-2 font-medium"
                          >
                            <span>{expandedSessions.has(session.id) ? '▼' : '▶'}</span>
                            <span>{expandedSessions.has(session.id) ? 'დამალვა' : 'გამოჩენა'}</span>
                          </button>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.isChatEnded
                              ? 'bg-gray-100 text-gray-800'
                              : session.isComplete
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.isChatEnded 
                              ? 'დასრულებული' 
                              : session.isComplete 
                              ? 'Survey დასრულებული' 
                              : 'მიმდინარე'}
                          </span>
                          <button
                            onClick={async () => {
                              if (window.confirm('ნამდვილად გსურთ ამ სესიის წაშლა? ყველა პასუხიც წაიშლება.')) {
                                try {
                                  const deleteResponse = await fetch(`/api/chat-survey/sessions/${session.sessionId}`, {
                                    method: 'DELETE'
                                  });
                                  if (deleteResponse.ok) {
                                    showToast('success', 'სესია წარმატებით წაიშალა');
                                    // Refresh data
                                    const surveyResponse = await fetch('/api/chat-survey/responses');
                                    const surveyData = await surveyResponse.json();
                                    if (surveyData.success && surveyData.sessions) {
                                      setSurveySessions(surveyData.sessions);
                                    }
                                  }
                                } catch {
                                  showToast('error', 'შეცდომა');
                                }
                              }
                            }}
                            className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors text-sm font-medium border border-red-300"
                          >
                             წაშლა
                          </button>
                        </div>
                      </div>

                      {/* Responses */}
                      {expandedSessions.has(session.id) && (
                        <div className="space-y-4">
                          {session.responses.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">პასუხები არ არის</p>
                          ) : (
                            session.responses.map((response, respIndex) => (
                            <div key={response.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                  <span className="text-pink-600 font-bold text-sm">{respIndex + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 mb-2">{response.questionText}</p>
                                  
                                  {response.answerType === 'multiple_choice' && response.selectedOption !== null && (() => {
                                    const question = surveyQuestions.find(q => q.id === response.questionId);
                                    const selectedOptionText = question?.options?.[response.selectedOption] || `ვარიანტი ${response.selectedOption + 1}`;
                                    return (
                                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                                        <p className="text-sm text-gray-700">
                                          ✓ პასუხი: {selectedOptionText}
                                        </p>
                                      </div>
                                    );
                                  })()}

                                  {response.answerType === 'text' && response.answerText && (
                                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                                      <p className="text-sm text-gray-700">{response.answerText}</p>
                                    </div>
                                  )}

                                  {response.answerType === 'file' && response.fileUrl && (
                                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                                      {/* Show image if it's an image file */}
                                      {(response.fileUrl.includes('.jpg') || response.fileUrl.includes('.jpeg') || response.fileUrl.includes('.png') || response.fileUrl.includes('.gif') || response.fileUrl.includes('uploadthing')) && (
                                        <div className="relative w-full max-w-md h-64 mb-3">
                                          <Image 
                                            src={response.fileUrl} 
                                            alt="Uploaded" 
                                            fill
                                            className="object-contain rounded-lg border border-gray-200"
                                          />
                                        </div>
                                      )}
                                      {/* Show file link for all file types */}
                                      <a
                                        href={response.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                                      >
                                        <span>📎</span>
                                        <Image
                                          src={response.fileUrl}
                                          alt="Uploaded"
                                          width={200}
                                          height={200}
                                          className="object-cover rounded-lg"
                                        />
                                       
                                      </a>
                                    </div>
                                  )}
                                        </div>
                                      </div>
                                     </div>
                           ))
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default AdminPage;
