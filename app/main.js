const fs = require("fs");
const net = require("net");

const server = net.createServer((socket) => {
  // Request
  socket.on("data", (data) => {
    const request = data.toString();
    const [method, url, protocol] = request[0].split(" ");
    const headers = request.split("\r\n");

    if (url == "/") { // GET
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.includes("/echo")) { // GET echo endpoint
      const content = url.split("/echo/")[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n\r\n`
      );
    } else if (url.startsWith("/files/") && method === "GET") { // GET file endpoint
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
    } else if (url == "/user-agent") { // GET user agent endpoint
      const userAgent = headers[2].split("User-Agent: ")[1];
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
      );
    } else if (url.startsWith("/files/") && method === "POST"){
      const filename = process.argv[3] + "/" + url.substring(7);

      const req = data.toString().split("\r\n");
      const body = req[req.length -1];
      fs.writeFileSync(filename, body);
      socket.write(`HTTP/1.1 201 CREATED\r\n\r\n`);
    } else { // GET NOT FOUND
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
