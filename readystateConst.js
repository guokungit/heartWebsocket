// webscket的连接状态
export const WebSocketState = {
  CONNECTING: 0, // 连接中
  OPEN: 1, // 已打开
  CLOSING: 2, // 正在关闭
  CLOSED: 3, // 已关闭
};
// websocket的心跳检测间隔 5000 ms
export const HEARTBEAT_INTERVAL = 5000;

