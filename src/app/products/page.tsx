// src/app/products/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  InputNumber,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Popconfirm,
  Tag,
  Descriptions,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ApiService } from '../../lib/api';
import { Product, CreateProductData, UpdateProductData } from '../../types';
import { ColumnsType } from 'antd/es/table';

const { Search } = Input;
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
  const { user, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Statistics (calculated from current products data)
  const stats = React.useMemo(() => {
    if (!products.length) return { totalProducts: 0, averagePrice: 0, totalValue: 0, categories: 0 };
    
    const totalProducts = total;
    const averagePrice = products.reduce((sum, p) => sum + p.product_price, 0) / products.length;
    const totalValue = products.reduce((sum, p) => sum + p.product_price, 0);
    const categories = new Set(products.map(p => p.product_category).filter(Boolean)).size;

    return { totalProducts, averagePrice, totalValue, categories };
  }, [products, total]);

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
        limit: pageSize,
        ...(search && { search })
      });

      if (response.is_success) {
        setProducts(response.data);
        setTotal(response.pagination?.total || 0);
        setTotalPages(response.pagination?.total_pages || 1);
        setCurrentPage(page);
      } else {
        message.error('Failed to fetch products');
      }
    } catch (error: any) {
      message.error('Error fetching products: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Initial load and search effect
  useEffect(() => {
    if (user) {
      fetchProducts(1, debouncedSearchTerm);
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, fetchProducts, user]);

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
  const showCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    form.setFieldsValue(product);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    form.resetFields();
  };

  // Handle form submission
  const handleFormSubmit = async (values: CreateProductData | UpdateProductData) => {
    try {
      if (modalMode === 'create') {
        await ApiService.createProduct(values as CreateProductData);
        message.success('Product created successfully!');
      } else if (modalMode === 'edit' && selectedProduct) {
        await ApiService.updateProduct(selectedProduct.product_id, values as UpdateProductData);
        message.success('Product updated successfully!');
      }

      setModalVisible(false);
      form.resetFields();
      fetchProducts(currentPage, debouncedSearchTerm);
    } catch (error: any) {
      message.error('Error: ' + error.message);
    }
  };

  // Expandable row render
  const expandedRowRender = (record: Product) => (
    <Descriptions title="Product Details" bordered column={2} size="small">
      <Descriptions.Item label="Product ID" span={2}>
        <Text code>{record.product_id}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Title">
        {record.product_title}
      </Descriptions.Item>
      <Descriptions.Item label="Price">
        <Text strong>${record.product_price.toFixed(2)}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Category">
        <Tag color="blue">{record.product_category || 'Uncategorized'}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Created">
        {new Date(record.created_timestamp).toLocaleDateString()}
      </Descriptions.Item>
      <Descriptions.Item label="Description" span={2}>
        {record.product_description || 'No description available'}
      </Descriptions.Item>
      {record.product_image && (
        <Descriptions.Item label="Image" span={2}>
          <Image
            width={200}
            src={record.product_image}
            alt={record.product_title}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Pu3BUG8A2yRCdSFBSNyKmd4Bxb5RRJlXeyilDiHXANINFIUaHk5ItEhb/APPA5P3sj3s/zf3+7fveRK..."
          />
        </Descriptions.Item>
      )}
    </Descriptions>
  );

  // Table columns
  const columns: ColumnsType<Product> = [
    {
      title: 'Product Title',
      dataIndex: 'product_title',
      key: 'product_title',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Price',
      dataIndex: 'product_price',
      key: 'product_price',
      width: '15%',
      render: (price: number) => <Text strong>${price.toFixed(2)}</Text>,
      sorter: (a, b) => a.product_price - b.product_price,
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      width: '20%',
      render: (category: string) => (
        <Tag color="blue">{category || 'Uncategorized'}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'product_description',
      key: 'product_description',
      width: '25%',
      ellipsis: true,
      render: (text: string) => text || 'No description',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            title="Edit Product"
          />
        </Space>
      ),
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Title level={2} className="mb-0">
                Product Dashboard
              </Title>
              <Text type="secondary">Welcome, {user?.email}</Text>
            </div>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={stats.totalProducts}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
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
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Value"
                value={stats.totalValue}
                precision={2}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Categories"
                value={stats.categories}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Search
              placeholder="Search products..."
              enterButton={<SearchOutlined />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: 400 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={showCreateModal}
            >
              Add Product
            </Button>
          </div>
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
              pageSize: pageSize,
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
            scroll={{ x: 800 }}
          />
        </Card>
      </div>

      {/* Product Modal */}
      <Modal
        title={modalMode === 'create' ? 'Create Product' : 'Edit Product'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          size="large"
        >
          <Form.Item
            name="product_title"
            label="Product Title"
            rules={[
              { required: true, message: 'Please input the product title!' },
            ]}
          >
            <Input placeholder="Enter product title" />
          </Form.Item>

          <Form.Item
            name="product_price"
            label="Price"
            rules={[
              { required: true, message: 'Please input the price!' },
              { type: 'number', min: 0, message: 'Price must be positive!' },
            ]}
          >
            <InputNumber
              placeholder="Enter price"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              addonBefore="$"
            />
          </Form.Item>

          <Form.Item name="product_description" label="Description">
            <TextArea
              placeholder="Enter product description"
              rows={4}
            />
          </Form.Item>

          <Form.Item name="product_category" label="Category">
            <Input placeholder="Enter product category" />
          </Form.Item>

          <Form.Item
            name="product_image"
            label="Image URL"
            rules={[{ type: 'url', message: 'Please enter a valid URL!' }]}
          >
            <Input placeholder="Enter image URL" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={handleModalCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {modalMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}