import Renderer from "./renderer";
import { listContainers } from "@/functions/list_containers";

export const revalidate = 0; // Disable caching for this page

export default async function Home() {
  const containers = await listContainers();

  return <Renderer containers={containers} />;
}
