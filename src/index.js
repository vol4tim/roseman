import express from "express";
// import net from "net";
import cors from "cors";
import Socket from "socket.io";
import createServer from "./server";
import db from "./models/db";
import raas from "./modules/raas/route";
import config from "./config";
import logger from "./services/logger";

import worker from "./services/worker";
import module from "./modules/raas";

const app = express();
const server = createServer(app);
const io = Socket(server);
app.use(cors());

app.use("/api/raas", raas);

// const worker = net.createServer();
// worker.on("connection", (socket) => {
//   let buffered = "";
//   function processReceived() {
//     let received = buffered.split("\n");
//     while (received.length > 1) {
//       try {
//         const msg = JSON.parse(received[0]);
//         if (
//           Object.prototype.hasOwnProperty.call(msg, "cmd") &&
//           msg.cmd === "new_item"
//         ) {
//           io.emit("update", msg.data);
//         }
//       } catch (_) {
//         if (config.DEBUG) {
//           logger.warn(`bad msg: ${received[0]}`);
//         }
//       }
//       buffered = received.slice(1).join("\n");
//       received = buffered.split("\n");
//     }
//   }
//   socket.on("data", (msg) => {
//     buffered += msg;
//     processReceived();
//   });
//   socket.on("error", function (err) {
//     if (config.DEBUG) {
//       logger.warn(`error connect: ${err}`);
//     }
//   });
// });

let work = false;
setInterval(() => {
  if (!work) {
    work = true;
    worker(module, (item) => {
      io.emit("update", item);
    })
      .then(() => {
        work = false;
      })
      .catch(() => {
        work = false;
      });
  }
}, 5000);

db.sequelize.sync().then(() => {
  server.listen(config.PORT, config.HOST, () => {
    logger.info("Web listening " + config.HOST + " on port " + config.PORT);
    // worker.listen(config.PORT_WORKER, () => {
    //   logger.info("Worker listening on port " + config.PORT_WORKER);
    // });
  });
});
