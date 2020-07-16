import net from "net";
import config from "./config";
import worker from "./services/worker";
import db from "./models/db";
import module from "./modules/raas";

db.sequelize.sync().then(() => {
  const client = net.createConnection(config.PORT_WORKER);

  client.on("connect", function () {
    worker(module, (item) => {
      client.write(
        Buffer.from(
          JSON.stringify({
            cmd: "new_item",
            item,
          }) + "\n"
        )
      );
    })
      .then(() => {
        process.exit(0);
      })
      .catch(() => {
        process.exit(0);
      });
  });
});
