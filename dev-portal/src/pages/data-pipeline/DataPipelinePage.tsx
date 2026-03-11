// ============================================================
// R8 - Data Pipeline Page
// ============================================================

import {
  Typography,
  Space,
  Row,
  Col,
  Card,
  Table,
  Tag,
  Steps,
  Badge,
  Button,
  message,
} from "antd";
import {
  NodeIndexOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { StatusIndicator } from "@/components/common/StatusIndicator";
import { MetricPanel } from "@/components/charts/MetricPanel";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import type {
  EtlJob,
  ContentPipelineStage,
  BackupVerification,
  AnonymizationStatus,
  PipelineMetric,
} from "@/types";
import { COLORS } from "@/utils/constants";
import {
  formatTimestamp,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatCron,
  getStatusColor,
} from "@/utils/formatters";

// --- Mock data ---
const mockEtlJobs: EtlJob[] = [
  { id: "e1", name: "daily_content_sync", schedule: "0 0 * * *", lastRun: "2026-03-11T00:00:00Z", nextRun: "2026-03-12T00:00:00Z", status: "completed", duration: 12400, recordsProcessed: 100 },
  { id: "e2", name: "user_analytics_aggregation", schedule: "0 * * * *", lastRun: "2026-03-11T09:00:00Z", nextRun: "2026-03-11T10:00:00Z", status: "completed", duration: 8200, recordsProcessed: 48210 },
  { id: "e3", name: "notification_delivery_report", schedule: "*/15 * * * *", lastRun: "2026-03-11T09:30:00Z", nextRun: "2026-03-11T09:45:00Z", status: "running", duration: 0, recordsProcessed: 12400 },
  { id: "e4", name: "backup_verification", schedule: "0 4 * * *", lastRun: "2026-03-11T04:00:00Z", nextRun: "2026-03-12T04:00:00Z", status: "completed", duration: 45000, recordsProcessed: 0 },
  { id: "e5", name: "dead_letter_cleanup", schedule: "0 3 * * 0", lastRun: "2026-03-09T03:00:00Z", nextRun: "2026-03-16T03:00:00Z", status: "completed", duration: 3200, recordsProcessed: 24 },
  { id: "e6", name: "streak_calculation", schedule: "0 0 * * *", lastRun: "2026-03-11T00:00:00Z", nextRun: "2026-03-12T00:00:00Z", status: "completed", duration: 5400, recordsProcessed: 1240 },
  { id: "e7", name: "content_embedding_generation", schedule: "0 2 * * *", lastRun: "2026-03-11T02:00:00Z", nextRun: "2026-03-12T02:00:00Z", status: "failed", duration: 28000, recordsProcessed: 420 },
];

const mockPipelineStages: ContentPipelineStage[] = [
  { stage: "ingestion", status: "healthy", itemsInQueue: 12, processedToday: 240, errorRate: 0.5, avgProcessingTime: 120 },
  { stage: "processing", status: "healthy", itemsInQueue: 4, processedToday: 236, errorRate: 1.2, avgProcessingTime: 450 },
  { stage: "delivery", status: "healthy", itemsInQueue: 8, processedToday: 228, errorRate: 0.8, avgProcessingTime: 80 },
];

const mockBackupVerifications: BackupVerification[] = [
  { backupId: "daily-backup-2026-03-11", lastVerified: "2026-03-11T04:30:00Z", integrityCheck: "passed", checksumMatch: true, restoreTestResult: "success" },
  { backupId: "daily-backup-2026-03-10", lastVerified: "2026-03-10T04:30:00Z", integrityCheck: "passed", checksumMatch: true, restoreTestResult: "success" },
  { backupId: "daily-backup-2026-03-09", lastVerified: "2026-03-09T04:30:00Z", integrityCheck: "passed", checksumMatch: true, restoreTestResult: "not_tested" },
  { backupId: "weekly-backup-2026-03-09", lastVerified: "2026-03-09T05:00:00Z", integrityCheck: "passed", checksumMatch: true, restoreTestResult: "success" },
];

const mockAnonymization: AnonymizationStatus[] = [
  { tableName: "profiles", piiFields: ["email", "display_name", "avatar_url"], anonymized: true, lastAnonymized: "2026-03-10T03:00:00Z", complianceStatus: "compliant" },
  { tableName: "tasks", piiFields: ["title", "description"], anonymized: false, lastAnonymized: null, complianceStatus: "pending" },
  { tableName: "notifications", piiFields: ["content"], anonymized: true, lastAnonymized: "2026-03-10T03:00:00Z", complianceStatus: "compliant" },
  { tableName: "delivery_attempts", piiFields: ["recipient"], anonymized: true, lastAnonymized: "2026-03-10T03:00:00Z", complianceStatus: "compliant" },
  { tableName: "audit_log", piiFields: ["ip_address", "user_agent"], anonymized: false, lastAnonymized: null, complianceStatus: "non_compliant" },
];

const mockPipelineMetrics: PipelineMetric[] = [
  {
    name: "Content Pipeline",
    throughput: 240,
    errorRate: 0.8,
    lag: 12,
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      value: 8 + Math.random() * 8,
    })),
  },
  {
    name: "Notification Pipeline",
    throughput: 4200,
    errorRate: 1.1,
    lag: 34,
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      value: 20 + Math.random() * 30,
    })),
  },
  {
    name: "Analytics Pipeline",
    throughput: 48000,
    errorRate: 0.2,
    lag: 5,
    history: Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      value: 2 + Math.random() * 6,
    })),
  },
];

const etlStatusIcon: Record<string, React.ReactNode> = {
  running: <PlayCircleOutlined style={{ color: COLORS.info }} />,
  completed: <CheckCircleOutlined style={{ color: COLORS.healthy }} />,
  failed: <ExclamationCircleOutlined style={{ color: COLORS.critical }} />,
  scheduled: <ClockCircleOutlined style={{ color: COLORS.warning }} />,
};

export const DataPipelinePage: React.FC = () => {
  const totalProcessed = mockEtlJobs.reduce((s, j) => s + j.recordsProcessed, 0);
  const failedJobs = mockEtlJobs.filter((j) => j.status === "failed").length;
  const compliantTables = mockAnonymization.filter(
    (a) => a.complianceStatus === "compliant"
  ).length;

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0, color: COLORS.white }}>
        Data Pipeline
      </Typography.Title>

      {/* Overview Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <MetricPanel title="ETL Jobs" value={mockEtlJobs.length} description={`${failedJobs} failed`} />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel title="Records Processed" value={formatNumber(totalProcessed)} description="today" />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel
            title="GDPR Compliance"
            value={`${compliantTables}/${mockAnonymization.length}`}
            progress={(compliantTables / mockAnonymization.length) * 100}
            thresholds={{ warning: 80, critical: 60, inverted: true }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <MetricPanel
            title="Backups Verified"
            value={mockBackupVerifications.filter((b) => b.integrityCheck === "passed").length}
            suffix={`/ ${mockBackupVerifications.length}`}
          />
        </Col>
      </Row>

      {/* Content Pipeline - Visual Steps */}
      <Card
        title={
          <Space>
            <NodeIndexOutlined style={{ color: COLORS.violet }} />
            <span style={{ color: COLORS.white }}>Content Pipeline</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Steps
          current={-1}
          items={mockPipelineStages.map((stage) => ({
            title: (
              <span style={{ color: COLORS.white, textTransform: "capitalize" }}>
                {stage.stage}
              </span>
            ),
            description: (
              <Space direction="vertical" size={2}>
                <StatusIndicator status={stage.status} size="small" />
                <Typography.Text style={{ color: "#9CA3AF", fontSize: 11 }}>
                  Queue: {stage.itemsInQueue} | Processed: {stage.processedToday}
                </Typography.Text>
                <Typography.Text style={{ color: "#9CA3AF", fontSize: 11 }}>
                  Error: {formatPercent(stage.errorRate)} | Avg: {formatDuration(stage.avgProcessingTime)}
                </Typography.Text>
              </Space>
            ),
            status: stage.status === "healthy" ? "finish" : stage.status === "degraded" ? "process" : "error",
            icon:
              stage.status === "healthy" ? (
                <CheckCircleOutlined style={{ color: COLORS.healthy }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: COLORS.warning }} />
              ),
          }))}
        />
      </Card>

      {/* ETL Jobs Table */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: COLORS.gold }} />
            <span style={{ color: COLORS.white }}>ETL Job Status</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Table
          dataSource={mockEtlJobs}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "",
              key: "icon",
              width: 32,
              render: (_: unknown, record: EtlJob) => etlStatusIcon[record.status],
            },
            {
              title: "Job Name",
              dataIndex: "name",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            {
              title: "Schedule",
              dataIndex: "schedule",
              render: (v: string) => (
                <Space direction="vertical" size={0}>
                  <Typography.Text style={{ fontSize: 12 }}>
                    {formatCron(v)}
                  </Typography.Text>
                  <Typography.Text code style={{ fontSize: 10, color: "#6B7280" }}>
                    {v}
                  </Typography.Text>
                </Space>
              ),
              width: 160,
            },
            {
              title: "Last Run",
              dataIndex: "lastRun",
              render: (v: string) => formatRelativeTime(v),
              width: 120,
            },
            {
              title: "Next Run",
              dataIndex: "nextRun",
              render: (v: string) => formatRelativeTime(v),
              width: 120,
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
              title: "Duration",
              dataIndex: "duration",
              render: (v: number) => (v > 0 ? formatDuration(v) : "-"),
              width: 90,
            },
            {
              title: "Records",
              dataIndex: "recordsProcessed",
              render: (v: number) => formatNumber(v),
              width: 90,
            },
            {
              title: "Actions",
              key: "actions",
              width: 90,
              render: (_: unknown, record: EtlJob) => (
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => message.success(`Job ${record.name} triggered`)}
                >
                  Run
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Pipeline Health Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <TimeSeriesChart
            title="Pipeline Lag (24h)"
            data={mockPipelineMetrics[0].history as unknown as Record<string, unknown>[]}
            series={[{ dataKey: "value", name: "Content Pipeline Lag (s)" }]}
            yAxisLabel="seconds"
            height={250}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: COLORS.white }}>Pipeline Health</span>
            }
            style={{ background: "#1A1528", border: "1px solid #2D2640" }}
            styles={{ header: { borderBottom: "1px solid #2D2640" } }}
          >
            <Table
              dataSource={mockPipelineMetrics}
              rowKey="name"
              pagination={false}
              size="small"
              columns={[
                { title: "Pipeline", dataIndex: "name" },
                {
                  title: "Throughput",
                  dataIndex: "throughput",
                  render: (v: number) => `${formatNumber(v)}/day`,
                },
                {
                  title: "Error Rate",
                  dataIndex: "errorRate",
                  render: (v: number) => (
                    <Tag color={v > 2 ? "error" : v > 1 ? "warning" : "success"}>
                      {formatPercent(v)}
                    </Tag>
                  ),
                },
                {
                  title: "Lag",
                  dataIndex: "lag",
                  render: (v: number) => `${v}s`,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Backup Verification */}
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: COLORS.healthy }} />
            <span style={{ color: COLORS.white }}>Backup Verification</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Table
          dataSource={mockBackupVerifications}
          rowKey="backupId"
          pagination={false}
          columns={[
            {
              title: "Backup",
              dataIndex: "backupId",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            {
              title: "Last Verified",
              dataIndex: "lastVerified",
              render: (v: string) => formatTimestamp(v),
              width: 180,
            },
            {
              title: "Integrity",
              dataIndex: "integrityCheck",
              render: (v: string) => (
                <Tag color={getStatusColor(v)}>{v}</Tag>
              ),
              width: 100,
            },
            {
              title: "Checksum",
              dataIndex: "checksumMatch",
              render: (v: boolean) => (
                <Badge
                  status={v ? "success" : "error"}
                  text={v ? "Match" : "Mismatch"}
                />
              ),
              width: 110,
            },
            {
              title: "Restore Test",
              dataIndex: "restoreTestResult",
              render: (v: string) => (
                <Tag color={getStatusColor(v)}>{v.replace("_", " ")}</Tag>
              ),
              width: 120,
            },
          ]}
        />
      </Card>

      {/* Data Anonymization / GDPR */}
      <Card
        title={
          <Space>
            <DeleteOutlined style={{ color: COLORS.warning }} />
            <span style={{ color: COLORS.white }}>Data Anonymization (DPDP/GDPR)</span>
          </Space>
        }
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ header: { borderBottom: "1px solid #2D2640" } }}
      >
        <Table
          dataSource={mockAnonymization}
          rowKey="tableName"
          pagination={false}
          columns={[
            {
              title: "Table",
              dataIndex: "tableName",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            {
              title: "PII Fields",
              dataIndex: "piiFields",
              render: (fields: string[]) =>
                fields.map((f) => (
                  <Tag key={f} color="volcano" style={{ fontSize: 11 }}>
                    {f}
                  </Tag>
                )),
            },
            {
              title: "Anonymized",
              dataIndex: "anonymized",
              render: (v: boolean) => (
                <Badge status={v ? "success" : "warning"} text={v ? "Yes" : "No"} />
              ),
              width: 110,
            },
            {
              title: "Last Run",
              dataIndex: "lastAnonymized",
              render: (v: string | null) =>
                v ? formatRelativeTime(v) : <Tag color="warning">Never</Tag>,
              width: 130,
            },
            {
              title: "Compliance",
              dataIndex: "complianceStatus",
              render: (v: string) => (
                <Tag color={getStatusColor(v)}>{v.replace("_", " ")}</Tag>
              ),
              width: 120,
            },
          ]}
        />
      </Card>
    </Space>
  );
};
