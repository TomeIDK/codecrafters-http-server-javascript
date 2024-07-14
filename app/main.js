const net = require("net");

const server = net.createServer((socket) => {

    // Request
  socket.on("data", (data) => {
    const request = data.toString();
    const url = request.split(' ')[1];

    if (url == "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.includes("/echo")) {
        const content = url.split('/echo/')[1];
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n\r\n`
        );
    } else {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    }

    socket.end();
  });

  // Closing
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
