// src/app/products/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Input, Modal, Form, InputNumber, Typography,
  Card, Row, Col, Statistic, message, Descriptions, Tag, Image
} from 'antd';
import {
  PlusOutlined, SearchOutlined, LogoutOutlined, EditOutlined,
  ShoppingCartOutlined, DollarOutlined, AppstoreOutlined
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
  const { user, logout, getToken } = useAuth();
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

  // Set auth token when component mounts
  useEffect(() => {
    const initAuth = async () => {
      const token = await getToken();
      ApiService.setAuthToken(token);
    };
    initAuth();
  }, [getToken]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, search = '') => {
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
        setCurrentPage(page);
      } else {
        message.error('Failed to fetch products');
      }
    } catch (error: any) {
      message.error('Error fetching products: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Initial fetch and search effect
  useEffect(() => {
    fetchProducts(1, debouncedSearchTerm);
    if (debouncedSearchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, fetchProducts]);

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
      
      if (modalMode === 'create') {
        const response = await ApiService.createProduct(values as CreateProductData);
        if (response.is_success) {
          message.success('Product created successfully!');
          fetchProducts(currentPage, debouncedSearchTerm);
        }
      } else if (modalMode === 'edit' && selectedProduct) {
        const response = await ApiService.updateProduct(
          selectedProduct.product_id,
          values as UpdateProductData
        );
        if (response.is_success) {
          message.success('Product updated successfully!');
          fetchProducts(currentPage, debouncedSearchTerm);
        }
      }
      
      setModalVisible(false);
    } catch (error: any) {
      message.error('Error: ' + error.message);
    }
  };

  // Table columns with expandable row details
  const columns = [
    {
      title: 'Product Title',
      dataIndex: 'product_title',
      key: 'product_title',
      ellipsis: true,
    },
    {
      title: 'Price',
      dataIndex: 'product_price',
      key: 'product_price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.product_price - b.product_price,
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      render: (category: string) => (
        <Tag color="blue">{category || 'Uncategorized'}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'product_description',
      key: 'product_description',
      ellipsis: true,
      render: (text: string) => text?.substring(0, 50) + (text?.length > 50 ? '...' : ''),
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
        >
          Edit
        </Button>
      ),
    },
  ];

  // Expandable row render for product details
  const expandedRowRender = (record: Product) => (
    <Descriptions bordered size="small">
      <Descriptions.Item label="Product ID" span={3}>
        {record.product_id}
      </Descriptions.Item>
      <Descriptions.Item label="Full Description" span={3}>
        {record.product_description || 'No description available'}
      </Descriptions.Item>
      <Descriptions.Item label="Image" span={3}>
        {record.product_image ? (
          <Image
            width={100}
            height={100}
            src={record.product_image}
            fallback="/placeholder.png"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Text type="secondary">No image available</Text>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Created">
        {new Date(record.created_timestamp).toLocaleDateString()}
      </Descriptions.Item>
      <Descriptions.Item label="Updated">
        {new Date(record.updated_timestamp).toLocaleDateString()}
      </Descriptions.Item>
      <Descriptions.Item label="Price">
        <Text strong>${record.product_price.toFixed(2)}</Text>
      </Descriptions.Item>
    </Descriptions>
  );

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Product Dashboard</Title>
            <Text type="secondary">Welcome, {user.email}</Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Price"
              value={stats.averagePrice}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Categories"
              value={stats.totalCategories}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={stats.totalValue}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col span={12}>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Add Product
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
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
              `${range[0]}-${range[1]} of ${total} products`,
            onChange: (page) => {
              setCurrentPage(page);
              fetchProducts(page, debouncedSearchTerm);
            },
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={modalMode === 'create' ? 'Create Product' : 'Edit Product'}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            name="product_title"
            label="Product Title"
            rules={[{ required: true, message: 'Please input product title!' }]}
          >
            <Input placeholder="Enter product title" />
          </Form.Item>

          <Form.Item
            name="product_price"
            label="Price"
            rules={[{ required: true, message: 'Please input product price!' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Enter price"
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: string | undefined) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0') || 0}
            />
          </Form.Item>

          <Form.Item
            name="product_description"
            label="Description"
          >
            <TextArea
              rows={4}
              placeholder="Enter product description"
            />
          </Form.Item>

          <Form.Item
            name="product_category"
            label="Category"
          >
            <Input placeholder="Enter product category" />
          </Form.Item>

          <Form.Item
            name="product_image"
            label="Image URL"
          >
            <Input placeholder="Enter image URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}