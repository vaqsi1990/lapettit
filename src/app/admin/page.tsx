"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
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
 
  Mail
} from 'lucide-react';
import { getCakes, getOrders, deleteCake, deleteOrder } from '@/lib/action';
// @ts-ignore
import AddCakeForm from '@/components/AddCakeForm';
// @ts-ignore
import EditCakeForm from '@/components/EditCakeForm';

interface Cake {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
 
  category: string;
  servings: number | null;
  weightKg: number | null;
  flavors: string[];
  fillings: string[];
  isCustomizable: boolean;
  available: boolean;
  createdAt: Date;
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
    cake: {
      id: number;
      name: string;
      price: number;
    };
  }[];
  customCake?: {
    id: number;
    design: string;
    flavor: string;
    filling?: string;
    glaze?: string;
    shape?: string;
    decorations: string[];
    text?: string;
    quantity: number;
    deliveryDate: Date;
    deliveryTime?: string;
    imageUrl?: string;
  } | null;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingCake, setEditingCake] = useState<Cake | null>(null);
  const { showToast } = useToast();


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
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'მიმდინარე';
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
  const totalCustomers = new Set(orders.map(order => order.customerPhone)).size;

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
              { id: 'customers', label: 'კლიენტები', icon: Users }
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
                { title: 'საერთო შემოსავალი', value: `₾${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
                { title: 'მიმდინარე შეკვეთები', value: pendingOrders.toString(), icon: ShoppingCart, color: 'bg-yellow-500' },
                { title: 'სულ ტორტები', value: cakes.length.toString(), icon: Package, color: 'bg-pink-500' },
                { title: 'სულ კლიენტები', value: totalCustomers.toString(), icon: Users, color: 'bg-blue-500' }
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
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">ბოლო შეკვეთები</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#d90b6b] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{order.customerName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerPhone}</p>
                      </div>
                    </div>
                                         <div className="text-right">
                       <p className="font-bold text-[#d90b6b]">₾{order.total}</p>
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                         {getStatusText(order.status)}
                       </span>
                       <p className="text-xs text-gray-500 mt-1">
                         {order.customCake ? `${order.customCake.design} ტორტი` : 
                          order.items.map(item => `${item.cake.name} (${item.quantity})`).join(', ')}
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
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
                  <option value="PENDING">მიმდინარე</option>
                  <option value="IN_PROGRESS">მზადდება</option>
                  <option value="DELIVERED">მიწოდებული</option>
                  <option value="CANCELLED">გაუქმებული</option>
                </select>
              </div>
            </div>

            {/* Orders List - Detailed Cards */}
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
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
                         {/* Email Status Indicator */}
                         <div className="flex items-center justify-end mt-2 space-x-2">
                           <Mail className="w-4 h-4 text-gray-400" />
                           <span className="text-xs text-gray-500">
                             {order.customerEmail ? 'Email confirmation sent' : 'No email provided'}
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
                                <div className="text-lg font-bold text-[#d90b6b]">₾{(item.cake.price * item.quantity).toFixed(2)}</div>
                                <div className="md:text-[18px] text-[16px] text-black">რაოდენობა: {item.quantity}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                                         {/* Custom Cake */}
                     {order.customCake && (
                       <div className="mb-6">
                         <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          
                           ინდივიდუალური ტორტი
                         </h4>
                         <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-black">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <p className="md:text-[18px] text-[16px] font-medium text-black">დიზაინი</p>
                               <p className="font-semibold text-black">{order.customCake.design}</p>
                             </div>
                             <div>
                               <p className="md:text-[18px] text-[16px] font-medium text-black">გემო</p>
                               <p className="font-semibold text-black">{order.customCake.flavor}</p>
                             </div>
                             <div>
                               <p className="md:text-[18px] text-[16px] font-medium text-black">შიგთავსი</p>
                               <p className="font-semibold text-black">{order.customCake.filling || 'არ არის მითითებული'}</p>
                             </div>
                             <div>
                               <p className="md:text-[18px] text-[16px] font-medium text-black">გლაზური</p>
                               <p className="font-semibold text-black">{order.customCake.glaze || 'არ არის მითითებული'}</p>
                             </div>
                             <div>
                               <p className="md:text-[18px] text-[16px] font-medium text-black">ფორმა</p>
                               <p className="font-semibold text-black">{order.customCake.shape || 'არ არის მითითებული'}</p>
                             </div>
                             <div>
                               <p className="md:text-[18px] text-[16px] font-medium text-black">რაოდენობა</p>
                               <p className="font-semibold text-black">{order.customCake.quantity}</p>
                             </div>
                           </div>
                           
                           {/* Decorations */}
                           {order.customCake.decorations && order.customCake.decorations.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-purple-200">
                               <p className="md:text-[18px] text-[16px] font-medium text-black mb-2">დეკორაციები</p>
                               <div className="flex flex-wrap gap-2">
                                 {order.customCake.decorations.map((decoration, index) => (
                                   <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full md:text-[18px] text-[16px]">
                                     {decoration}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           )}
                           
                           {/* Custom Text */}
                           {order.customCake.text && (
                             <div className="mt-4 pt-4 border-t border-purple-200">
                               <p className="md:text-[18px] text-[16px] font-medium text-black mb-2">მორგებული ტექსტი</p>
                                                                <p className="font-semibold text-gray-800 bg-white p-3 rounded-lg border border-purple-200">
                                   &ldquo;{order.customCake.text}&rdquo;
                                 </p>
                             </div>
                           )}
                           
                           {/* Delivery Details */}
                           <div className="mt-4 pt-4 border-t border-purple-200">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <p className="md:text-[18px] text-[16px] font-medium text-black">მიწოდების თარიღი</p>
                                 <p className="font-semibold text-black">
                                   {new Date(order.customCake.deliveryDate).toLocaleDateString('ka-GE', {
                                     year: 'numeric',
                                     month: 'long',
                                     day: 'numeric'
                                   })}
                                 </p>
                               </div>
                               {order.customCake.deliveryTime && (
                                 <div>
                                   <p className="md:text-[18px] text-[16px] font-medium text-black">მიწოდების დრო</p>
                                   <p className="font-semibold text-black">{order.customCake.deliveryTime}</p>
                                 </div>
                               )}
                             </div>
                           </div>
                           
                           {/* Reference Image */}
                           {order.customCake.imageUrl && (
                             <div className="mt-4 pt-4 border-t border-purple-200">
                               <p className="md:text-[18px] text-[16px] font-medium text-black mb-2">მითითებული სურათი</p>
                               <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-purple-200">
                                 <img
                                   src={order.customCake.imageUrl}
                                   alt="Reference design"
                                   className="w-full h-full object-cover"
                                 />
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     )}

                  
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                     
                      <button className="px-4 py-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors flex items-center space-x-2 md:text-[18px] text-[16px]">
                        <Edit className="w-4 h-4" />
                        <span>რედაქტირება</span>
                      </button>
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
                    <img
                      src={cake.imageUrl || '/catalog/1.jpg'}
                      alt={cake.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                      {cake.category}
                    </div>

                  </div>
                  <div className="p-6">
                    <h3 className="md:text-[18px] text-[16px] font-semibold text-black mb-2">{cake.name}</h3>
                    <p className="text-black md:text-[18px] text-[16px] mb-4 line-clamp-2">{cake.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#d90b6b]">₾{cake.price}</span>
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
                  value: `₾${(orders.reduce((sum, order) => sum + order.total, 0) / orders.length || 0).toFixed(2)}`, 
                  icon: ShoppingCart, 
                  color: 'bg-yellow-500' 
                },
                { 
                  title: 'საშუალო კლიენტის ღირებულება', 
                  value: `₾${(orders.reduce((sum, order) => sum + order.total, 0) / new Set(orders.map(order => `${order.customerName}-${order.customerPhone}`)).size || 0).toFixed(2)}`, 
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
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">კლიენტების სია</h2>
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">კლიენტი</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">კონტაქტი</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">მისამართი</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">სტატისტიკა</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">მოქმედებები</th>
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
                                <p className="font-semibold text-gray-800 text-lg">{customer.customerName}</p>
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
                                <span className="text-sm text-gray-600">შეკვეთები:</span>
                                <span className="font-semibold text-gray-800">{customer.orders.length}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">სულ:</span>
                                <span className="font-bold text-[#d90b6b]">₾{customer.totalSpent.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">ბოლო:</span>
                                <span className="text-xs text-gray-500">
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
      </div>
    </div>
  );
};

export default AdminPage;
