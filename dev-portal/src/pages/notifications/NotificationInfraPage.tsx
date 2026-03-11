// ============================================================
// R5 - Notification Infrastructure Page
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
  Select,
  Statistic,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { StatusIndicator } from "@/components/common/StatusIndicator";
import { MetricPanel } from "@/components/charts/MetricPanel";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { ServiceCard } from "@/components/charts/ServiceCard";
import type { ChannelHealth, NotificationTemplate, DeliveryStats, ChannelCost } from "@/types";
import { COLORS, CHANNEL_INFO } from "@/utils/constants";
import {
  formatPercent,
  formatNumber,
  formatCurrency,
  formatTimestamp,
  getStatusColor,
} from "@/utils/formatters";

// --- Mock data ---
const mockChannelHealth: ChannelHealth[] = [
  { channel: "whatsapp", provider: "Gupshup", status: "healthy", deliveryRate: 97.8, avgLatency: 1200, lastCheck: new Date().toISOString() },
  { channel: "telegram", provider: "Bot API", status: "healthy", deliveryRate: 99.5, avgLatency: 320, lastCheck: new Date().toISOString() },
  { channel: "email", provider: "SendGrid", status: "healthy", deliveryRate: 98.2, avgLatency: 850, lastCheck: new Date().toISOString() },
  { channel: "sms", provider: "MSG91", status: "healthy", deliveryRate: 96.1, avgLatency: 2400, lastCheck: new Date().toISOString() },
  { channel: "push", provider: "FCM", status: "healthy", deliveryRate: 99.1, avgLatency: 180, lastCheck: new Date().toISOString() },
  { channel: "instagram", provider: "Messenger API", status: "degraded", deliveryRate: 85.3, avgLatency: 3200, lastCheck: new Date().toISOString() },
  { channel: "slack", provider: "Slack Web API", status: "healthy", deliveryRate: 99.8, avgLatency: 240, lastCheck: new Date().toISOString() },
  { channel: "discord", provider: "Discord Bot API", status: "healthy", deliveryRate: 99.6, avgLatency: 280, lastCheck: new Date().toISOString() },
];

const mockTemplates: NotificationTemplate[] = [
  { id: "t1", name: "task_reminder", channel: "whatsapp", status: "approved", lastModified: "2026-03-10T10:00:00Z", version: 3 },
  { id: "t2", name: "task_overdue", channel: "whatsapp", status: "approved", lastModified: "2026-03-09T14:00:00Z", version: 2 },
  { id: "t3", name: "daily_digest", channel: "email", status: "approved", lastModified: "2026-03-08T10:00:00Z", version: 5 },
  { id: "t4", name: "welcome_message", channel: "telegram", status: "approved", lastModified: "2026-03-05T10:00:00Z", version: 1 },
  { id: "t5", name: "otp_verification", channel: "sms", status: "pending", lastModified: "2026-03-11T08:00:00Z", version: 1 },
  { id: "t6", name: "friend_request", channel: "instagram", status: "pending", lastModified: "2026-03-11T09:00:00Z", version: 1 },
  { id: "t7", name: "team_task_assigned", channel: "slack", status: "approved", lastModified: "2026-03-07T10:00:00Z", version: 2 },
  { id: "t8", name: "achievement_unlock", channel: "push", status: "approved", lastModified: "2026-03-06T10:00:00Z", version: 4 },
];

const mockDeliveryStats: DeliveryStats[] = Object.keys(CHANNEL_INFO).map(
  (ch) => ({
    channel: ch as DeliveryStats["channel"],
    period: "24h" as const,
    sent: Math.floor(1000 + Math.random() * 5000),
    delivered: Math.floor(900 + Math.random() * 4500),
    failed: Math.floor(Math.random() * 100),
    pending: Math.floor(Math.random() * 50),
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      rate: 90 + Math.random() * 10,
    })),
  })
);

const mockCosts: ChannelCost[] = [
  { channel: "whatsapp", daily: 12.50, weekly: 87.50, monthly: 375.00, perMessage: 0.0025, currency: "USD" },
  { channel: "telegram", daily: 0, weekly: 0, monthly: 0, perMessage: 0, currency: "USD" },
  { channel: "email", daily: 2.10, weekly: 14.70, monthly: 63.00, perMessage: 0.0004, currency: "USD" },
  { channel: "sms", daily: 8.40, weekly: 58.80, monthly: 252.00, perMessage: 0.002, currency: "USD" },
  { channel: "push", daily: 0, weekly: 0, monthly: 0, perMessage: 0, currency: "USD" },
  { channel: "instagram", daily: 0, weekly: 0, monthly: 0, perMessage: 0, currency: "USD" },
  { channel: "slack", daily: 0, weekly: 0, monthly: 0, perMessage: 0, currency: "USD" },
  { channel: "discord", daily: 0, weekly: 0, monthly: 0, perMessage: 0, currency: "USD" },
];

export const NotificationInfraPage: React.FC = () => {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("24h");

  const totalSent = mockDeliveryStats.reduce((s, d) => s + d.sent, 0);
  const totalDelivered = mockDeliveryStats.reduce((s, d) => s + d.delivered, 0);
  const totalFailed = mockDeliveryStats.reduce((s, d) => s + d.failed, 0);
  const overallRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  const totalMonthlyCost = mockCosts.reduce((s, c) => s + c.monthly, 0);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Title level={3} style={{ margin: 0, color: COLORS.white }}>
          Notification Infrastructure
        </Typography.Title>
        <Select
          value={period}
          onChange={setPeriod}
          size="small"
          style={{ width: 100 }}
          options={[
            { value: "24h", label: "Last 24h" },
            { value: "7d", label: "Last 7d" },
            { value: "30d", label: "Last 30d" },
          ]}
        />
      </div>

      {/* Overview Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <MetricPanel title="Total Sent" value={formatNumber(totalSent)} description={period} />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel
            title="Overall Delivery Rate"
            value={overallRate.toFixed(1)}
            suffix="%"
            progress={overallRate}
            thresholds={{ warning: 95, critical: 90, inverted: true }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel
            title="Failed"
            value={formatNumber(totalFailed)}
            description={`${formatPercent((totalFailed / totalSent) * 100)} failure rate`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel
            title="Monthly Cost"
            value={formatCurrency(totalMonthlyCost)}
          />
        </Col>
      </Row>

      {/* Channel Health Cards */}
      <Typography.Title level={5} style={{ color: COLORS.white, marginBottom: 0 }}>
        Channel Health
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {mockChannelHealth.map((ch) => {
          const info = CHANNEL_INFO[ch.channel];
          return (
            <Col key={ch.channel} xs={24} sm={12} lg={6}>
              <ServiceCard
                title={info?.label ?? ch.channel}
                status={ch.status}
                lastCheck={ch.lastCheck}
                icon={
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: info?.color ?? COLORS.violet,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BellOutlined style={{ color: "#fff", fontSize: 12 }} />
                  </div>
                }
                metrics={[
                  { label: "Provider", value: ch.provider },
                  { label: "Delivery Rate", value: formatPercent(ch.deliveryRate) },
                  { label: "Avg Latency", value: `${ch.avgLatency}ms` },
                ]}
              />
            </Col>
          );
        })}
      </Row>

      {/* Delivery Rate Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <TimeSeriesChart
            title="Delivery Rates by Channel"
            data={mockDeliveryStats[0].history as unknown as Record<string, unknown>[]}
            series={[
              { dataKey: "rate", name: "Delivery Rate %" },
            ]}
            yAxisLabel="%"
            height={250}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DollarOutlined style={{ color: COLORS.gold }} />
                <span style={{ color: COLORS.white }}>Cost Breakdown</span>
              </Space>
            }
            style={{ background: "#1A1528", border: "1px solid #2D2640" }}
            styles={{ header: { borderBottom: "1px solid #2D2640" } }}
          >
            <Row gutter={[16, 12]}>
              {mockCosts
                .filter((c) => c.monthly > 0)
                .map((cost) => {
                  const info = CHANNEL_INFO[cost.channel];
                  return (
                    <Col key={cost.channel} xs={12} sm={8}>
                      <Statistic
                        title={
                          <span style={{ color: "#9CA3AF", fontSize: 12 }}>
                            {info?.label ?? cost.channel}
                          </span>
                        }
                        value={cost.monthly}
                        prefix="$"
                        precision={2}
                        valueStyle={{ color: COLORS.white, fontSize: 18 }}
                        suffix={
                          <span style={{ fontSize: 11, color: "#6B7280" }}>/mo</span>
                        }
                      />
                      <Typography.Text style={{ color: "#6B7280", fontSize: 11 }}>
                        {formatCurrency(cost.perMessage)}/msg
                      </Typography.Text>
                    </Col>
                  );
                })}
              <Col xs={12} sm={8}>
                <Statistic
                  title={
                    <span style={{ color: "#9CA3AF", fontSize: 12 }}>
                      Free Channels
                    </span>
                  }
                  value={mockCosts.filter((c) => c.monthly === 0).length}
                  suffix="channels"
                  valueStyle={{ color: COLORS.healthy, fontSize: 18 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Template Approval Status */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: COLORS.healthy }} />
            <span style={{ color: COLORS.white }}>Template Status</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Table
          dataSource={mockTemplates}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "Template",
              dataIndex: "name",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            {
              title: "Channel",
              dataIndex: "channel",
              render: (v: string) => {
                const info = CHANNEL_INFO[v];
                return (
                  <Tag color={info?.color ?? COLORS.violet}>{info?.label ?? v}</Tag>
                );
              },
              width: 120,
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
              title: "Last Modified",
              dataIndex: "lastModified",
              render: (v: string) => formatTimestamp(v),
              width: 180,
            },
          ]}
        />
      </Card>

      {/* Provider Status Indicators */}
      <Card
        title={
          <span style={{ color: COLORS.white }}>Provider API Health Checks</span>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Row gutter={[24, 16]}>
          {mockChannelHealth.map((ch) => {
            const info = CHANNEL_INFO[ch.channel];
            return (
              <Col key={ch.channel} xs={12} sm={8} md={6}>
                <Space direction="vertical" size={4}>
                  <Typography.Text strong style={{ color: COLORS.white }}>
                    {info?.label ?? ch.channel}
                  </Typography.Text>
                  <Typography.Text style={{ color: "#6B7280", fontSize: 12 }}>
                    {info?.provider ?? ch.provider}
                  </Typography.Text>
                  <StatusIndicator status={ch.status} size="small" lastCheck={ch.lastCheck} />
                </Space>
              </Col>
            );
          })}
        </Row>
      </Card>
    </Space>
  );
};
