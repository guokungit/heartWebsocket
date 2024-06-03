// websocket-client.js
import { WebSocketState } from './readystateConst';

class WebSocketService {
  constructor(url, heartbeatInterval = 3000) {
    this.url = url;
    this.socket = null;
    this.lastPing = Date.now();
    this.heartbeatInterval = heartbeatInterval;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.listeners = {}; // 用来外侧加持事件所做
  }
  getUrl() {
    return this.url;
  }
  getSocket() {
    return this.socket;
  }
  connect() {
    // 创建一个WebSocket实例
    // console.log('发起连接');
    this.socket = new WebSocket(this.url);
    // 监听WebSocket事件
    this.socket.onopen = event => {
      // console.log('WebSocket 连接已打开', event);
      // 可以在这里发送初始化消息或其他逻辑
      this._notifyListeners('open');
        // 开始心跳检测
        this.startHeartbeat();
    };

    this.socket.onclose = event => {
      // console.error('WebSocket 连接已关闭', event);
      // 清除心跳检测
      this.stopHeartbeat();
      // 可以在这里执行清理逻辑或重新连接
      this.reconnectWebsocket();
    };

    this.socket.onerror = error => {
      // console.error('WebSocket 出现错误:', error);
      this._notifyListeners('error', error);
      // 清除心跳检测
      this.stopHeartbeat();
      // 重新连接
      this.reconnectWebsocket();
    };
    // 处理pong消息
    this.socket.onmessage = event => {
      const data = event.data || '';
      if (data === 'pong') {
        // 更新最后ping的时间戳
        // console.log('WebSocketService onmessage', data);
        // this._notifyListeners('message', event.data);
        this.lastPing = Date.now();
      } else {
        // 处理其他消息
        this._notifyListeners('message', event.data);
      }
    };

    return this.socket;
  }
  startHeartbeat() {
    // 设置心跳检测
    this.heartbeatTimer = setInterval(() => {
      // 发送ping
      this.watchWebsocketReadyState({
        funcOPEN: () => {
          this.socket.send('ping');
          this.lastPing = Date.now();
        },
      });
      const now = Date.now();
      if (now - this.lastPing > this.heartbeatInterval * 2) {
        // console.log('时间', now, this.lastPing);
        console.log('时间', now, this.lastPing);
        this.reconnectWebsocket();
      }
    }, this.heartbeatInterval);
  }
  stopHeartbeat() {
    console.log('stopHeartbeat');
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  _notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // 暴露发送消息的方法（可选）
  sendMessage(data) {
    this.watchWebsocketReadyState({
      funcOPEN: () => {
        this.socket.send(data);
      },
    });
  }
  // 重新连接websocket
  reconnectWebsocket() {
    console.log('reconnectWebsocket');
    this.reconnectTimer = setTimeout(() => {
      console.log('connect');
      this.connect();
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }, this.heartbeatInterval);
  }
  // // 状态区分函数
  watchWebsocketReadyState({
    funcCONNECTING = () => {},
    funcOPEN = () => {},
    funcCLOSING = () => {},
    funcCLOSED = () => {},
  }) {
    const state = this.socket.readyState;
    switch (state) {
      case WebSocketState.CONNECTING:
        funcCONNECTING();
        break;
      case WebSocketState.OPEN:
        funcOPEN();
        break;
      case WebSocketState.CLOSING:
        funcCLOSING();
        break;
      case WebSocketState.CLOSED:
        funcCLOSED();
        break;
      default:
    }
    return 1;
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.stopHeartbeat();
    }
    return 1;
  }
}
export default WebSocketService;
