'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../lib/api';
import { Product, CreateProductData, UpdateProductData } from '../types';
import ImageWithFallback from './ImageWithFallback';
import toast from 'react-hot-toast';
import { 
  LogOut, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  X, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Filter,
  Download,
  Star
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    avgPrice: 0,
    categories: 0
  });

  const limit = 8;

  // Calculate statistics from products
  const calculateStats = (productsData: Product[]) => {
    const totalProducts = productsData.length;
    const totalValue = productsData.reduce((sum, product) => sum + product.product_price, 0);
    const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
    const categories = new Set(productsData.map(p => p.product_category).filter(Boolean)).size;
    
    setStats({ totalProducts, totalValue, avgPrice, categories });
  };

  // Fetch products
  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await ApiService.getProducts({
        page,
        limit,
        ...(search && { search })
      });

      if (response.is_success) {
        setProducts(response.data);
        setTotal(response.pagination?.total || 0);
        setTotalPages(response.pagination?.total_pages || 1);
        setCurrentPage(page);
        calculateStats(response.data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error: any) {
      toast.error('Error fetching products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setCurrentPage(1);
        fetchProducts(1, searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchProducts(page, searchTerm);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setShowModal(true);
  };

  const openViewModal = (product: Product) => {
    setModalMode('view');
    setSelectedProduct(product);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Handle form submission
  const handleFormSubmit = async (data: CreateProductData | UpdateProductData) => {
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await ApiService.createProduct(data as CreateProductData);
        toast.success('Product created successfully!');
      } else if (modalMode === 'edit' && selectedProduct) {
        response = await ApiService.updateProduct(selectedProduct.product_id, data as UpdateProductData);
        toast.success('Product updated successfully!');
      }

      if (response?.is_success) {
        closeModal();
        fetchProducts(currentPage, searchTerm);
      }
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (productId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Product Dashboard
                </h1>
                <p className="text-slate-600">Welcome, {user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Products"
              value={stats.totalProducts.toString()}
              icon={<Package className="h-6 w-6" />}
              gradient="from-blue-500 to-blue-600"
              change="+12%"
            />
            <StatCard
              title="Total Value"
              value={`$${stats.totalValue.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6" />}
              gradient="from-green-500 to-green-600"
              change="+8%"
            />
            <StatCard
              title="Average Price"
              value={`$${stats.avgPrice.toFixed(2)}`}
              icon={<TrendingUp className="h-6 w-6" />}
              gradient="from-purple-500 to-purple-600"
              change="+15%"
            />
            <StatCard
              title="Categories"
              value={stats.categories.toString()}
              icon={<ShoppingCart className="h-6 w-6" />}
              gradient="from-orange-500 to-orange-600"
              change="+3%"
            />
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex items-center space-x-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products, categories, descriptions..."
                    className="pl-10 pr-4 py-3 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="p-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                  <Filter className="h-5 w-5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-3 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Product Inventory</h3>
              <p className="text-sm text-slate-600">Manage your product catalog</p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 text-lg">No products found</p>
                <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-12"></th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {products.map((product) => (
                      <React.Fragment key={product.product_id}>
                        <ProductRow
                          product={product}
                          isExpanded={expandedRows.has(product.product_id)}
                          onToggleExpansion={() => toggleRowExpansion(product.product_id)}
                          onView={openViewModal}
                          onEdit={openEditModal}
                        />
                        {expandedRows.has(product.product_id) && (
                          <ProductDetailRow product={product} />
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <ProductModal
          mode={modalMode}
          product={selectedProduct}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

// Statistics Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  gradient, 
  change 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  gradient: string; 
  change: string; 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-500">{change}</span>
            <span className="text-sm text-slate-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Product Row Component
function ProductRow({ 
  product, 
  isExpanded, 
  onToggleExpansion, 
  onView, 
  onEdit 
}: { 
  product: Product; 
  isExpanded: boolean; 
  onToggleExpansion: () => void; 
  onView: (product: Product) => void; 
  onEdit: (product: Product) => void; 
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <button
          onClick={onToggleExpansion}
          className="p-1 rounded-full hover:bg-slate-200 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200">
            <ImageWithFallback
              src={product.product_image || ''}
              alt={product.product_title}
              className="h-full w-full object-cover"
              fallbackText="IMG"
            />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 line-clamp-1">
              {product.product_title}
            </div>
            <div className="text-sm text-slate-500 line-clamp-1">
              ID: {product.product_id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-lg font-semibold text-green-600">
          ${product.product_price.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.product_category || 'Uncategorized'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></div>
          Active
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(product)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Product Detail Row Component
function ProductDetailRow({ product }: { product: Product }) {
  return (
    <tr className="bg-slate-50">
      <td colSpan={6} className="px-6 py-6">
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Product Image</h4>
              <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-200">
                <ImageWithFallback
                  src={product.product_image || ''}
                  alt={product.product_title}
                  className="w-full h-full object-cover"
                  fallbackText="Product Image"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Product Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <p className="mt-1 text-sm text-slate-900">
                    {product.product_description || 'No description available'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Price</label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      ${product.product_price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Category</label>
                    <p className="mt-1 text-sm text-slate-900">
                      {product.product_category || 'Uncategorized'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Created</label>
                    <p className="mt-1 text-sm text-slate-900">
                      {new Date(product.created_timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Updated</label>
                    <p className="mt-1 text-sm text-slate-900">
                      {new Date(product.updated_timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// Product Modal Component
function ProductModal({
  mode,
  product,
  onClose,
  onSubmit
}: {
  mode: 'create' | 'edit' | 'view';
  product: Product | null;
  onClose: () => void;
  onSubmit: (data: CreateProductData | UpdateProductData) => void;
}) {
  const [formData, setFormData] = useState({
    product_title: product?.product_title || '',
    product_price: product?.product_price || 0,
    product_description: product?.product_description || '',
    product_image: product?.product_image || '',
    product_category: product?.product_category || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit(formData);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-xl bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {mode === 'create' ? 'Create Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Title
            </label>
            <input
              type="text"
              required
              readOnly={isReadOnly}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
              value={formData.product_title}
              onChange={(e) => setFormData({ ...formData, product_title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              readOnly={isReadOnly}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
              value={formData.product_price}
              onChange={(e) => setFormData({ ...formData, product_price: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              readOnly={isReadOnly}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 resize-none"
              value={formData.product_description}
              onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              readOnly={isReadOnly}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
              value={formData.product_image}
              onChange={(e) => setFormData({ ...formData, product_image: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <input
              type="text"
              readOnly={isReadOnly}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
              value={formData.product_category}
              onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
            />
          </div>

          {!isReadOnly && (
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                {mode === 'create' ? 'Create Product' : 'Update Product'}
              </button>
            </div>
          )}
        </form>

        {mode === 'view' && product && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Product ID:</span>
                <span>{product.product_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(product.created_timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Updated:</span>
                <span>{new Date(product.updated_timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}