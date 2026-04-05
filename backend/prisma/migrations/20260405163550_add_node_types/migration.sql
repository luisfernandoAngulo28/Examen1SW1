-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('ACTION', 'INITIAL', 'FINAL', 'DECISION', 'FORK', 'JOIN');

-- AlterTable
ALTER TABLE "policy_edges" ADD COLUMN     "condition_label" TEXT;

-- AlterTable
ALTER TABLE "policy_nodes" ADD COLUMN     "node_type" "NodeType" NOT NULL DEFAULT 'ACTION';
