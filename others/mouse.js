const fs = require("fs");
const WebSocket = require("ws");
const url = require("url");
// 创建一个WebSocket服务器
const wss = new WebSocket.Server({ port: 8080 });
let connections = {};
// 监听连接事件
wss.on("connection", (ws, req) => {
  // 解析 URL 参数
  const query = url.parse(req.url, true).query;
  const userId = query.userId;
  console.log("客户端已连接", userId);
  // 将 WebSocket 连接与 userId 关联起来
  connections[userId] = ws;
  let collaborativeMouseTrailList = [];

  // 鼠标轨迹同步
  setInterval(() => {
    console.log('collaborativeMouseTrailList',collaborativeMouseTrailList)
    if(collaborativeMouseTrailList.length > 0){
        Object.keys(connections).forEach((item) => {
            connections[item].send(
              JSON.stringify({ cmdType: "mouseMove", collaborativeMouseTrailList })
            );
          });
    }
    
    collaborativeMouseTrailList = [];
  }, 30);
  // 同步成员信息
  setTimeout(() => {
    let userIds = Object.keys(connections) || [];
    const color = ["red", "yellow", "blue", "green", "pink"];
    let data = userIds.map((item, index) => {
      return {
        userId: item,
        userName: item,
        mouseLabelColor: color[index],
      };
    });
    Object.keys(connections).forEach((item) => {
      let temp = JSON.stringify({
        cmdType: "collaborativeMemberChanges",
        collaborativeMemberList: data,
      });
      console.log('temp',temp)
      connections[item].send(temp);
    });
  }, 2000);
  ws.on("message", function incoming(message) {
    console.log("接收到前端发送的消息：", message.toString("utf-8"));

    if (message.toString("utf-8") === "ping") {
      ws.send("pong");
    } else {
      const { userId, x, y } = JSON.parse(message.toString("utf-8"));
      collaborativeMouseTrailList.push({ userId, x, y });
      // const {cmdType} = JSON.parse(message);
      // switch(cmdType){
      //     case 'mouseMove': (()=>{
      //         const data = {}

      //         ws.send(JSON.stringify(data))
      //     })();break;
      //     case 'collaborativeMemberChanges': (()=>{})();break;
      // }
      // switch()
      // Object.keys(connections).forEach(item=>{
      //     if(item !== userId){
      //         const data = JSON.stringify({
      //             cmdType: 'mouseMove',
      //             collaborativeMouseTrailList: [{}]
      //         })
      //         connections.send(data)
      //     }
      // })
    }
  });
  ws.on("close", () => {
    console.log(`WebSocket connection closed for userId: ${userId}`);
    // 删除关闭的 WebSocket 连接
    delete connections[userId];
  });
});
