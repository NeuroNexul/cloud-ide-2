import netstat from "node-netstat";

const netstatP = (opts: netstat.Options) =>
  new Promise<netstat.ParsedItem[]>((resolve, reject) => {
    const res: netstat.ParsedItem[] = [];
    netstat(
      {
        ...opts,
        done: (err) => {
          if (err) return reject(err);
          return resolve(res);
        },
      },
      (data) => !!res.push(data)
    );
    return res;
  });

async function findFreePort({
  range = [8000, 8999],
}: {
  range?: [number, number];
}) {
  const usedPorts = (await netstatP({ filter: { protocol: "tcp" } })).map(
    ({ local }) => local.port
  );

  const [startPort, endPort] = range;
  let freePort;
  for (let port = startPort; port <= endPort; port++) {
    if (!usedPorts.includes(port)) {
      freePort = port;
      break;
    }
  }
  return freePort;
}

async function portTaken({ port }: { port: number }) {
  const usedPorts = (await netstatP({ filter: { protocol: "tcp" } })).map(
    ({ local }) => local.port
  );
  return usedPorts.includes(port);
}

export { findFreePort, portTaken };
