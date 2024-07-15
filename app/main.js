const fs = require("fs");
const net = require("net");

const server = net.createServer((socket) => {
  // Request
  socket.on("data", (data) => {
    const request = data.toString();
    const url = request.split(" ")[1];
    const method = request.split(" ")[0];
    const headers = request.split("\r\n");

    if (url == "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.includes("/echo")) {
      const content = url.split("/echo/")[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n\r\n`
      );
    } else if (url.startsWith("/files/") && method === "GET") {
      const directory = process.argv[3];
      const filename = url.split("/files")[1];
      if (fs.existsSync(`${directory}/${filename}`)) {
        const content = fs.readFileSync(`${directory}/${filename}`).toString();
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n`
        );
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else if (url == "/user-agent") {
      const userAgent = headers[2].split("User-Agent: ")[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
      );
    } else if (
      url.startsWith("/files/") &&
      method === "POST"
    ) {
      const fileName = process.argv[3] + "/" + url.substring(7);

      const body = request[request.length - 1]
      fs.writeFileSync(fileName, body);
      socket.write("HTTP/1.1 201 CREATED\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });

  // Closing
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
