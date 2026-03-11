// ============================================================
// R2 - Database Management Page
// ============================================================

import { useState } from "react";
import {
  Typography,
  Space,
  Tabs,
  Table,
  Tag,
  Button,
  Input,
  Card,
  Popconfirm,
  InputNumber,
  Row,
  Col,
  message,
} from "antd";
import {
  DatabaseOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  CloudDownloadOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useCustom } from "@refinedev/core";
import { SchemaViewer } from "@/components/schema/SchemaViewer";
import { CodeBlock } from "@/components/common/CodeBlock";
import { MetricPanel } from "@/components/charts/MetricPanel";
import type { TableSchema, Migration, SlowQuery, DatabaseBackup } from "@/types";
import { COLORS } from "@/utils/constants";
import {
  formatDuration,
  formatTimestamp,
  formatRelativeTime,
  formatNumber,
  getStatusColor,
} from "@/utils/formatters";

// --- Mock data ---
const mockTables: ReadonlyArray<TableSchema> = [
  {
    name: "profiles",
    rowCount: 1240,
    sizeKB: 512,
    columns: [
      { name: "id", type: "uuid", nullable: false, defaultValue: "gen_random_uuid()", isPrimaryKey: true, isForeignKey: false, references: null },
      { name: "logto_id", type: "varchar(64)", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "display_name", type: "varchar(255)", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "email", type: "varchar(255)", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "avatar_url", type: "text", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "timezone", type: "varchar(50)", nullable: false, defaultValue: "'UTC'", isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "created_at", type: "timestamptz", nullable: false, defaultValue: "now()", isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "updated_at", type: "timestamptz", nullable: false, defaultValue: "now()", isPrimaryKey: false, isForeignKey: false, references: null },
    ],
    indexes: [
      { name: "profiles_pkey", columns: ["id"], unique: true, type: "btree" },
      { name: "profiles_logto_id_idx", columns: ["logto_id"], unique: true, type: "btree" },
      { name: "profiles_email_idx", columns: ["email"], unique: false, type: "btree" },
    ],
  },
  {
    name: "tasks",
    rowCount: 48210,
    sizeKB: 8192,
    columns: [
      { name: "id", type: "uuid", nullable: false, defaultValue: "gen_random_uuid()", isPrimaryKey: true, isForeignKey: false, references: null },
      { name: "profile_id", type: "uuid", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: true, references: "profiles.id" },
      { name: "title", type: "varchar(500)", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "description", type: "text", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "status", type: "varchar(20)", nullable: false, defaultValue: "'pending'", isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "priority", type: "integer", nullable: false, defaultValue: "0", isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "due_date", type: "timestamptz", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "completed_at", type: "timestamptz", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "created_at", type: "timestamptz", nullable: false, defaultValue: "now()", isPrimaryKey: false, isForeignKey: false, references: null },
    ],
    indexes: [
      { name: "tasks_pkey", columns: ["id"], unique: true, type: "btree" },
      { name: "tasks_profile_id_idx", columns: ["profile_id"], unique: false, type: "btree" },
      { name: "tasks_status_idx", columns: ["status"], unique: false, type: "btree" },
      { name: "tasks_fts_idx", columns: ["title", "description"], unique: false, type: "gin" },
    ],
  },
  {
    name: "projects",
    rowCount: 3420,
    sizeKB: 2048,
    columns: [
      { name: "id", type: "uuid", nullable: false, defaultValue: "gen_random_uuid()", isPrimaryKey: true, isForeignKey: false, references: null },
      { name: "profile_id", type: "uuid", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: true, references: "profiles.id" },
      { name: "name", type: "varchar(255)", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "color", type: "varchar(7)", nullable: false, defaultValue: "'#6C5CE7'", isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "archived", type: "boolean", nullable: false, defaultValue: "false", isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "created_at", type: "timestamptz", nullable: false, defaultValue: "now()", isPrimaryKey: false, isForeignKey: false, references: null },
    ],
    indexes: [
      { name: "projects_pkey", columns: ["id"], unique: true, type: "btree" },
      { name: "projects_profile_id_idx", columns: ["profile_id"], unique: false, type: "btree" },
    ],
  },
  {
    name: "notifications",
    rowCount: 124000,
    sizeKB: 32768,
    columns: [
      { name: "id", type: "uuid", nullable: false, defaultValue: "gen_random_uuid()", isPrimaryKey: true, isForeignKey: false, references: null },
      { name: "profile_id", type: "uuid", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: true, references: "profiles.id" },
      { name: "task_id", type: "uuid", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: true, references: "tasks.id" },
      { name: "channel", type: "varchar(20)", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "status", type: "varchar(20)", nullable: false, defaultValue: "'pending'", isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "sent_at", type: "timestamptz", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
    ],
    indexes: [
      { name: "notifications_pkey", columns: ["id"], unique: true, type: "btree" },
      { name: "notifications_profile_id_idx", columns: ["profile_id"], unique: false, type: "btree" },
      { name: "notifications_status_idx", columns: ["status"], unique: false, type: "btree" },
    ],
  },
  {
    name: "daily_content",
    rowCount: 2400,
    sizeKB: 4096,
    columns: [
      { name: "id", type: "uuid", nullable: false, defaultValue: "gen_random_uuid()", isPrimaryKey: true, isForeignKey: false, references: null },
      { name: "category", type: "varchar(50)", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "content", type: "text", nullable: false, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "author", type: "varchar(255)", nullable: true, defaultValue: null, isPrimaryKey: false, isForeignKey: false, references: null },
      { name: "active", type: "boolean", nullable: false, defaultValue: "true", isPrimaryKey: false, isForeignKey: false, references: null },
    ],
    indexes: [
      { name: "daily_content_pkey", columns: ["id"], unique: true, type: "btree" },
      { name: "daily_content_category_idx", columns: ["category"], unique: false, type: "btree" },
    ],
  },
];

const mockMigrations: ReadonlyArray<Migration> = [
  { id: "001", name: "create_profiles_table", appliedAt: "2026-02-15T10:00:00Z", duration: 120, status: "applied" },
  { id: "002", name: "create_tasks_table", appliedAt: "2026-02-15T10:02:00Z", duration: 180, status: "applied" },
  { id: "003", name: "create_projects_table", appliedAt: "2026-02-16T14:00:00Z", duration: 95, status: "applied" },
  { id: "004", name: "add_fts_index", appliedAt: "2026-02-20T09:00:00Z", duration: 2400, status: "applied" },
  { id: "005", name: "create_notifications_table", appliedAt: "2026-03-01T11:00:00Z", duration: 210, status: "applied" },
  { id: "006", name: "add_notification_preferences", appliedAt: "2026-03-05T16:00:00Z", duration: 150, status: "applied" },
  { id: "007", name: "create_delivery_attempts_table", appliedAt: "2026-03-08T10:00:00Z", duration: 180, status: "applied" },
  { id: "008", name: "add_channel_verification", appliedAt: "2026-03-10T09:00:00Z", duration: 90, status: "applied" },
];

const mockSlowQueries: ReadonlyArray<SlowQuery> = [
  { id: "sq1", query: "SELECT * FROM tasks WHERE profile_id = $1 AND status = 'pending' ORDER BY due_date ASC LIMIT 100", duration: 245, timestamp: "2026-03-11T08:12:00Z", table: "tasks", rowsExamined: 12400 },
  { id: "sq2", query: "SELECT t.*, p.name AS project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.profile_id = $1", duration: 312, timestamp: "2026-03-11T07:45:00Z", table: "tasks", rowsExamined: 24800 },
  { id: "sq3", query: "SELECT COUNT(*) FROM notifications WHERE profile_id = $1 AND status = 'delivered' GROUP BY channel", duration: 189, timestamp: "2026-03-11T06:30:00Z", table: "notifications", rowsExamined: 48000 },
];

const mockBackups: ReadonlyArray<DatabaseBackup> = [
  { id: "b1", name: "daily-backup-2026-03-11", createdAt: "2026-03-11T02:00:00Z", sizeGB: 2.4, status: "completed", type: "full" },
  { id: "b2", name: "daily-backup-2026-03-10", createdAt: "2026-03-10T02:00:00Z", sizeGB: 2.3, status: "completed", type: "full" },
  { id: "b3", name: "incremental-2026-03-11-12", createdAt: "2026-03-11T12:00:00Z", sizeGB: 0.1, status: "in_progress", type: "incremental" },
  { id: "b4", name: "daily-backup-2026-03-09", createdAt: "2026-03-09T02:00:00Z", sizeGB: 2.2, status: "completed", type: "full" },
];

export const DatabasePage: React.FC = () => {
  const [durationThreshold, setDurationThreshold] = useState(100);
  const [querySearch, setQuerySearch] = useState("");

  const { isLoading } = useCustom({
    url: "database/schema",
    method: "get",
    queryOptions: {
      retry: false,
      enabled: false,
      queryKey: ["database-schema"],
    },
  });

  const filteredQueries = mockSlowQueries.filter(
    (q) =>
      q.duration >= durationThreshold &&
      (querySearch === "" ||
        q.query.toLowerCase().includes(querySearch.toLowerCase()))
  );

  const handleTriggerBackup = () => {
    message.success("Backup triggered successfully");
  };

  const tabItems = [
    {
      key: "schema",
      label: (
        <span>
          <DatabaseOutlined /> Schema
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <MetricPanel title="Tables" value={mockTables.length} />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Total Rows"
                value={formatNumber(mockTables.reduce((sum, t) => sum + t.rowCount, 0))}
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Total Size"
                value={`${(mockTables.reduce((sum, t) => sum + t.sizeKB, 0) / 1024).toFixed(1)}`}
                suffix="MB"
              />
            </Col>
            <Col xs={12} sm={6}>
              <MetricPanel
                title="Indexes"
                value={mockTables.reduce((sum, t) => sum + t.indexes.length, 0)}
              />
            </Col>
          </Row>
          <SchemaViewer tables={mockTables} loading={isLoading} />
        </Space>
      ),
    },
    {
      key: "migrations",
      label: (
        <span>
          <HistoryOutlined /> Migrations
        </span>
      ),
      children: (
        <Table
          dataSource={[...mockMigrations].reverse() as Migration[]}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "ID", dataIndex: "id", width: 60 },
            {
              title: "Migration",
              dataIndex: "name",
              render: (v: string) => (
                <Typography.Text code style={{ fontSize: 12 }}>
                  {v}
                </Typography.Text>
              ),
            },
            {
              title: "Applied At",
              dataIndex: "appliedAt",
              render: (v: string) => formatTimestamp(v),
              width: 180,
            },
            {
              title: "Duration",
              dataIndex: "duration",
              render: (v: number) => formatDuration(v),
              width: 100,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (v: string) => <Tag color={getStatusColor(v)}>{v}</Tag>,
              width: 100,
            },
          ]}
        />
      ),
    },
    {
      key: "slow-queries",
      label: (
        <span>
          <ThunderboltOutlined /> Slow Queries
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Space>
            <Typography.Text style={{ color: "#9CA3AF" }}>
              Min duration (ms):
            </Typography.Text>
            <InputNumber
              value={durationThreshold}
              onChange={(v) => setDurationThreshold(v ?? 100)}
              min={0}
              step={50}
              size="small"
              style={{ width: 100 }}
            />
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search queries..."
              value={querySearch}
              onChange={(e) => setQuerySearch(e.target.value)}
              allowClear
              size="small"
              style={{ width: 240 }}
            />
          </Space>
          <Table
            dataSource={filteredQueries as SlowQuery[]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record: SlowQuery) => (
                <CodeBlock code={record.query} language="sql" />
              ),
            }}
            columns={[
              {
                title: "Query (truncated)",
                dataIndex: "query",
                render: (v: string) => (
                  <Typography.Text
                    code
                    ellipsis
                    style={{ maxWidth: 400, fontSize: 12, display: "block" }}
                  >
                    {v}
                  </Typography.Text>
                ),
              },
              {
                title: "Duration",
                dataIndex: "duration",
                render: (v: number) => (
                  <Tag color={v > 200 ? "error" : v > 100 ? "warning" : "success"}>
                    {formatDuration(v)}
                  </Tag>
                ),
                sorter: (a: SlowQuery, b: SlowQuery) => a.duration - b.duration,
                width: 110,
              },
              {
                title: "Table",
                dataIndex: "table",
                render: (v: string) => <Tag>{v}</Tag>,
                width: 140,
              },
              {
                title: "Rows Examined",
                dataIndex: "rowsExamined",
                render: (v: number) => formatNumber(v),
                width: 130,
              },
              {
                title: "Time",
                dataIndex: "timestamp",
                render: (v: string) => formatRelativeTime(v),
                width: 140,
              },
            ]}
          />
        </Space>
      ),
    },
    {
      key: "backups",
      label: (
        <span>
          <CloudDownloadOutlined /> Backups
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleTriggerBackup}
            >
              Trigger Backup
            </Button>
          </div>
          <Table
            dataSource={mockBackups as unknown as DatabaseBackup[]}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Backup Name",
                dataIndex: "name",
                render: (v: string) => (
                  <Typography.Text code style={{ fontSize: 12 }}>
                    {v}
                  </Typography.Text>
                ),
              },
              {
                title: "Type",
                dataIndex: "type",
                render: (v: string) => (
                  <Tag color={v === "full" ? "purple" : "blue"}>{v}</Tag>
                ),
                width: 110,
              },
              {
                title: "Created",
                dataIndex: "createdAt",
                render: (v: string) => formatTimestamp(v),
                width: 180,
              },
              {
                title: "Size",
                dataIndex: "sizeGB",
                render: (v: number) => `${v} GB`,
                width: 90,
              },
              {
                title: "Status",
                dataIndex: "status",
                render: (v: string) => <Tag color={getStatusColor(v)}>{v.replace("_", " ")}</Tag>,
                width: 120,
              },
              {
                title: "Actions",
                key: "actions",
                width: 180,
                render: (_: unknown, record: DatabaseBackup) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      disabled={record.status !== "completed"}
                    >
                      Download
                    </Button>
                    <Popconfirm
                      title="Restore this backup?"
                      description="This will replace the current database."
                      okText="Restore"
                      okType="danger"
                    >
                      <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        danger
                        disabled={record.status !== "completed"}
                      >
                        Restore
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
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
        Database Management
      </Typography.Title>

      <Card
        style={{ background: "#1A1528", border: "1px solid #2D2640" }}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          defaultActiveKey="schema"
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
