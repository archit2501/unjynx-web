// ============================================================
// R6 - AI Model Management Page
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
  Button,
  Tabs,
  InputNumber,
  Slider,
  Modal,
  Descriptions,
  message,
} from "antd";
import {
  RobotOutlined,
  ExperimentOutlined,
  DollarOutlined,
  HistoryOutlined,
  RollbackOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { MetricPanel } from "@/components/charts/MetricPanel";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { CodeBlock } from "@/components/common/CodeBlock";
import type { AiModelConfig, PromptVersion, ModelCost, ModelQuality, AbTestConfig } from "@/types";
import { COLORS } from "@/utils/constants";
import {
  formatTimestamp,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDuration,
  getStatusColor,
} from "@/utils/formatters";

// --- Mock data ---
const mockModels: AiModelConfig[] = [
  { id: "m1", provider: "Anthropic", modelId: "claude-haiku-4-5", maxTokens: 4096, temperature: 0.3, purpose: "Task analysis & smart scheduling (80% of requests)", status: "active" },
  { id: "m2", provider: "Anthropic", modelId: "claude-sonnet-4-6", maxTokens: 8192, temperature: 0.5, purpose: "Complex reasoning & insights (15% of requests)", status: "active" },
  { id: "m3", provider: "Anthropic", modelId: "claude-opus-4-6", maxTokens: 16384, temperature: 0.7, purpose: "Deep analysis & research (5% of requests)", status: "active" },
  { id: "m4", provider: "Ollama (Local)", modelId: "llama3.2:3b", maxTokens: 2048, temperature: 0.4, purpose: "On-device fallback & offline mode", status: "active" },
  { id: "m5", provider: "Ollama (Local)", modelId: "nomic-embed-text", maxTokens: 512, temperature: 0, purpose: "Text embeddings for semantic search", status: "testing" },
];

const mockPromptVersions: PromptVersion[] = [
  { id: "p1", promptName: "task_scheduler", version: 5, content: "You are UNJYNX's AI scheduling assistant. Analyze the user's task list and suggest optimal scheduling based on:\n1. Priority (p0-p3)\n2. Due date proximity\n3. Energy levels (from user's historical patterns)\n4. Time blocking preferences\n\nRespond in JSON format with scheduled_times array.", createdAt: "2026-03-10T10:00:00Z", createdBy: "developer", status: "active" },
  { id: "p2", promptName: "task_scheduler", version: 4, content: "You are a scheduling assistant for UNJYNX app. Given a list of tasks, suggest optimal times...", createdAt: "2026-03-08T14:00:00Z", createdBy: "developer", status: "archived" },
  { id: "p3", promptName: "task_scheduler", version: 3, content: "Schedule the following tasks based on priority and due date...", createdAt: "2026-03-05T10:00:00Z", createdBy: "developer", status: "archived" },
  { id: "p4", promptName: "daily_insight", version: 2, content: "Analyze the user's productivity data for the past week and generate a brief insight (max 3 sentences) about their patterns. Include one actionable suggestion.", createdAt: "2026-03-09T10:00:00Z", createdBy: "developer", status: "active" },
  { id: "p5", promptName: "content_categorizer", version: 1, content: "Categorize the following content item into one of the 60+ UNJYNX categories. Return the category name and confidence score.", createdAt: "2026-03-07T10:00:00Z", createdBy: "developer", status: "active" },
];

const mockModelCosts: ModelCost[] = [
  { modelId: "claude-haiku-4-5", provider: "Anthropic", tokensUsed: 2_400_000, totalCost: 2.40, avgCostPerRequest: 0.0001, period: "24h" },
  { modelId: "claude-sonnet-4-6", provider: "Anthropic", tokensUsed: 480_000, totalCost: 1.44, avgCostPerRequest: 0.0008, period: "24h" },
  { modelId: "claude-opus-4-6", provider: "Anthropic", tokensUsed: 120_000, totalCost: 1.80, avgCostPerRequest: 0.006, period: "24h" },
  { modelId: "llama3.2:3b", provider: "Ollama", tokensUsed: 800_000, totalCost: 0, avgCostPerRequest: 0, period: "24h" },
];

const mockModelQuality: ModelQuality[] = [
  { modelId: "claude-haiku-4-5", successRate: 99.2, avgResponseTime: 340, errorRate: 0.8, totalRequests: 24000 },
  { modelId: "claude-sonnet-4-6", successRate: 98.5, avgResponseTime: 1200, errorRate: 1.5, totalRequests: 1800 },
  { modelId: "claude-opus-4-6", successRate: 97.8, avgResponseTime: 3400, errorRate: 2.2, totalRequests: 300 },
  { modelId: "llama3.2:3b", successRate: 96.1, avgResponseTime: 1800, errorRate: 3.9, totalRequests: 8000 },
];

const mockAbTests: AbTestConfig[] = [
  { id: "ab1", name: "Scheduler Prompt v4 vs v5", promptA: "task_scheduler v4", promptB: "task_scheduler v5", trafficSplit: 50, status: "running", winner: null, startDate: "2026-03-09T10:00:00Z" },
  { id: "ab2", name: "Insight Tone: Professional vs Friendly", promptA: "daily_insight_formal", promptB: "daily_insight_friendly", trafficSplit: 50, status: "completed", winner: "B", startDate: "2026-03-01T10:00:00Z" },
];

const costHistory = Array.from({ length: 14 }, (_, i) => ({
  time: `Mar ${i + 1}`,
  haiku: 1.8 + Math.random() * 1.2,
  sonnet: 1.0 + Math.random() * 0.8,
  opus: 1.2 + Math.random() * 1.0,
}));

export const AiModelPage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptVersion | null>(null);

  const totalDailyCost = mockModelCosts.reduce((s, c) => s + c.totalCost, 0);
  const totalRequests = mockModelQuality.reduce((s, q) => s + q.totalRequests, 0);

  const tabItems = [
    {
      key: "models",
      label: (
        <span>
          <RobotOutlined /> Model Configuration
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Table
            dataSource={mockModels}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Provider",
                dataIndex: "provider",
                render: (v: string) => (
                  <Tag color={v.includes("Anthropic") ? "purple" : "blue"}>{v}</Tag>
                ),
                width: 130,
              },
              {
                title: "Model ID",
                dataIndex: "modelId",
                render: (v: string) => (
                  <Typography.Text code style={{ fontSize: 12 }}>
                    {v}
                  </Typography.Text>
                ),
              },
              {
                title: "Max Tokens",
                dataIndex: "maxTokens",
                render: (v: number) => formatNumber(v),
                width: 100,
              },
              {
                title: "Temperature",
                dataIndex: "temperature",
                render: (v: number, record: AiModelConfig) => (
                  <Slider
                    value={v}
                    min={0}
                    max={1}
                    step={0.1}
                    style={{ width: 100 }}
                    tooltip={{ formatter: (val) => `${val}` }}
                    onChange={() => message.info(`Temperature updated for ${record.modelId}`)}
                  />
                ),
                width: 140,
              },
              { title: "Purpose", dataIndex: "purpose" },
              {
                title: "Status",
                dataIndex: "status",
                render: (v: string) => (
                  <Tag color={getStatusColor(v)}>{v}</Tag>
                ),
                width: 90,
              },
            ]}
          />
        </Space>
      ),
    },
    {
      key: "prompts",
      label: (
        <span>
          <HistoryOutlined /> Prompt Versioning
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Table
            dataSource={mockPromptVersions}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => setSelectedPrompt(record as unknown as PromptVersion),
              style: { cursor: "pointer" },
            })}
            columns={[
              {
                title: "Prompt",
                dataIndex: "promptName",
                render: (v: string) => (
                  <Typography.Text code>{v}</Typography.Text>
                ),
              },
              {
                title: "Version",
                dataIndex: "version",
                render: (v: number) => `v${v}`,
                width: 80,
              },
              {
                title: "Status",
                dataIndex: "status",
                render: (v: string) => (
                  <Tag color={getStatusColor(v)}>{v}</Tag>
                ),
                width: 100,
              },
              {
                title: "Created",
                dataIndex: "createdAt",
                render: (v: string) => formatTimestamp(v),
                width: 180,
              },
              {
                title: "By",
                dataIndex: "createdBy",
                width: 100,
              },
              {
                title: "Actions",
                key: "actions",
                width: 120,
                render: (_: unknown, record: PromptVersion) =>
                  record.status === "archived" ? (
                    <Button
                      size="small"
                      icon={<RollbackOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        message.success(`Rolled back to ${record.promptName} v${record.version}`);
                      }}
                    >
                      Rollback
                    </Button>
                  ) : null,
              },
            ]}
          />
          <Modal
            title={
              selectedPrompt
                ? `${selectedPrompt.promptName} v${selectedPrompt.version}`
                : ""
            }
            open={!!selectedPrompt}
            onCancel={() => setSelectedPrompt(null)}
            footer={null}
            width={700}
          >
            {selectedPrompt && (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Descriptions size="small">
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedPrompt.status)}>
                      {selectedPrompt.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {formatTimestamp(selectedPrompt.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Author">
                    {selectedPrompt.createdBy}
                  </Descriptions.Item>
                </Descriptions>
                <CodeBlock
                  code={selectedPrompt.content}
                  language="text"
                  showLineNumbers
                  maxHeight={400}
                />
              </Space>
            )}
          </Modal>
        </Space>
      ),
    },
    {
      key: "costs",
      label: (
        <span>
          <DollarOutlined /> Cost Tracking
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Daily Cost"
                value={formatCurrency(totalDailyCost)}
                trend={-3.2}
                trendLabel="vs yesterday"
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Est. Monthly"
                value={formatCurrency(totalDailyCost * 30)}
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Total Tokens (24h)"
                value={`${(mockModelCosts.reduce((s, c) => s + c.tokensUsed, 0) / 1_000_000).toFixed(1)}M`}
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Avg Cost/Request"
                value={formatCurrency(totalDailyCost / totalRequests)}
              />
            </Col>
          </Row>

          <TimeSeriesChart
            title="Cost per Model (14 days)"
            data={costHistory}
            series={[
              { dataKey: "haiku", name: "Haiku 4.5", color: COLORS.chartTertiary },
              { dataKey: "sonnet", name: "Sonnet 4.6", color: COLORS.chartPrimary },
              { dataKey: "opus", name: "Opus 4.6", color: COLORS.chartSecondary },
            ]}
            yAxisLabel="$ USD"
            height={250}
          />

          <Table
            dataSource={mockModelCosts}
            rowKey="modelId"
            pagination={false}
            columns={[
              {
                title: "Model",
                dataIndex: "modelId",
                render: (v: string) => (
                  <Typography.Text code>{v}</Typography.Text>
                ),
              },
              {
                title: "Provider",
                dataIndex: "provider",
                render: (v: string) => <Tag>{v}</Tag>,
                width: 100,
              },
              {
                title: "Tokens Used",
                dataIndex: "tokensUsed",
                render: (v: number) => formatNumber(v),
                width: 120,
              },
              {
                title: "Total Cost",
                dataIndex: "totalCost",
                render: (v: number) => (
                  <Typography.Text strong>
                    {v === 0 ? <Tag color="success">FREE</Tag> : formatCurrency(v)}
                  </Typography.Text>
                ),
                width: 100,
              },
              {
                title: "Cost/Request",
                dataIndex: "avgCostPerRequest",
                render: (v: number) =>
                  v === 0 ? "-" : formatCurrency(v),
                width: 120,
              },
            ]}
          />
        </Space>
      ),
    },
    {
      key: "quality",
      label: (
        <span>
          <ExperimentOutlined /> Quality & A/B Tests
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Typography.Title level={5} style={{ color: COLORS.white }}>
            Quality Metrics
          </Typography.Title>
          <Table
            dataSource={mockModelQuality}
            rowKey="modelId"
            pagination={false}
            columns={[
              {
                title: "Model",
                dataIndex: "modelId",
                render: (v: string) => (
                  <Typography.Text code>{v}</Typography.Text>
                ),
              },
              {
                title: "Success Rate",
                dataIndex: "successRate",
                render: (v: number) => (
                  <Tag color={v > 98 ? "success" : v > 95 ? "warning" : "error"}>
                    {formatPercent(v)}
                  </Tag>
                ),
                width: 120,
              },
              {
                title: "Avg Response Time",
                dataIndex: "avgResponseTime",
                render: (v: number) => formatDuration(v),
                width: 140,
              },
              {
                title: "Error Rate",
                dataIndex: "errorRate",
                render: (v: number) => (
                  <Tag color={v < 1 ? "success" : v < 3 ? "warning" : "error"}>
                    {formatPercent(v)}
                  </Tag>
                ),
                width: 100,
              },
              {
                title: "Total Requests",
                dataIndex: "totalRequests",
                render: (v: number) => formatNumber(v),
                width: 120,
              },
            ]}
          />

          <Typography.Title level={5} style={{ color: COLORS.white, marginTop: 16 }}>
            A/B Tests
          </Typography.Title>
          <Table
            dataSource={mockAbTests}
            rowKey="id"
            pagination={false}
            columns={[
              { title: "Test Name", dataIndex: "name" },
              {
                title: "Variant A",
                dataIndex: "promptA",
                render: (v: string) => <Tag>{v}</Tag>,
              },
              {
                title: "Variant B",
                dataIndex: "promptB",
                render: (v: string) => <Tag>{v}</Tag>,
              },
              {
                title: "Split",
                dataIndex: "trafficSplit",
                render: (v: number) => (
                  <InputNumber
                    value={v}
                    min={0}
                    max={100}
                    size="small"
                    suffix="%"
                    style={{ width: 80 }}
                    onChange={() => message.info("Traffic split updated")}
                  />
                ),
                width: 110,
              },
              {
                title: "Status",
                dataIndex: "status",
                render: (v: string) => (
                  <Tag color={getStatusColor(v)}>{v}</Tag>
                ),
                width: 100,
              },
              {
                title: "Winner",
                dataIndex: "winner",
                render: (v: string | null) =>
                  v ? <Tag color="gold">Variant {v}</Tag> : "-",
                width: 100,
              },
              {
                title: "Started",
                dataIndex: "startDate",
                render: (v: string) => formatTimestamp(v),
                width: 160,
              },
              {
                title: "Actions",
                key: "actions",
                width: 100,
                render: (_: unknown, record: AbTestConfig) =>
                  record.status === "running" ? (
                    <Button
                      size="small"
                      icon={<PauseCircleOutlined />}
                      onClick={() => message.info("A/B test paused")}
                    >
                      Pause
                    </Button>
                  ) : record.status === "paused" ? (
                    <Button
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={() => message.info("A/B test resumed")}
                    >
                      Resume
                    </Button>
                  ) : null,
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
        AI Model Management
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <MetricPanel title="Active Models" value={mockModels.filter((m) => m.status === "active").length} />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel title="Total Requests (24h)" value={formatNumber(totalRequests)} />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel title="Daily Cost" value={formatCurrency(totalDailyCost)} />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel title="Prompt Versions" value={mockPromptVersions.length} />
        </Col>
      </Row>

      <Card
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          defaultActiveKey="models"
          items={tabItems}
          tabBarStyle={{
            padding: "0 16px",
            borderBottom: "1px solid #2D2640",
          }}
          style={{ padding: "0 16px 16px" }}
        />
      </Card>
    </Space>
  );
};
