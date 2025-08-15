// src/app/products/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Input, Modal, Form, InputNumber, Typography,
  Card, Row, Col, Statistic, message, Descriptions, Tag, Image, Spin, Space, Divider
} from 'antd';
import {
  PlusOutlined, SearchOutlined, LogoutOutlined, EditOutlined,
  ShoppingCartOutlined, DollarOutlined, AppstoreOutlined, UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ApiService } from '../../lib/api';
import { Product, CreateProductData, UpdateProductData } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  const { user, logout, getToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const limit = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch products with proper token handling
  const fetchProducts = useCallback(async (page = 1, search = '') => {
    if (!user) return; // Don't fetch if no user
    
    try {
      setLoading(true);
      
      // Get fresh token for this request
      const token = await getToken();
      
      const params: { page: number; limit: number; search?: string } = {
        page,
        limit
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await ApiService.getProducts(params, token);

      if (response.is_success) {
        setProducts(response.data);
        setTotal(response.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        console.error('API Response Error:', response);
        message.error(`Failed to fetch products: ${response.error_code || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Fetch Products Error:', error);
      if (error.response?.status === 401) {
        message.error('Authentication failed. Please login again.');
        logout();
        router.push('/login');
      } else {
        message.error(`Error fetching products: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [limit, user, getToken, logout, router]);

  // Initial fetch when user is ready
  useEffect(() => {
    if (user) {
      fetchProducts(1, debouncedSearchTerm);
      if (debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }
  }, [user, debouncedSearchTerm, fetchProducts]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalPrice = products.reduce((sum, p) => sum + p.product_price, 0);
    const avgPrice = products.length ? totalPrice / products.length : 0;
    const categories = [...new Set(products.map(p => p.product_category).filter(Boolean))];
    
    return {
      totalProducts: total,
      averagePrice: avgPrice,
      totalCategories: categories.length,
      totalValue: totalPrice
    };
  }, [products, total]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      message.success('Logged out successfully');
      router.push('/login');
    } catch (error: any) {
      message.error('Logout failed: ' + error.message);
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    form.setFieldsValue(product);
    setModalVisible(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Get fresh token for this request
      const token = await getToken();
      
      if (modalMode === 'create') {
        const response = await ApiService.createProduct(values as CreateProductData, token);
        if (response.is_success) {
          message.success('Product created successfully!');
          fetchProducts(currentPage, debouncedSearchTerm);
        } else {
          message.error(`Failed to create product: ${response.error_code || 'Unknown error'}`);
        }
      } else if (modalMode === 'edit' && selectedProduct) {
        const response = await ApiService.updateProduct(
          selectedProduct.product_id,
          values as UpdateProductData,
          token
        );
        if (response.is_success) {
          message.success('Product updated successfully!');
          fetchProducts(currentPage, debouncedSearchTerm);
        } else {
          message.error(`Failed to update product: ${response.error_code || 'Unknown error'}`);
        }
      }
      
      setModalVisible(false);
    } catch (error: any) {
      console.error('Modal Submit Error:', error);
      if (error.response?.status === 401) {
        message.error('Authentication failed. Please login again.');
        logout();
        router.push('/login');
      } else {
        message.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Table columns with expandable row details
  const columns = [
    {
      title: 'Product Title',
      dataIndex: 'product_title',
      key: 'product_title',
      ellipsis: true,
      render: (text: string) => (
        <Text strong style={{ color: '#2c3e50', fontSize: '14px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'product_price',
      key: 'product_price',
      render: (price: number) => (
        <Text strong style={{ color: '#27ae60', fontSize: '15px' }}>
          ${price.toFixed(2)}
        </Text>
      ),
      sorter: (a: Product, b: Product) => a.product_price - b.product_price,
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      render: (category: string) => (
        <Tag 
          color="#3498db" 
          style={{ 
            borderRadius: '16px', 
            padding: '4px 12px',
            fontWeight: '500',
            border: 'none'
          }}
        >
          {category || 'Uncategorized'}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'product_description',
      key: 'product_description',
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ color: '#7f8c8d' }}>
          {text?.substring(0, 50) + (text?.length > 50 ? '...' : '')}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          size="small"
          onClick={() => openEditModal(record)}
          style={{
            borderRadius: '8px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(52, 152, 219, 0.2)',
            border: 'none'
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Expandable row render for product details
  const expandedRowRender = (record: Product) => (
    <div style={{ padding: '16px', backgroundColor: '#fafbfc', borderRadius: '8px' }}>
      <Descriptions 
        bordered 
        size="small"
        style={{ backgroundColor: 'white', borderRadius: '6px' }}
        column={2}
      >
        <Descriptions.Item label="Product ID" span={2}>
          <Text code style={{ backgroundColor: '#ecf0f1', padding: '2px 6px', borderRadius: '4px' }}>
            {record.product_id}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Full Description" span={2}>
          <Text style={{ lineHeight: '1.6' }}>
            {record.product_description || 'No description available'}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Image" span={2}>
          {record.product_image ? (
            <Image
              width={120}
              height={120}
              src={record.product_image}
              fallback="/placeholder.png"
              style={{ 
                objectFit: 'cover', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          ) : (
            <Text type="secondary">No image available</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          <Text style={{ color: '#7f8c8d' }}>
            {new Date(record.created_timestamp).toLocaleDateString()}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Updated">
          <Text style={{ color: '#7f8c8d' }}>
            {new Date(record.updated_timestamp).toLocaleDateString()}
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      padding: '32px', 
      background: '#f8fafc', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: '32px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e8ecef'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={1} style={{ margin: 0, color: '#2c3e50', fontSize: '32px', fontWeight: '700' }}>
                Product Dashboard
              </Title>
              <Space align="center">
                <UserOutlined style={{ color: '#7f8c8d' }} />
                <Text style={{ color: '#7f8c8d', fontSize: '16px' }}>
                  Welcome, {user.email}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size="large"
              style={{
                borderRadius: '12px',
                fontWeight: '600',
                height: '44px',
                paddingLeft: '20px',
                paddingRight: '20px',
                boxShadow: '0 3px 8px rgba(220, 53, 69, 0.3)',
                border: 'none'
              }}
            >
              Logout
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e8ecef',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            className="stat-card"
          >
            <Statistic
              title={<Text style={{ color: '#7f8c8d', fontWeight: '600', fontSize: '14px' }}>Total Products</Text>}
              value={stats.totalProducts}
              prefix={<ShoppingCartOutlined style={{ color: '#27ae60', fontSize: '24px' }} />}
              valueStyle={{ color: '#2c3e50', fontWeight: '700', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e8ecef',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            className="stat-card"
          >
            <Statistic
              title={<Text style={{ color: '#7f8c8d', fontWeight: '600', fontSize: '14px' }}>Average Price</Text>}
              value={stats.averagePrice}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#e74c3c', fontSize: '24px' }} />}
              valueStyle={{ color: '#2c3e50', fontWeight: '700', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e8ecef',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            className="stat-card"
          >
            <Statistic
              title={<Text style={{ color: '#7f8c8d', fontWeight: '600', fontSize: '14px' }}>Categories</Text>}
              value={stats.totalCategories}
              prefix={<AppstoreOutlined style={{ color: '#3498db', fontSize: '24px' }} />}
              valueStyle={{ color: '#2c3e50', fontWeight: '700', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e8ecef',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            className="stat-card"
          >
            <Statistic
              title={<Text style={{ color: '#7f8c8d', fontWeight: '600', fontSize: '14px' }}>Total Value</Text>}
              value={stats.totalValue}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#9b59b6', fontSize: '24px' }} />}
              valueStyle={{ color: '#2c3e50', fontWeight: '700', fontSize: '28px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card 
        style={{ 
          marginBottom: '32px', 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e8ecef',
          padding: '24px'
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14} lg={16}>
            <Input
              placeholder="Search products by title, category, or description..."
              prefix={<SearchOutlined style={{ color: '#7f8c8d' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              style={{ 
                borderRadius: '12px',
                border: '2px solid #ecf0f1',
                fontSize: '16px'
              }}
            />
          </Col>
          <Col xs={24} md={10} lg={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              size="large"
              block
              style={{
                borderRadius: '12px',
                fontWeight: '600',
                height: '48px',
                boxShadow: '0 3px 8px rgba(24, 144, 255, 0.3)',
                border: 'none',
                fontSize: '16px'
              }}
            >
              Add New Product
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e8ecef',
          overflow: 'hidden'
        }}
      >
        <Table
          columns={columns}
          dataSource={products}
          rowKey="product_id"
          loading={loading}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
          }}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total: total,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} products`,
            onChange: (page) => {
              setCurrentPage(page);
              fetchProducts(page, debouncedSearchTerm);
            },
            style: { 
              padding: '16px 24px',
              borderTop: '1px solid #f0f0f0'
            }
          }}
          rowClassName={() => 'product-row'}
          style={{
            backgroundColor: 'white'
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>
            {modalMode === 'create' ? 'Create New Product' : 'Edit Product'}
          </Title>
        }
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText={modalMode === 'create' ? 'Create Product' : 'Update Product'}
        cancelText="Cancel"
        style={{ top: 40 }}
        okButtonProps={{
          style: {
            borderRadius: '8px',
            fontWeight: '600',
            height: '40px',
            paddingLeft: '24px',
            paddingRight: '24px'
          }
        }}
        cancelButtonProps={{
          style: {
            borderRadius: '8px',
            height: '40px',
            paddingLeft: '24px',
            paddingRight: '24px'
          }
        }}
      >
        <Divider style={{ margin: '16px 0 24px 0' }} />
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="product_title"
            label={<Text strong style={{ fontSize: '14px' }}>Product Title</Text>}
            rules={[{ required: true, message: 'Please input product title!' }]}
          >
            <Input 
              placeholder="Enter product title" 
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product_price"
                label={<Text strong style={{ fontSize: '14px' }}>Price</Text>}
                rules={[{ required: true, message: 'Please input product price!' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined) => {
                    if (!value) return 0 as 0;
                    const parsed = parseFloat(value.replace(/\$\s?|(,*)/g, ''));
                    return (parsed || 0) as 0;
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="product_category"
                label={<Text strong style={{ fontSize: '14px' }}>Category</Text>}
              >
                <Input 
                  placeholder="Enter product category" 
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="product_description"
            label={<Text strong style={{ fontSize: '14px' }}>Description</Text>}
          >
            <TextArea
              rows={4}
              placeholder="Enter product description"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="product_image"
            label={<Text strong style={{ fontSize: '14px' }}>Image URL</Text>}
          >
            <Input 
              placeholder="Enter image URL" 
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
        }
        
        .product-row:hover {
          background-color: #f8fafc !important;
        }
        
        .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          border-bottom: 2px solid #e8ecef !important;
          font-weight: 600 !important;
          color: #2c3e50 !important;
          padding: 16px !important;
        }
        
        .ant-table-tbody > tr > td {
          padding: 16px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-pagination-item {
          border-radius: 8px !important;
          border-color: #e8ecef !important;
        }
        
        .ant-pagination-item-active {
          background-color: #1890ff !important;
          border-color: #1890ff !important;
        }
        
        .ant-modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }
        
        .ant-modal-header {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #e8ecef !important;
          padding: 24px 24px 16px 24px !important;
        }
        
        .ant-modal-body {
          padding: 0 24px 24px 24px !important;
        }
        
        .ant-form-item-label > label {
          color: #2c3e50 !important;
        }
      `}</style>
    </div>
  );
}