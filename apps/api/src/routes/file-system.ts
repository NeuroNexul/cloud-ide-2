import { Router } from "express";
import * as FSExtra from "fs-extra";

const router: Router = Router();

// Get File with content and stats
router.get("/get", async (req, res) => {
  try {
    const path = req.query.path as string;
    const stats = await FSExtra.stat(path);
    if (stats.isDirectory()) {
      return res.status(200).json({ error: "Path is a directory" });
    } else {
      const content = await FSExtra.readFile(path, { encoding: "utf-8" });
      res.status(200).json({ content });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { path, content } = req.body;
    await FSExtra.writeFile(path, content || "", { encoding: "utf-8" });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
