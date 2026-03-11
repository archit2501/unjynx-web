// ============================================================
// R7 - Channel Providers Page
// ============================================================

import {
  Typography,
  Space,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
  Progress,
  Statistic,
} from "antd";
import {
  MessageOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { StatusIndicator } from "@/components/common/StatusIndicator";
import { MetricPanel } from "@/components/charts/MetricPanel";
import type {
  TelegramBotStatus,
  WhatsAppProviderStatus,
  InstagramStatus,
  SmsProviderStatus,
  EmailProviderStatus,
  PushProviderStatus,
  SlackBotStatus,
  DiscordBotStatus,
} from "@/types";
import { COLORS, CHANNEL_INFO } from "@/utils/constants";
import { formatNumber, formatPercent } from "@/utils/formatters";

// --- Mock data ---
const telegramStatus: TelegramBotStatus = {
  botUsername: "@UnjynxBot",
  isOnline: true,
  webhookUrl: "https://api.unjynx.com/webhooks/telegram",
  totalMessages: 142000,
  activeChats: 1240,
  lastActivity: new Date().toISOString(),
};

const whatsappStatus: WhatsAppProviderStatus = {
  bspHealth: "healthy",
  approvedTemplates: 12,
  pendingTemplates: 2,
  messageQuota: 10000,
  messagesUsed: 4200,
  qualityRating: "green",
};

const instagramStatus: InstagramStatus = {
  apiStatus: "degraded",
  activeWindows: 85,
  pendingFriendRequests: 42,
  connectedAccounts: 320,
};

const smsStatus: SmsProviderStatus = {
  dltRegistered: true,
  approvedTemplates: 8,
  pendingTemplates: 1,
  dndFilterRate: 12.5,
  dailyQuota: 5000,
  dailyUsed: 1800,
};

const emailStatus: EmailProviderStatus = {
  domainReputation: 96,
  bounceRate: 1.2,
  spamComplaintRate: 0.02,
  senderScore: 98,
  dailySent: 3400,
};

const pushStatus: PushProviderStatus = {
  tokenValidityRate: 94.2,
  deliverySuccessRate: 99.1,
  totalRegistered: 8400,
  activeTokens: 7920,
};

const slackStatus: SlackBotStatus = {
  workspaceConnections: 24,
  botStatus: "healthy",
  totalChannels: 86,
  messagesSent: 12400,
};

const discordStatus: DiscordBotStatus = {
  serverConnections: 12,
  botStatus: "healthy",
  totalGuilds: 12,
  messagesSent: 4800,
};

const qualityColorMap = { green: "#10B981", yellow: "#F59E0B", red: "#EF4444" };

interface ProviderCardProps {
  readonly channel: string;
  readonly children: React.ReactNode;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ channel, children }) => {
  const info = CHANNEL_INFO[channel];
  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: info?.color ?? COLORS.violet,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageOutlined style={{ color: "#fff", fontSize: 14 }} />
          </div>
          <div>
            <Typography.Text strong style={{ color: COLORS.white }}>
              {info?.label ?? channel}
            </Typography.Text>
            <Typography.Text
              style={{ color: "#6B7280", fontSize: 11, display: "block" }}
            >
              {info?.provider ?? ""}
            </Typography.Text>
          </div>
        </Space>
      }
      style={{
        background: "#1A1528",
        border: "1px solid #2D2640",
        height: "100%",
      }}
      styles={{
        header: { borderBottom: "1px solid #2D2640" },
        body: { padding: 16 },
      }}
    >
      {children}
    </Card>
  );
};

export const ChannelProvidersPage: React.FC = () => (
  <Space direction="vertical" size={24} style={{ width: "100%" }}>
    <Typography.Title level={3} style={{ margin: 0, color: COLORS.white }}>
      Channel Providers
    </Typography.Title>

    <Row gutter={[16, 16]}>
      {/* Telegram */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="telegram">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Bot">
                <Typography.Text code>{telegramStatus.botUsername}</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusIndicator
                  status={telegramStatus.isOnline ? "healthy" : "down"}
                  size="small"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Webhook">
                <Typography.Text
                  code
                  ellipsis
                  style={{ maxWidth: 200, fontSize: 11, display: "block" }}
                >
                  {telegramStatus.webhookUrl}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Messages</span>}
                  value={formatNumber(telegramStatus.totalMessages)}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Active Chats</span>}
                  value={formatNumber(telegramStatus.activeChats)}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
            </Row>
          </Space>
        </ProviderCard>
      </Col>

      {/* WhatsApp */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="whatsapp">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="BSP Health">
                <StatusIndicator status={whatsappStatus.bspHealth} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="Quality">
                <Tag
                  color={qualityColorMap[whatsappStatus.qualityRating]}
                  style={{ textTransform: "uppercase" }}
                >
                  {whatsappStatus.qualityRating}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Approved</span>}
                  value={whatsappStatus.approvedTemplates}
                  prefix={<CheckCircleOutlined style={{ color: COLORS.healthy }} />}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Pending</span>}
                  value={whatsappStatus.pendingTemplates}
                  prefix={<WarningOutlined style={{ color: COLORS.warning }} />}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Quota Used</span>}
                  value={formatPercent((whatsappStatus.messagesUsed / whatsappStatus.messageQuota) * 100, 0)}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
            </Row>
            <Progress
              percent={Math.round((whatsappStatus.messagesUsed / whatsappStatus.messageQuota) * 100)}
              strokeColor={CHANNEL_INFO.whatsapp.color}
              trailColor="#2D2640"
              format={() => `${whatsappStatus.messagesUsed}/${whatsappStatus.messageQuota}`}
            />
          </Space>
        </ProviderCard>
      </Col>

      {/* Instagram */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="instagram">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="API Status">
                <StatusIndicator status={instagramStatus.apiStatus} size="small" />
              </Descriptions.Item>
            </Descriptions>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Active Windows</span>}
                  value={instagramStatus.activeWindows}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Pending Requests</span>}
                  value={instagramStatus.pendingFriendRequests}
                  valueStyle={{ color: COLORS.warning, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Connected</span>}
                  value={instagramStatus.connectedAccounts}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
            </Row>
          </Space>
        </ProviderCard>
      </Col>

      {/* SMS */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="sms">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="DLT Registration">
                <Tag color={smsStatus.dltRegistered ? "success" : "error"}>
                  {smsStatus.dltRegistered ? "Registered" : "Not Registered"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="DND Filter Rate">
                <Tag color={smsStatus.dndFilterRate > 20 ? "error" : "warning"}>
                  {formatPercent(smsStatus.dndFilterRate)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Approved TPL</span>}
                  value={smsStatus.approvedTemplates}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Pending TPL</span>}
                  value={smsStatus.pendingTemplates}
                  valueStyle={{ color: COLORS.warning, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Daily Quota</span>}
                  value={`${smsStatus.dailyUsed}/${smsStatus.dailyQuota}`}
                  valueStyle={{ color: COLORS.white, fontSize: 14 }}
                />
              </Col>
            </Row>
          </Space>
        </ProviderCard>
      </Col>

      {/* Email */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="email">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={6}>
                <MetricPanel
                  title="Reputation"
                  value={emailStatus.domainReputation}
                  suffix="/100"
                  progress={emailStatus.domainReputation}
                  thresholds={{ warning: 80, critical: 60, inverted: true }}
                />
              </Col>
              <Col span={6}>
                <MetricPanel
                  title="Bounce Rate"
                  value={emailStatus.bounceRate}
                  suffix="%"
                  progress={emailStatus.bounceRate}
                  thresholds={{ warning: 3, critical: 5 }}
                />
              </Col>
              <Col span={6}>
                <MetricPanel
                  title="Spam Rate"
                  value={emailStatus.spamComplaintRate}
                  suffix="%"
                  progress={emailStatus.spamComplaintRate * 10}
                  thresholds={{ warning: 1, critical: 5 }}
                />
              </Col>
              <Col span={6}>
                <MetricPanel
                  title="Sender Score"
                  value={emailStatus.senderScore}
                  suffix="/100"
                  progress={emailStatus.senderScore}
                  thresholds={{ warning: 80, critical: 60, inverted: true }}
                />
              </Col>
            </Row>
            <Statistic
              title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Sent Today</span>}
              value={formatNumber(emailStatus.dailySent)}
              valueStyle={{ color: COLORS.white, fontSize: 16 }}
            />
          </Space>
        </ProviderCard>
      </Col>

      {/* Push */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="push">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={12}>
                <MetricPanel
                  title="Token Validity"
                  value={pushStatus.tokenValidityRate}
                  suffix="%"
                  progress={pushStatus.tokenValidityRate}
                  thresholds={{ warning: 90, critical: 80, inverted: true }}
                />
              </Col>
              <Col span={12}>
                <MetricPanel
                  title="Delivery Success"
                  value={pushStatus.deliverySuccessRate}
                  suffix="%"
                  progress={pushStatus.deliverySuccessRate}
                  thresholds={{ warning: 95, critical: 90, inverted: true }}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Total Registered</span>}
                  value={formatNumber(pushStatus.totalRegistered)}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Active Tokens</span>}
                  value={formatNumber(pushStatus.activeTokens)}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
            </Row>
          </Space>
        </ProviderCard>
      </Col>

      {/* Slack */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="slack">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Bot Status">
                <StatusIndicator status={slackStatus.botStatus} size="small" />
              </Descriptions.Item>
            </Descriptions>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Workspaces</span>}
                  value={slackStatus.workspaceConnections}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Channels</span>}
                  value={slackStatus.totalChannels}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Messages</span>}
                  value={formatNumber(slackStatus.messagesSent)}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
            </Row>
          </Space>
        </ProviderCard>
      </Col>

      {/* Discord */}
      <Col xs={24} lg={12}>
        <ProviderCard channel="discord">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Bot Status">
                <StatusIndicator status={discordStatus.botStatus} size="small" />
              </Descriptions.Item>
            </Descriptions>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Servers</span>}
                  value={discordStatus.serverConnections}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Guilds</span>}
                  value={discordStatus.totalGuilds}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={<span style={{ color: "#9CA3AF", fontSize: 11 }}>Messages</span>}
                  value={formatNumber(discordStatus.messagesSent)}
                  valueStyle={{ color: COLORS.white, fontSize: 16 }}
                />
              </Col>
            </Row>
          </Space>
        </ProviderCard>
      </Col>
    </Row>
  </Space>
);
