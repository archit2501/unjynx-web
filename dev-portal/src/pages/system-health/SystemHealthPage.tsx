// ============================================================
// R1 - System Health Page
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Row, Col, Typography, Space, Select, Timeline, Tag, Card, Spin } from "antd";
import {
  CloudServerOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  SafetyCertificateOutlined,
  InboxOutlined,
  RobotOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useCustom } from "@refinedev/core";
import { ServiceCard } from "@/components/charts/ServiceCard";
import { MetricPanel } from "@/components/charts/MetricPanel";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { GrafanaEmbed } from "@/components/common/GrafanaEmbed";
import type {
  ServiceHealth,
  AlertEvent,
  ApiServerMetrics,
  DatabaseMetrics,
  CacheMetrics,
  QueueMetrics,
  AuthMetrics,
  StorageMetrics,
  AiMetrics,
} from "@/types";
import { REFRESH_INTERVALS, GRAFANA_DASHBOARDS, COLORS } from "@/utils/constants";
import {
  formatPercent,
  formatDuration,
  formatRelativeTime,
  getStatusColor,
} from "@/utils/formatters";

// --- Mock data generators ---
const generateMockServices = (): ReadonlyArray<ServiceHealth> => [
  { name: "API Server", status: "healthy", uptime: 99.98, lastCheck: new Date().toISOString(), metrics: { rps: 142, errorRate: 0.12, p50: 23, p95: 87, p99: 210 } },
  { name: "Database", status: "healthy", uptime: 99.99, lastCheck: new Date().toISOString(), metrics: { connections: 24, queryTime: 8.3, replicationLag: 0.1, diskUsage: 42 } },
  { name: "Cache (Valkey)", status: "healthy", uptime: 100, lastCheck: new Date().toISOString(), metrics: { memory: 128, hitRate: 97.2, keys: 15420, evictions: 3 } },
  { name: "Queue (BullMQ)", status: "healthy", uptime: 99.95, lastCheck: new Date().toISOString(), metrics: { active: 12, waiting: 34, failed: 2, completed: 98421 } },
  { name: "Auth (Logto)", status: "healthy", uptime: 99.97, lastCheck: new Date().toISOString(), metrics: { loginSuccess: 99.1, mfaAdoption: 34.2, sessions: 482 } },
  { name: "Storage (MinIO)", status: "healthy", uptime: 99.99, lastCheck: new Date().toISOString(), metrics: { bucketSize: 12.4, uploadRate: 3.2, objects: 48210 } },
  { name: "AI (Ollama)", status: "degraded", uptime: 98.5, lastCheck: new Date().toISOString(), metrics: { requestRate: 8.3, responseTime: 1240, tokens: 142000 } },
];

const generateMockAlerts = (): ReadonlyArray<AlertEvent> => [
  { id: "1", severity: "critical", service: "AI (Ollama)", message: "Response time exceeded 2s threshold", timestamp: new Date(Date.now() - 300000).toISOString(), resolved: false },
  { id: "2", severity: "warning", service: "Queue (BullMQ)", message: "2 failed jobs in notification queue", timestamp: new Date(Date.now() - 600000).toISOString(), resolved: false },
  { id: "3", severity: "info", service: "Database", message: "Automatic vacuum completed on tasks table", timestamp: new Date(Date.now() - 1800000).toISOString(), resolved: true },
  { id: "4", severity: "warning", service: "API Server", message: "P99 latency spike to 450ms", timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: true },
  { id: "5", severity: "critical", service: "Cache (Valkey)", message: "Memory usage at 85%", timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true },
];

const generateTimeSeriesData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    rps: Math.floor(100 + Math.random() * 80),
    errors: Math.floor(Math.random() * 5),
    p95: Math.floor(60 + Math.random() * 50),
    queueDepth: Math.floor(20 + Math.random() * 40),
  }));

const severityColor: Record<string, string> = {
  critical: COLORS.critical,
  warning: COLORS.warning,
  info: COLORS.info,
};

export const SystemHealthPage: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState(REFRESH_INTERVALS.normal);
  const [services, setServices] = useState<ReadonlyArray<ServiceHealth>>(generateMockServices);
  const [alerts, setAlerts] = useState<ReadonlyArray<AlertEvent>>(generateMockAlerts);
  const [chartData, setChartData] = useState(generateTimeSeriesData);

  // Attempt to fetch real data, fall back to mock
  const { isLoading } = useCustom<{
    services?: ServiceHealth[];
    alerts?: AlertEvent[];
  }>({
    url: "system-health/overview",
    method: "get",
    queryOptions: {
      retry: false,
      refetchInterval: refreshInterval,
      enabled: false, // disable auto-fetch, use mock data for now
      queryKey: ["system-health-overview"],
    },
  });

  const refreshMock = useCallback(() => {
    setServices(generateMockServices());
    setAlerts(generateMockAlerts());
    setChartData(generateTimeSeriesData());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshMock, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, refreshMock]);

  const apiMetrics = services.find((s) => s.name === "API Server")?.metrics as unknown as ApiServerMetrics | undefined;
  const dbMetrics = services.find((s) => s.name === "Database")?.metrics as unknown as DatabaseMetrics | undefined;
  const cacheMetrics = services.find((s) => s.name === "Cache (Valkey)")?.metrics as unknown as CacheMetrics | undefined;
  const queueMetrics = services.find((s) => s.name === "Queue (BullMQ)")?.metrics as unknown as QueueMetrics | undefined;
  const authMetrics = services.find((s) => s.name === "Auth (Logto)")?.metrics as unknown as AuthMetrics | undefined;
  const storageMetrics = services.find((s) => s.name === "Storage (MinIO)")?.metrics as unknown as StorageMetrics | undefined;
  const aiMetrics = services.find((s) => s.name === "AI (Ollama)")?.metrics as unknown as AiMetrics | undefined;

  return (
    <Spin spinning={isLoading} size="large">
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Title level={3} style={{ margin: 0, color: COLORS.white }}>
            System Health
          </Typography.Title>
          <Space>
            <Typography.Text style={{ color: "#9CA3AF", fontSize: 12 }}>
              Refresh:
            </Typography.Text>
            <Select
              value={refreshInterval}
              onChange={setRefreshInterval}
              size="small"
              style={{ width: 120 }}
              options={[
                { value: REFRESH_INTERVALS.realtime, label: "5s (realtime)" },
                { value: REFRESH_INTERVALS.fast, label: "15s (fast)" },
                { value: REFRESH_INTERVALS.normal, label: "30s (normal)" },
                { value: REFRESH_INTERVALS.slow, label: "60s (slow)" },
              ]}
            />
          </Space>
        </div>

        {/* Overview metric panels */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <MetricPanel
              title="Overall Uptime"
              value={99.97}
              suffix="%"
              precision={2}
              trend={0.02}
              trendLabel="vs last week"
              progress={99.97}
              thresholds={{ warning: 99, critical: 95, inverted: true }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <MetricPanel
              title="Total RPS"
              value={apiMetrics?.rps ?? 142}
              suffix="req/s"
              trend={5.3}
              trendLabel="vs yesterday"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <MetricPanel
              title="Error Rate"
              value={apiMetrics?.errorRate ?? 0.12}
              suffix="%"
              precision={2}
              trend={-0.05}
              trendLabel="improving"
              progress={apiMetrics?.errorRate ?? 0.12}
              thresholds={{ warning: 1, critical: 5 }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <MetricPanel
              title="Active Alerts"
              value={alerts.filter((a) => !a.resolved).length}
              description="unresolved"
            />
          </Col>
        </Row>

        {/* Grafana Embeds */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <GrafanaEmbed
              dashboardUid={GRAFANA_DASHBOARDS.systemOverview}
              panelId={1}
              title="CPU & Memory Usage"
              height={300}
            />
          </Col>
          <Col xs={24} lg={12}>
            <GrafanaEmbed
              dashboardUid={GRAFANA_DASHBOARDS.apiMetrics}
              panelId={2}
              title="Request Latency Distribution"
              height={300}
            />
          </Col>
        </Row>

        {/* Service Cards */}
        <Typography.Title level={5} style={{ color: COLORS.white, marginBottom: 0 }}>
          Service Status
        </Typography.Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12} xl={8}>
            <ServiceCard
              title="API Server"
              status={services.find((s) => s.name === "API Server")?.status ?? "unknown"}
              lastCheck={services.find((s) => s.name === "API Server")?.lastCheck}
              icon={<CloudServerOutlined style={{ color: COLORS.violet }} />}
              metrics={[
                { label: "Uptime", value: formatPercent(apiMetrics?.uptime ?? 99.98) },
                { label: "RPS", value: apiMetrics?.rps ?? 0 },
                { label: "Error Rate", value: formatPercent(apiMetrics?.errorRate ?? 0) },
                { label: "P50", value: formatDuration(apiMetrics?.p50 ?? 0) },
                { label: "P95", value: formatDuration(apiMetrics?.p95 ?? 0) },
                { label: "P99", value: formatDuration(apiMetrics?.p99 ?? 0) },
              ]}
            />
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <ServiceCard
              title="Database (PostgreSQL)"
              status={services.find((s) => s.name === "Database")?.status ?? "unknown"}
              lastCheck={services.find((s) => s.name === "Database")?.lastCheck}
              icon={<DatabaseOutlined style={{ color: COLORS.violet }} />}
              metrics={[
                { label: "Connections", value: dbMetrics?.activeConnections ?? 0 },
                { label: "Avg Query", value: formatDuration(dbMetrics?.avgQueryTime ?? 0) },
                { label: "Repl Lag", value: `${dbMetrics?.replicationLag ?? 0}ms` },
                { label: "Disk Usage", value: formatPercent(dbMetrics?.diskUsagePercent ?? 0) },
              ]}
            />
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <ServiceCard
              title="Cache (Valkey)"
              status={services.find((s) => s.name === "Cache (Valkey)")?.status ?? "unknown"}
              lastCheck={services.find((s) => s.name === "Cache (Valkey)")?.lastCheck}
              icon={<ThunderboltOutlined style={{ color: COLORS.gold }} />}
              metrics={[
                { label: "Memory", value: `${cacheMetrics?.memoryUsedMB ?? 0}MB` },
                { label: "Hit Rate", value: formatPercent(cacheMetrics?.hitRate ?? 0) },
                { label: "Keys", value: cacheMetrics?.totalKeys ?? 0 },
              ]}
            />
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <ServiceCard
              title="Queue (BullMQ)"
              status={services.find((s) => s.name === "Queue (BullMQ)")?.status ?? "unknown"}
              lastCheck={services.find((s) => s.name === "Queue (BullMQ)")?.lastCheck}
              icon={<UnorderedListOutlined style={{ color: COLORS.violet }} />}
              metrics={[
                { label: "Active", value: queueMetrics?.active ?? 0 },
                { label: "Waiting", value: queueMetrics?.waiting ?? 0 },
                { label: "Failed", value: queueMetrics?.failed ?? 0 },
                { label: "Completed", value: queueMetrics?.completed ?? 0 },
              ]}
            />
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <ServiceCard
              title="Auth (Logto)"
              status={services.find((s) => s.name === "Auth (Logto)")?.status ?? "unknown"}
              lastCheck={services.find((s) => s.name === "Auth (Logto)")?.lastCheck}
              icon={<SafetyCertificateOutlined style={{ color: COLORS.healthy }} />}
              metrics={[
                { label: "Login Success", value: formatPercent(authMetrics?.loginSuccessRate ?? 0) },
                { label: "MFA Adoption", value: formatPercent(authMetrics?.mfaAdoption ?? 0) },
                { label: "Sessions", value: authMetrics?.activeSessions ?? 0 },
              ]}
            />
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <ServiceCard
              title="Storage (MinIO)"
              status={services.find((s) => s.name === "Storage (MinIO)")?.status ?? "unknown"}
              lastCheck={services.find((s) => s.name === "Storage (MinIO)")?.lastCheck}
              icon={<InboxOutlined style={{ color: COLORS.violet }} />}
              metrics={[
                { label: "Size", value: `${storageMetrics?.bucketSizeGB ?? 0}GB` },
                { label: "Upload Rate", value: `${storageMetrics?.uploadRatePerMin ?? 0}/min` },
              ]}
            />
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <ServiceCard
              title="AI (Ollama)"
              status={services.find((s) => s.name === "AI (Ollama)")?.status ?? "unknown"}
              lastCheck={services.find((s) => s.name === "AI (Ollama)")?.lastCheck}
              icon={<RobotOutlined style={{ color: COLORS.gold }} />}
              metrics={[
                { label: "Req Rate", value: `${aiMetrics?.requestRate ?? 0}/s` },
                { label: "Resp Time", value: formatDuration(aiMetrics?.avgResponseTime ?? 0) },
                { label: "Tokens", value: `${((aiMetrics?.tokenUsage ?? 0) / 1000).toFixed(0)}K` },
              ]}
            />
          </Col>
        </Row>

        {/* Time series charts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <TimeSeriesChart
              title="Requests Per Second (24h)"
              data={chartData}
              series={[
                { dataKey: "rps", name: "RPS", color: COLORS.violet },
                { dataKey: "errors", name: "Errors", color: COLORS.critical },
              ]}
              yAxisLabel="Count"
            />
          </Col>
          <Col xs={24} lg={12}>
            <TimeSeriesChart
              title="Queue Depth & P95 Latency (24h)"
              data={chartData}
              series={[
                { dataKey: "queueDepth", name: "Queue Depth", color: COLORS.gold },
                { dataKey: "p95", name: "P95 (ms)", color: COLORS.chartTertiary },
              ]}
            />
          </Col>
        </Row>

        {/* Alert History Timeline */}
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: COLORS.warning }} />
              <span style={{ color: COLORS.white }}>Alert History</span>
            </Space>
          }
          style={{ background: "#1A1528", border: "1px solid #2D2640" }}
          styles={{ header: { borderBottom: "1px solid #2D2640" } }}
        >
          <Timeline
            items={alerts.map((alert) => ({
              color: severityColor[alert.severity] ?? COLORS.unknown,
              children: (
                <div key={alert.id}>
                  <Space>
                    <Tag color={getStatusColor(alert.severity)}>{alert.severity.toUpperCase()}</Tag>
                    <Typography.Text strong style={{ color: COLORS.white }}>
                      {alert.service}
                    </Typography.Text>
                    {alert.resolved && <Tag color="success">Resolved</Tag>}
                  </Space>
                  <div>
                    <Typography.Text style={{ color: "#D1D5DB" }}>
                      {alert.message}
                    </Typography.Text>
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatRelativeTime(alert.timestamp)}
                  </Typography.Text>
                </div>
              ),
            }))}
          />
        </Card>
      </Space>
    </Spin>
  );
};
