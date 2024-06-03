// websocket-client.js
let wsUrl = 'ws://localhost:8080';
let socket = null;
// 心跳检测相关变量
const HEARTBEAT_INTERVAL = 5000; // 心跳间隔，例如5秒
let lastPing = Date.now();
// interval的句柄
let sendPingInterval;
let watchConnectIngerval;

function connectWebsocket(){
    // 创建一个WebSocket实例
    socket = new WebSocket(wsUrl);
    console.log('socket====> ',socket)
    // 监听WebSocket事件
    socket.onopen = function (event) {
        console.log('WebSocket 连接已打开',event);
        // 可以在这里发送初始化消息或其他逻辑
    };


    socket.onclose = function (event) {
        console.log('WebSocket 连接已关闭',event);
        // 可以在这里执行清理逻辑或重新连接
        // socket = null;
    };

    socket.onerror = function (error) {
        console.error('WebSocket 出现错误:', error);
        socket = null;
        // 处理错误情况
        reconnectWebsocket()
    };
     // 处理pong消息
     socket.onmessage = function(event) {
        const data = event.data;
        console.log('来自服务端的：pong')
        if (data === 'pong') {
            // 更新最后ping的时间戳
            lastPing = Date.now();
        } else {
            // 处理其他消息
            // console.log('websocket 收到消息', data)
        }
    };
    // 检测连接是否断开
    watchConnectIngerval = setInterval(() => {
        // 设置心跳检测
        sendPing();
        console.log('socket',socket, socket.readyState)
        if (socket && socket.readyState !== 1) {
            console.error('WebSocket 连接已断开');
            // 这里可以重新连接WebSocket
            reconnectWebsocket();
            return;
        }

        const now = Date.now();
       console.log('时间时', now,lastPing,HEARTBEAT_INTERVAL)

        if (now - lastPing > (2 * HEARTBEAT_INTERVAL)) {
            console.error('未收到pong响应，可能连接已断开');
            // 重新连接WebSocket
            reconnectWebsocket();
        }
    }, HEARTBEAT_INTERVAL * 2);
    
}

function reconnectWebsocket(){
    reconnecttimer = setTimeout(()=>{console.log('重新发起连接');clearInterval(watchConnectIngerval); connectWebsocket();clearTimeout(reconnecttimer)},5);
}
// 暴露发送消息的方法（可选）
function sendMessage(data) {
    
    if (socket && socket.readyState === 1) {
        console.log('sender: ', data)
        socket.send(data);
    } else {
        console.error('WebSocket 连接未打开，无法发送消息，重新发起连接');
        reconnectWebsocket();
    }
}

// 发送心跳消息
function sendPing() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send('ping');
        lastPing = Date.now();
    }
}

// connectWebsocket()
// 导出sendMessage函数，以便在其他文件中使用
module.exports = { sendMessage,connectWebsocket };