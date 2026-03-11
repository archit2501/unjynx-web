// ============================================================
// R4 - Deployment Page
// ============================================================

import { useState } from "react";
import {
  Typography,
  Space,
  Row,
  Col,
  Card,
  Table,
  Tag,
  Switch,
  Button,
  Input,
  Select,
  Slider,
  Popconfirm,
  message,
} from "antd";
import {
  CloudServerOutlined,
  RocketOutlined,
  FlagOutlined,
  SettingOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { ServiceCard } from "@/components/charts/ServiceCard";
import type { DeployService, DeployHistory, FeatureFlag, EnvVariable } from "@/types";
import { COLORS } from "@/utils/constants";
import {
  formatTimestamp,
  formatRelativeTime,
  formatDuration,
  getStatusColor,
  maskSecret,
} from "@/utils/formatters";

// --- Mock data ---
const mockServices: DeployService[] = [
  { name: "Backend API", status: "running", version: "v1.3.2", lastDeploy: "2026-03-11T08:00:00Z", environment: "production" },
  { name: "Landing Page", status: "running", version: "v2.1.0", lastDeploy: "2026-03-10T14:00:00Z", environment: "production" },
  { name: "Admin Portal", status: "running", version: "v1.0.5", lastDeploy: "2026-03-09T10:00:00Z", environment: "production" },
  { name: "Queue Workers", status: "running", version: "v1.3.2", lastDeploy: "2026-03-11T08:00:00Z", environment: "production" },
];

const mockDeployHistory: DeployHistory[] = [
  { id: "d1", service: "Backend API", timestamp: "2026-03-11T08:00:00Z", commit: "a1b2c3d", deployer: "CI/CD", status: "success", duration: 142000 },
  { id: "d2", service: "Queue Workers", timestamp: "2026-03-11T08:00:00Z", commit: "a1b2c3d", deployer: "CI/CD", status: "success", duration: 98000 },
  { id: "d3", service: "Landing Page", timestamp: "2026-03-10T14:00:00Z", commit: "e5f6g7h", deployer: "developer@unjynx.com", status: "success", duration: 65000 },
  { id: "d4", service: "Admin Portal", timestamp: "2026-03-09T10:00:00Z", commit: "i8j9k0l", deployer: "CI/CD", status: "success", duration: 82000 },
  { id: "d5", service: "Backend API", timestamp: "2026-03-08T16:00:00Z", commit: "m1n2o3p", deployer: "developer@unjynx.com", status: "rolled_back", duration: 180000 },
  { id: "d6", service: "Backend API", timestamp: "2026-03-07T12:00:00Z", commit: "q4r5s6t", deployer: "CI/CD", status: "success", duration: 135000 },
];

const mockFeatureFlags: FeatureFlag[] = [
  { id: "ff1", name: "ai_chat_enabled", description: "Enable AI chat feature for users", enabled: false, environment: "production", updatedAt: "2026-03-10T10:00:00Z", updatedBy: "admin" },
  { id: "ff2", name: "ghost_mode_v2", description: "Ghost mode with enhanced privacy controls", enabled: true, environment: "production", updatedAt: "2026-03-09T14:00:00Z", updatedBy: "developer" },
  { id: "ff3", name: "telegram_reminders", description: "Send reminders via Telegram", enabled: true, environment: "production", updatedAt: "2026-03-08T09:00:00Z", updatedBy: "admin" },
  { id: "ff4", name: "whatsapp_reminders", description: "Send reminders via WhatsApp/Gupshup", enabled: true, environment: "staging", updatedAt: "2026-03-11T08:00:00Z", updatedBy: "developer" },
  { id: "ff5", name: "energy_flow_engine", description: "ML-based energy prediction engine", enabled: false, environment: "development", updatedAt: "2026-03-05T10:00:00Z", updatedBy: "admin" },
  { id: "ff6", name: "canary_deploy", description: "Enable canary deployment pipeline", enabled: true, environment: "staging", updatedAt: "2026-03-11T07:00:00Z", updatedBy: "devops" },
];

const mockEnvVars: EnvVariable[] = [
  { key: "DATABASE_URL", value: "postgresql://user:pass@db:5432/unjynx", environment: "production", isSecret: true, updatedAt: "2026-02-20T10:00:00Z" },
  { key: "LOGTO_ENDPOINT", value: "https://auth.unjynx.com", environment: "production", isSecret: false, updatedAt: "2026-02-20T10:00:00Z" },
  { key: "LOGTO_APP_SECRET", value: "sk_live_abc123def456ghi789", environment: "production", isSecret: true, updatedAt: "2026-03-01T10:00:00Z" },
  { key: "SENDGRID_API_KEY", value: "SG.xxxxxxxxxxxxxxxxxxxxx", environment: "production", isSecret: true, updatedAt: "2026-03-05T10:00:00Z" },
  { key: "GUPSHUP_API_KEY", value: "gup_xxxxxxxxxxxxxxxxxxxx", environment: "production", isSecret: true, updatedAt: "2026-03-08T10:00:00Z" },
  { key: "OLLAMA_BASE_URL", value: "http://ollama:11434", environment: "production", isSecret: false, updatedAt: "2026-02-25T10:00:00Z" },
  { key: "MINIO_ENDPOINT", value: "http://minio:9000", environment: "production", isSecret: false, updatedAt: "2026-02-20T10:00:00Z" },
  { key: "NODE_ENV", value: "production", environment: "production", isSecret: false, updatedAt: "2026-02-15T10:00:00Z" },
];

export const DeploymentPage: React.FC = () => {
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [canaryPercent, setCanaryPercent] = useState(10);
  const [envFilter, setEnvFilter] = useState<string>("all");

  const toggleSecret = (key: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredFlags =
    envFilter === "all"
      ? mockFeatureFlags
      : mockFeatureFlags.filter((f) => f.environment === envFilter);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0, color: COLORS.white }}>
        Deployment
      </Typography.Title>

      {/* Service Status Cards */}
      <Row gutter={[16, 16]}>
        {mockServices.map((svc) => (
          <Col key={svc.name} xs={24} sm={12} lg={6}>
            <ServiceCard
              title={svc.name}
              status={svc.status === "running" ? "healthy" : svc.status === "error" ? "down" : "degraded"}
              lastCheck={svc.lastDeploy}
              icon={<CloudServerOutlined style={{ color: COLORS.violet }} />}
              metrics={[
                { label: "Version", value: svc.version },
                { label: "Environment", value: svc.environment },
                { label: "Last Deploy", value: formatRelativeTime(svc.lastDeploy) },
              ]}
            />
          </Col>
        ))}
      </Row>

      {/* Deploy History */}
      <Card
        title={
          <Space>
            <RocketOutlined style={{ color: COLORS.gold }} />
            <span style={{ color: COLORS.white }}>Deploy History</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Table
          dataSource={mockDeployHistory}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "Service",
              dataIndex: "service",
              render: (v: string) => <Tag>{v}</Tag>,
              width: 140,
            },
            {
              title: "Timestamp",
              dataIndex: "timestamp",
              render: (v: string) => formatTimestamp(v),
              width: 180,
            },
            {
              title: "Commit",
              dataIndex: "commit",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
              width: 100,
            },
            {
              title: "Deployer",
              dataIndex: "deployer",
              render: (v: string) => <Typography.Text>{v}</Typography.Text>,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (v: string) => (
                <Tag color={getStatusColor(v)}>{v.replace("_", " ")}</Tag>
              ),
              width: 120,
            },
            {
              title: "Duration",
              dataIndex: "duration",
              render: (v: number) => formatDuration(v),
              width: 100,
            },
          ]}
        />
      </Card>

      {/* Feature Flags */}
      <Card
        title={
          <Space>
            <FlagOutlined style={{ color: COLORS.violet }} />
            <span style={{ color: COLORS.white }}>Feature Flags</span>
          </Space>
        }
        extra={
          <Select
            value={envFilter}
            onChange={setEnvFilter}
            size="small"
            style={{ width: 140 }}
            options={[
              { value: "all", label: "All Environments" },
              { value: "production", label: "Production" },
              { value: "staging", label: "Staging" },
              { value: "development", label: "Development" },
            ]}
          />
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Table
          dataSource={filteredFlags}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "Flag",
              dataIndex: "name",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            { title: "Description", dataIndex: "description" },
            {
              title: "Environment",
              dataIndex: "environment",
              render: (v: string) => (
                <Tag color={v === "production" ? "red" : v === "staging" ? "orange" : "blue"}>
                  {v}
                </Tag>
              ),
              width: 120,
            },
            {
              title: "Enabled",
              dataIndex: "enabled",
              render: (v: boolean, record: FeatureFlag) => (
                <Switch
                  checked={v}
                  size="small"
                  onChange={() => message.info(`Flag ${record.name} toggled`)}
                />
              ),
              width: 80,
            },
            {
              title: "Updated",
              dataIndex: "updatedAt",
              render: (v: string) => formatRelativeTime(v),
              width: 120,
            },
            {
              title: "By",
              dataIndex: "updatedBy",
              width: 100,
            },
          ]}
        />
      </Card>

      {/* Environment Variables */}
      <Card
        title={
          <Space>
            <SettingOutlined style={{ color: COLORS.gold }} />
            <span style={{ color: COLORS.white }}>Environment Variables</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Table
          dataSource={mockEnvVars}
          rowKey="key"
          pagination={false}
          columns={[
            {
              title: "Key",
              dataIndex: "key",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            {
              title: "Value",
              key: "value",
              render: (_: unknown, record: EnvVariable) => (
                <Space>
                  <Typography.Text
                    code
                    style={{ fontSize: 12, maxWidth: 300, display: "block" }}
                    ellipsis
                  >
                    {record.isSecret && !revealedSecrets.has(record.key)
                      ? maskSecret(record.value)
                      : record.value}
                  </Typography.Text>
                  {record.isSecret && (
                    <Button
                      type="text"
                      size="small"
                      icon={
                        revealedSecrets.has(record.key) ? (
                          <EyeInvisibleOutlined />
                        ) : (
                          <EyeOutlined />
                        )
                      }
                      onClick={() => toggleSecret(record.key)}
                    />
                  )}
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(record.value);
                      message.success("Copied");
                    }}
                  />
                </Space>
              ),
            },
            {
              title: "Secret",
              dataIndex: "isSecret",
              render: (v: boolean) =>
                v ? <Tag color="red">SECRET</Tag> : <Tag>PUBLIC</Tag>,
              width: 90,
            },
            {
              title: "Updated",
              dataIndex: "updatedAt",
              render: (v: string) => formatRelativeTime(v),
              width: 120,
            },
          ]}
        />
      </Card>

      {/* Canary Deployment Controls */}
      <Card
        title={
          <Space>
            <RocketOutlined style={{ color: COLORS.healthy }} />
            <span style={{ color: COLORS.white }}>Canary Deployment</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={8}>
            <Typography.Text style={{ color: "#9CA3AF" }}>
              Canary Traffic Percentage
            </Typography.Text>
            <Slider
              value={canaryPercent}
              onChange={setCanaryPercent}
              min={0}
              max={100}
              step={5}
              marks={{ 0: "0%", 25: "25%", 50: "50%", 75: "75%", 100: "100%" }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical">
              <Input
                placeholder="Target version (e.g., v1.4.0)"
                size="small"
                style={{ width: 200 }}
              />
              <Input
                placeholder="Commit SHA"
                size="small"
                style={{ width: 200 }}
              />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Popconfirm
                title={`Deploy canary at ${canaryPercent}%?`}
                onConfirm={() => message.success("Canary deployment started")}
              >
                <Button type="primary" icon={<RocketOutlined />}>
                  Start Canary
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Promote canary to 100%?"
                onConfirm={() => {
                  setCanaryPercent(100);
                  message.success("Canary promoted to production");
                }}
              >
                <Button>Promote</Button>
              </Popconfirm>
              <Popconfirm
                title="Rollback canary deployment?"
                onConfirm={() => {
                  setCanaryPercent(0);
                  message.warning("Canary rolled back");
                }}
              >
                <Button danger>Rollback</Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};
