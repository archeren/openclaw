import { s as resolveAgentWorkspaceDir } from "../../agent-scope-CiUx4u3k.js";
import { t as createSubsystemLogger } from "../../subsystem-CGE2Gr4r.js";
import { isGatewayStartupEvent } from "../../subsystem-CGE2Gr4r.js";
import fs from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";

const log = createSubsystemLogger("git-remote-guard");
const EXPECTED_REMOTE = "https://github.com/auroradanier/claw-alpha.git";
const GIT_DIR = "/home/ubuntu/.openclaw/.git";

const checkGitRemote = async (event) => {
    if (!isGatewayStartupEvent(event)) return;
    
    try {
        // Check if .git directory exists
        try {
            await fs.access(GIT_DIR);
        } catch {
            log.warn("No .git directory found at", GIT_DIR);
            return;
        }

        // Get current remote URL
        let remote;
        try {
            remote = execSync("git remote get-url origin", {
                cwd: "/home/ubuntu/.openclaw",
                encoding: "utf8",
                stdio: ["pipe", "pipe", "pipe"]
            }).trim();
        } catch (error) {
            log.warn("Could not read git remote");
            return;
        }

        // Validate remote matches expected
        if (remote !== EXPECTED_REMOTE) {
            log.error("");
            log.error("🚨 CRITICAL: Git remote mismatch detected!");
            log.error("");
            log.error("Expected:", EXPECTED_REMOTE);
            log.error("Found:   ", remote);
            log.error("");
            log.error("This protects against working on wrong repository.");
            log.error("");
            log.error("To fix:");
            log.error("  cd /home/ubuntu/.openclaw");
            log.error("  git remote set-url origin", EXPECTED_REMOTE);
            log.error("");
            
            // Write alert file
            const workspaceDir = "/home/ubuntu/.openclaw/workspace";
            const flagFile = path.join(workspaceDir, ".GIT_REMOTE_MISMATCH");
            await fs.writeFile(flagFile, 
                `Git Remote Mismatch Detected\n\n` +
                `Expected: ${EXPECTED_REMOTE}\n` +
                `Found: ${remote}\n\n` +
                `Fix: git remote set-url origin ${EXPECTED_REMOTE}\n`
            );
            log.error("📄 Alert file created:", flagFile);
        } else {
            log.info("✅ Git remote guard: OK");
            
            // Clean up alert file if exists
            const workspaceDir = "/home/ubuntu/.openclaw/workspace";
            const flagFile = path.join(workspaceDir, ".GIT_REMOTE_MISMATCH");
            try {
                await fs.unlink(flagFile);
            } catch {
                // Ignore if doesn't exist
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log.warn("Git remote guard error:", message);
    }
};

export { checkGitRemote as default };
