// ============================================================
// R3 - API Management Page
// ============================================================

import { useState } from "react";
import {
  Typography,
  Space,
  Tabs,
  Table,
  Tag,
  Button,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Popconfirm,
  message,
  InputNumber,
} from "antd";
import {
  ApiOutlined,
  KeyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  BarChartOutlined,
  PlusOutlined,
  DeleteOutlined,
  SyncOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { MetricPanel } from "@/components/charts/MetricPanel";
import type { ApiKey, RateLimitConfig, WebhookConfig, EndpointUsage } from "@/types";
import { COLORS } from "@/utils/constants";
import {
  formatTimestamp,
  formatRelativeTime,
  formatNumber,
  formatPercent,
  getStatusColor,
  formatDuration,
} from "@/utils/formatters";

// --- Mock data ---
const mockApiKeys: ApiKey[] = [
  { id: "k1", name: "Mobile App (Production)", keyPrefix: "unjx_live_", createdAt: "2026-02-20T10:00:00Z", expiresAt: "2027-02-20T10:00:00Z", lastUsed: "2026-03-11T08:30:00Z", status: "active", scopes: ["tasks:read", "tasks:write", "projects:read"] },
  { id: "k2", name: "Landing Page", keyPrefix: "unjx_pub_", createdAt: "2026-03-01T14:00:00Z", expiresAt: null, lastUsed: "2026-03-11T09:00:00Z", status: "active", scopes: ["content:read"] },
  { id: "k3", name: "CI/CD Pipeline", keyPrefix: "unjx_ci_", createdAt: "2026-02-15T09:00:00Z", expiresAt: "2026-06-15T09:00:00Z", lastUsed: "2026-03-10T22:00:00Z", status: "active", scopes: ["deploy:write", "health:read"] },
  { id: "k4", name: "Old Test Key", keyPrefix: "unjx_test_", createdAt: "2026-01-10T09:00:00Z", expiresAt: "2026-02-10T09:00:00Z", lastUsed: "2026-02-08T12:00:00Z", status: "expired", scopes: ["tasks:read"] },
];

const mockRateLimits: RateLimitConfig[] = [
  { endpoint: "/api/v1/tasks", method: "GET", windowMs: 60000, maxRequests: 100, currentUsage: 42 },
  { endpoint: "/api/v1/tasks", method: "POST", windowMs: 60000, maxRequests: 30, currentUsage: 8 },
  { endpoint: "/api/v1/auth/login", method: "POST", windowMs: 900000, maxRequests: 5, currentUsage: 1 },
  { endpoint: "/api/v1/auth/forgot-password", method: "POST", windowMs: 3600000, maxRequests: 3, currentUsage: 0 },
  { endpoint: "/api/v1/notifications/send", method: "POST", windowMs: 60000, maxRequests: 10, currentUsage: 3 },
  { endpoint: "/api/v1/content", method: "GET", windowMs: 60000, maxRequests: 200, currentUsage: 87 },
];

const mockWebhooks: WebhookConfig[] = [
  { id: "w1", url: "https://hooks.slack.com/triggers/unjynx/alerts", events: ["system.alert", "deploy.complete"], status: "active", lastDelivery: "2026-03-11T08:00:00Z", successRate: 99.2 },
  { id: "w2", url: "https://api.telegram.org/bot/webhook/unjynx", events: ["notification.callback"], status: "active", lastDelivery: "2026-03-11T09:15:00Z", successRate: 98.5 },
  { id: "w3", url: "https://partner-api.example.com/events", events: ["user.signup", "subscription.created"], status: "failing", lastDelivery: "2026-03-10T14:00:00Z", successRate: 45.0 },
];

const mockEndpointUsage: EndpointUsage[] = [
  { endpoint: "/api/v1/tasks", method: "GET", totalRequests: 142000, avgResponseTime: 23, errorRate: 0.1, history: Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, "0")}:00`, count: Math.floor(3000 + Math.random() * 4000) })) },
  { endpoint: "/api/v1/tasks", method: "POST", totalRequests: 28400, avgResponseTime: 45, errorRate: 0.3, history: Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, "0")}:00`, count: Math.floor(800 + Math.random() * 600) })) },
  { endpoint: "/api/v1/projects", method: "GET", totalRequests: 85000, avgResponseTime: 18, errorRate: 0.05, history: Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, "0")}:00`, count: Math.floor(2000 + Math.random() * 2500) })) },
  { endpoint: "/api/v1/content", method: "GET", totalRequests: 210000, avgResponseTime: 12, errorRate: 0.02, history: Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, "0")}:00`, count: Math.floor(5000 + Math.random() * 6000) })) },
  { endpoint: "/api/v1/auth/login", method: "POST", totalRequests: 12400, avgResponseTime: 180, errorRate: 2.1, history: Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, "0")}:00`, count: Math.floor(300 + Math.random() * 400) })) },
];

export const ApiManagementPage: React.FC = () => {
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateKey = () => {
    form.validateFields().then(() => {
      message.success("API key created successfully");
      setIsCreateKeyModalOpen(false);
      form.resetFields();
    });
  };

  const handleRevokeKey = (id: string) => {
    message.success(`API key ${id} revoked`);
  };

  const handleRotateKey = (id: string) => {
    message.success(`API key ${id} rotated. New key generated.`);
  };

  const tabItems = [
    {
      key: "docs",
      label: (
        <span>
          <ApiOutlined /> API Docs
        </span>
      ),
      children: (
        <Card
          style={{ background: "#1A1528", border: "1px solid #2D2640" }}
          styles={{ body: { padding: 0, height: 600 } }}
        >
          <iframe
            src="/api/v1/docs"
            width="100%"
            height="100%"
            frameBorder="0"
            title="API Documentation"
            style={{ border: "none", borderRadius: 8 }}
            sandbox="allow-scripts allow-same-origin"
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            <ApiOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Typography.Text style={{ color: "#6B7280", display: "block" }}>
              OpenAPI/Swagger documentation will be embedded here.
            </Typography.Text>
            <Typography.Text style={{ color: "#9CA3AF", fontSize: 12 }}>
              Configure your backend to serve Swagger UI at /api/v1/docs
            </Typography.Text>
          </div>
        </Card>
      ),
    },
    {
      key: "api-keys",
      label: (
        <span>
          <KeyOutlined /> API Keys
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateKeyModalOpen(true)}
            >
              Create API Key
            </Button>
          </div>
          <Table
            dataSource={mockApiKeys}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Name",
                dataIndex: "name",
                render: (v: string) => (
                  <Typography.Text strong>{v}</Typography.Text>
                ),
              },
              {
                title: "Key Prefix",
                dataIndex: "keyPrefix",
                render: (v: string) => (
                  <Typography.Text code style={{ fontSize: 12 }}>
                    {v}••••••••
                  </Typography.Text>
                ),
              },
              {
                title: "Scopes",
                dataIndex: "scopes",
                render: (scopes: string[]) =>
                  scopes.map((s) => (
                    <Tag key={s} style={{ fontSize: 11 }}>
                      {s}
                    </Tag>
                  )),
              },
              {
                title: "Created",
                dataIndex: "createdAt",
                render: (v: string) => formatTimestamp(v),
                width: 160,
              },
              {
                title: "Expires",
                dataIndex: "expiresAt",
                render: (v: string | null) =>
                  v ? formatTimestamp(v) : <Tag>Never</Tag>,
                width: 160,
              },
              {
                title: "Last Used",
                dataIndex: "lastUsed",
                render: (v: string | null) =>
                  v ? formatRelativeTime(v) : "-",
                width: 130,
              },
              {
                title: "Status",
                dataIndex: "status",
                render: (v: string) => (
                  <Tag color={getStatusColor(v)}>{v}</Tag>
                ),
                width: 90,
              },
              {
                title: "Actions",
                key: "actions",
                width: 160,
                render: (_: unknown, record: ApiKey) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<SyncOutlined />}
                      onClick={() => handleRotateKey(record.id)}
                      disabled={record.status !== "active"}
                    >
                      Rotate
                    </Button>
                    <Popconfirm
                      title="Revoke this API key?"
                      onConfirm={() => handleRevokeKey(record.id)}
                    >
                      <Button
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        disabled={record.status !== "active"}
                      />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Space>
      ),
    },
    {
      key: "rate-limits",
      label: (
        <span>
          <ThunderboltOutlined /> Rate Limits
        </span>
      ),
      children: (
        <Table
          dataSource={mockRateLimits}
          rowKey={(r) => `${r.method}-${r.endpoint}`}
          pagination={false}
          columns={[
            {
              title: "Endpoint",
              dataIndex: "endpoint",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            {
              title: "Method",
              dataIndex: "method",
              render: (v: string) => (
                <Tag color={v === "GET" ? "blue" : v === "POST" ? "green" : "orange"}>
                  {v}
                </Tag>
              ),
              width: 80,
            },
            {
              title: "Window",
              dataIndex: "windowMs",
              render: (v: number) => formatDuration(v),
              width: 100,
            },
            {
              title: "Max Requests",
              dataIndex: "maxRequests",
              width: 120,
              render: (_: number, record: RateLimitConfig) => (
                <InputNumber
                  value={record.maxRequests}
                  min={1}
                  size="small"
                  style={{ width: 80 }}
                  onChange={() => message.info("Rate limit updated")}
                />
              ),
            },
            {
              title: "Current Usage",
              key: "usage",
              width: 200,
              render: (_: unknown, record: RateLimitConfig) => {
                const pct = (record.currentUsage / record.maxRequests) * 100;
                return (
                  <Space>
                    <Typography.Text>
                      {record.currentUsage}/{record.maxRequests}
                    </Typography.Text>
                    <Tag
                      color={pct > 80 ? "error" : pct > 50 ? "warning" : "success"}
                    >
                      {formatPercent(pct, 0)}
                    </Tag>
                  </Space>
                );
              },
            },
          ]}
        />
      ),
    },
    {
      key: "webhooks",
      label: (
        <span>
          <GlobalOutlined /> Webhooks
        </span>
      ),
      children: (
        <Table
          dataSource={mockWebhooks}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "URL",
              dataIndex: "url",
              render: (v: string) => (
                <Space>
                  <Typography.Text code ellipsis style={{ maxWidth: 300, fontSize: 12, display: "block" }}>
                    {v}
                  </Typography.Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(v);
                      message.success("URL copied");
                    }}
                  />
                </Space>
              ),
            },
            {
              title: "Events",
              dataIndex: "events",
              render: (events: string[]) =>
                events.map((e) => (
                  <Tag key={e} style={{ fontSize: 11 }}>
                    {e}
                  </Tag>
                )),
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (v: string) => (
                <Tag color={getStatusColor(v)}>{v}</Tag>
              ),
              width: 90,
            },
            {
              title: "Success Rate",
              dataIndex: "successRate",
              render: (v: number) => (
                <Tag color={v > 95 ? "success" : v > 80 ? "warning" : "error"}>
                  {formatPercent(v)}
                </Tag>
              ),
              width: 110,
            },
            {
              title: "Last Delivery",
              dataIndex: "lastDelivery",
              render: (v: string | null) =>
                v ? formatRelativeTime(v) : "-",
              width: 140,
            },
          ]}
        />
      ),
    },
    {
      key: "usage",
      label: (
        <span>
          <BarChartOutlined /> Usage Analytics
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Total Requests (24h)"
                value={formatNumber(mockEndpointUsage.reduce((s, e) => s + e.totalRequests, 0))}
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Avg Response Time"
                value={Math.round(mockEndpointUsage.reduce((s, e) => s + e.avgResponseTime, 0) / mockEndpointUsage.length)}
                suffix="ms"
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Avg Error Rate"
                value={(mockEndpointUsage.reduce((s, e) => s + e.errorRate, 0) / mockEndpointUsage.length).toFixed(2)}
                suffix="%"
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel title="Endpoints" value={mockEndpointUsage.length} />
            </Col>
          </Row>

          <TimeSeriesChart
            title="Requests Per Endpoint (24h)"
            data={mockEndpointUsage[0].history as unknown as Record<string, unknown>[]}
            series={[{ dataKey: "count", name: "GET /api/v1/tasks" }]}
            height={250}
          />

          <Table
            dataSource={mockEndpointUsage}
            rowKey={(r) => `${r.method}-${r.endpoint}`}
            pagination={false}
            columns={[
              {
                title: "Endpoint",
                dataIndex: "endpoint",
                render: (v: string) => (
                  <Typography.Text code style={{ fontSize: 12 }}>
                    {v}
                  </Typography.Text>
                ),
              },
              {
                title: "Method",
                dataIndex: "method",
                render: (v: string) => (
                  <Tag color={v === "GET" ? "blue" : "green"}>{v}</Tag>
                ),
                width: 80,
              },
              {
                title: "Requests",
                dataIndex: "totalRequests",
                render: (v: number) => formatNumber(v),
                sorter: (a: EndpointUsage, b: EndpointUsage) =>
                  a.totalRequests - b.totalRequests,
                width: 110,
              },
              {
                title: "Avg Response",
                dataIndex: "avgResponseTime",
                render: (v: number) => `${v}ms`,
                sorter: (a: EndpointUsage, b: EndpointUsage) =>
                  a.avgResponseTime - b.avgResponseTime,
                width: 120,
              },
              {
                title: "Error Rate",
                dataIndex: "errorRate",
                render: (v: number) => (
                  <Tag color={v > 1 ? "error" : v > 0.5 ? "warning" : "success"}>
                    {formatPercent(v)}
                  </Tag>
                ),
                width: 100,
              },
            ]}
          />
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0, color: COLORS.white }}>
        API Management
      </Typography.Title>

      <Card
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          defaultActiveKey="api-keys"
          items={tabItems}
          tabBarStyle={{
            padding: "0 16px",
            borderBottom: "1px solid #2D2640",
          }}
          style={{ padding: "0 16px 16px" }}
        />
      </Card>

      {/* Create API Key Modal */}
      <Modal
        title="Create API Key"
        open={isCreateKeyModalOpen}
        onOk={handleCreateKey}
        onCancel={() => setIsCreateKeyModalOpen(false)}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Key Name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="e.g. Mobile App Production" />
          </Form.Item>
          <Form.Item
            name="scopes"
            label="Scopes"
            rules={[{ required: true, message: "Select at least one scope" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select scopes"
              options={[
                { value: "tasks:read", label: "tasks:read" },
                { value: "tasks:write", label: "tasks:write" },
                { value: "projects:read", label: "projects:read" },
                { value: "projects:write", label: "projects:write" },
                { value: "content:read", label: "content:read" },
                { value: "notifications:write", label: "notifications:write" },
                { value: "deploy:write", label: "deploy:write" },
                { value: "health:read", label: "health:read" },
              ]}
            />
          </Form.Item>
          <Form.Item name="expiresIn" label="Expires In">
            <Select
              placeholder="Select expiration"
              options={[
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
                { value: "1y", label: "1 year" },
                { value: "never", label: "Never" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
