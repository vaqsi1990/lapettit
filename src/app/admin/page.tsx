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
  const [filterStatus, setFilterStatus] = useState('PENDING'); // Default to PENDING to show pending orders first
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
            const hasStarted =
              (session.responses && session.responses.length > 0) ||
              (session.messages && session.messages.some((message: ChatMessage) => message.senderType === 'user'));

            const shouldDisplay =
              session.isComplete ||
              session.waitingForPrice ||
              (session.messages && session.messages.length > 0);

            return hasStarted && shouldDisplay;
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
      // Poll for new chat sessions every 10 seconds when on live-chat tab (reduced frequency for better performance)
      const interval = setInterval(fetchLiveChatSessions, 10000);
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

        // Fetch orders directly from API (client-side)
        try {
          const ordersResponse = await fetch('/api/orders', {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            console.log('Orders fetch result:', ordersData);
            if (ordersData.success && ordersData.data) {
              console.log('Orders data:', ordersData.data);
              console.log('Pending orders count:', ordersData.data.filter((o: Order) => o.status === 'PENDING').length);
              setOrders(ordersData.data);
            } else {
              console.error('Failed to fetch orders:', ordersData.error);
            }
          } else {
            console.error('Failed to fetch orders:', ordersResponse.status, ordersResponse.statusText);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          // Fallback to server action
          const ordersResult = await getOrders();
          if (ordersResult.success && ordersResult.data) {
            setOrders(ordersResult.data);
          }
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
    
    // Refresh orders every 30 seconds to show new pending orders
    const interval = setInterval(() => {
      const refreshOrders = async () => {
        try {
          const ordersResponse = await fetch('/api/orders', {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            if (ordersData.success && ordersData.data) {
              console.log('Orders refreshed:', ordersData.data.length, 'total orders');
              setOrders(ordersData.data);
            }
          }
        } catch (error) {
          console.error('Error refreshing orders:', error);
        }
      };
      refreshOrders();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
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
          // Refresh orders from server to get updated data
          try {
            const ordersResponse = await fetch('/api/orders', {
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            if (ordersResponse.ok) {
              const ordersData = await ordersResponse.json();
              if (ordersData.success && ordersData.data) {
                setOrders(ordersData.data);
              }
            }
          } catch (error) {
            console.error('Error refreshing orders after approval:', error);
          }
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
          // Refresh orders from server to get updated data
          try {
            const ordersResponse = await fetch('/api/orders', {
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            if (ordersResponse.ok) {
              const ordersData = await ordersResponse.json();
              if (ordersData.success && ordersData.data) {
                setOrders(ordersData.data);
              }
            }
          } catch (error) {
            console.error('Error refreshing orders after rejection:', error);
          }
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

  // Debug logging
  useEffect(() => {
    console.log('Orders state:', {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      filterStatus,
      filteredOrdersCount: filteredOrders.length,
      ordersStatuses: orders.map(o => ({ id: o.id, status: o.status, customerName: o.customerName }))
    });
  }, [orders, filterStatus, filteredOrders.length]);

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

      if (!response.ok) {
        console.error('API request failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error data:', errorData);
        showToast('error', errorData.error || 'შეცდომა შეტყობინების გაგზავნისას');
        setAdminMessage(currentMessage);
        return;
      }

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
    <div className="min-h-screen mb-[250px] bg-color pt-10">
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
          <div className="flex flex-wrap gap-2 md:flex-nowrap overflow-x-auto md:gap-2">
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
                className={`flex flex-shrink-0 cursor-pointer whitespace-nowrap items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 md:text-[20px] text-[18px] ${
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
              {filteredOrders.length === 0 ? (
                <div className="bg-white text-black placeholder:text-black rounded-2xl shadow-lg p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {filterStatus === 'PENDING' 
                      ? 'დასამტკიცებელი შეკვეთები არ არის' 
                      : filterStatus === 'all'
                      ? 'შეკვეთები არ არის'
                      : `${getStatusText(filterStatus)} სტატუსის შეკვეთები არ არის`}
                  </h3>
                  <p className="text-gray-500">
                    {filterStatus === 'PENDING' 
                      ? 'ყველა შეკვეთა დადასტურებულია ან დამუშავებულია' 
                      : 'შეკვეთები ჯერ არ შექმნილა'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => (
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
                      {/* {order.status === 'PENDING' && (
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
                      )} */}
                      {/* {order.status !== 'PENDING' && (
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
                      )} */}
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-4 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 md:text-[18px] text-[16px]"
                      >
                        <Trash2 className="w-7 h-7" />
                        <span>წაშლა</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
                ))
              )}
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
                   

                  </div>
                  <div className="p-6">
                    <h3 className="md:text-[20px] text-[18px] font-semibold text-black mb-2">{cake.name}</h3>
                    <div className="space-y-2">
                      <div className="md:text-[20px] text-[18px] text-black">
                        {cake.pieces && <span>{cake.pieces} ნაჭერი</span>}
                        {cake.hasMarzipan && <span className="ml-2">• მარცეპანი</span>}
                        {cake.hasCream && <span className="ml-2">• კრემი</span>}
                      </div>
                      <div className="md:text-[20px] text-[18px] text-black">
                        {cake.price && <span className="font-bold text-[#d90b6b]">ფასი: {formatPrice(cake.price)}</span>}
                        {cake.marzipanPrice && <span className="ml-2">მარცეპანი: {formatPrice(cake.marzipanPrice)}</span>}
                        {cake.creamPrice && <span className="ml-2">კრემი: {formatPrice(cake.creamPrice)}</span>}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="md:text-[16px] text-[15px] text-black">
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
                <div className="text-[16px] text-black bg-gray-100 px-3 py-1 rounded-full">
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
            className="bg-white h-screen rounded-2xl shadow-lg overflow-hidden"
            style={{ height: 'calc(100vh - 180px)' }}
          >
            <div className="flex h-full">
              {/* Left Sidebar - Sessions List */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-black">Live Chat</h2>
                      <p className="text-sm text-gray-600 mt-1">{liveChatSessions.length} აქტიური ჩატი</p>
                    </div>
                    {liveChatSessions.length > 0 && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`ნამდვილად გსურთ ყველა ჩათის წაშლა? (${liveChatSessions.length} ჩატი) ყველა შეტყობინება და პასუხიც წაიშლება.`)) {
                            try {
                              const deleteResponse = await fetch('/api/chat-survey/sessions/delete-all', {
                                method: 'DELETE'
                              });

                              if (deleteResponse.ok) {
                                const data = await deleteResponse.json();
                                setLiveChatSessions([]);
                                setSelectedChatSession(null);
                                setChatMessages([]);
                                setAdminMessage('');
                                showToast('success', `წარმატებით წაიშალა ${data.deletedCount} ჩატი`);
                              } else {
                                showToast('error', 'შეცდომა ჩათების წაშლისას');
                              }
                            } catch (error) {
                              console.error('Error deleting all chats:', error);
                              showToast('error', 'შეცდომა ჩათების წაშლისას');
                            }
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        title="ყველა ჩათის წაშლა"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">ყველას წაშლა</span>
                      </button>
                    )}
                  </div>
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
              <div className="flex-1 flex flex-col overflow-hidden h-full">
                {selectedChatSession ? (
                  <>
                    {/* Chat Header */}
                

                    {/* Survey Info Panel - Uploaded Images, Slices, and Price */}
                    <div
                      className="p-4 border-b h-screen border-gray-200 bg-white flex-shrink-0 overflow-y-auto"
                      style={{ maxHeight: 'calc(100vh - 240px)' }}
                    >
                      <h3 className="font-semibold text-gray-800 mb-3"> შეკვეთის ინფორმაცია</h3>
                      
                      {/* Uploaded Images */}
                      {(() => {
                        const imageResponses = selectedChatSession.responses.filter((r) => r.questionId === 4 && r.fileUrl);
                        if (imageResponses.length > 0) {
                          return (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2"> ატვირთული სურათები:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {imageResponses.map((response) => {
                                  if (!response.fileUrl) return null;
                                  return (
                                    <div key={response.id} className="relative">
                                      {(response.fileUrl.includes('.jpg') || response.fileUrl.includes('.jpeg') || response.fileUrl.includes('.png') || response.fileUrl.includes('.gif') || response.fileUrl.includes('uploadthing') || response.fileUrl.includes('utfs.io')) ? (
                                      <Image
                                        src={response.fileUrl}
                                        alt={response.fileName || 'ატვირთული სურათი'}
                                        width={400}
                                        height={300}
                                        className="rounded-lg w-full max-h-92 object-contain bg-gray-100 p-1"
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
                              <p className="text-sm font-medium text-gray-700 mb-1"> ნაჭრების რაოდენობა:</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{slicesText}</p>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Price Display/Input */}
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 mb-2"> ფასი:</p>
                        {selectedChatSession.calculatedPrice ? (
                          <p className="text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                            {selectedChatSession.calculatedPrice.toFixed(2)} ₾
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">ფასი არ არის გამოთვლილი</p>
                        )}
                      </div>
                    </div>

                

                    {/* Price Calculation Area - Separate section - Always visible when session is selected - Moved above bot questions */}
                    <div className={`border-t  flex-shrink-0 bg-white shadow-lg sticky bottom-0 z-30 ${selectedChatSession.waitingForPrice ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300 bg-gray-50'}`}>
                       
                        <div className="p-2">
                          {/* Calculate Price Button - Only show if waiting for price and not calculated yet */}
                         
                          
                          {/* Price Input and Send - Always visible */}
                          <div className="space-y-2">
                           
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={priceInput || selectedChatSession.calculatedPrice?.toFixed(2) || ''}
                                onChange={(e) => setPriceInput(e.target.value)}
                                placeholder="შეიყვანეთ ფასი (₾)"
                                className="flex-1 p-2 border border-black rounded-lg  text-black"
                                step="0.01"
                                min="0"
                              />
                              <button
                                onClick={async () => {
                                  const priceToSend = priceInput || selectedChatSession.calculatedPrice;
                                  if (!priceToSend) {
                                    showToast('error', 'გთხოვთ შეიყვანოთ ფასი');
                                    return;
                                  }
                                  
                                  const priceValue = parseFloat(priceToSend.toString());
                                  if (isNaN(priceValue) || priceValue <= 0) {
                                    showToast('error', 'გთხოვთ შეიყვანოთ სწორი ფასი');
                                    return;
                                  }
                                  
                                  console.log('Sending price from admin:', { 
                                    sessionId: selectedChatSession.sessionId, 
                                    price: priceValue 
                                  });
                                  
                                  setIsSendingPrice(true);
                                  try {
                                    const response = await fetch('/api/chat-survey/send-price', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        sessionId: selectedChatSession.sessionId,
                                        price: priceValue
                                      })
                                    });
                                    const data = await response.json();
                                    
                                    console.log('Price send response:', data);
                                    if (data.success) {
                                      // Add the price message to local state immediately (optimistic update)
                                      if (data.message) {
                                        setChatMessages(prev => [...prev, data.message]);
                                      }
                                      
                                      // Refresh messages after a short delay to ensure database consistency
                                      setTimeout(async () => {
                                        const messagesResponse = await fetch(`/api/chat-survey/messages/${selectedChatSession.sessionId}`);
                                        const messagesData = await messagesResponse.json();
                                        if (messagesData.success) {
                                          setChatMessages(messagesData.messages || []);
                                        }
                                      }, 500);
                                      
                                      // Scroll to bottom to show new price message
                                      setTimeout(() => {
                                        const messagesContainer = document.getElementById('chat-messages');
                                        if (messagesContainer) {
                                          messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                        }
                                      }, 100);
                                      
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
                                className="px-4 py-2 bg-black  text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-[18px] font-bold"
                              >
                                {isSendingPrice ? 'გაგზავნა...' : 'გაგზავნა'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    {/* Input Area - Always visible when chat is not ended */}
             
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
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {surveySessions.filter(session => session.responses.length > 0).length} სესია
                  </div>
                  {surveySessions.filter(session => session.responses.length > 0).length > 0 && (
                    <button
                      onClick={async () => {
                        const sessionCount = surveySessions.filter(session => session.responses.length > 0).length;
                        if (window.confirm(`ნამდვილად გსურთ ყველა სესიის წაშლა? (${sessionCount} სესია) ყველა პასუხიც წაიშლება.`)) {
                          try {
                            const deleteResponse = await fetch('/api/chat-survey/sessions/delete-all', {
                              method: 'DELETE'
                            });

                            if (deleteResponse.ok) {
                              const data = await deleteResponse.json();
                              setSurveySessions([]);
                              showToast('success', `წარმატებით წაიშალა ${data.deletedCount} სესია`);
                            } else {
                              showToast('error', 'შეცდომა სესიების წაშლისას');
                            }
                          } catch (error) {
                            console.error('Error deleting all sessions:', error);
                            showToast('error', 'შეცდომა სესიების წაშლისას');
                          }
                        }
                      }}
                      className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                      title="ყველა სესიის წაშლა"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">ყველას წაშლა</span>
                    </button>
                  )}
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
