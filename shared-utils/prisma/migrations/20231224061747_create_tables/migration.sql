-- CreateEnum
CREATE TYPE "UserStatusState" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateTable
CREATE TABLE "Customer" (
    "customerID" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerID")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "key" TEXT NOT NULL,
    "keyID" TEXT NOT NULL,
    "customerID" TEXT NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("keyID")
);

-- CreateTable
CREATE TABLE "UserStatus" (
    "customerID" TEXT NOT NULL,
    "statusID" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "state" "UserStatusState" NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "UserStatus_pkey" PRIMARY KEY ("statusID")
);

-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL,
    "customerID" TEXT NOT NULL,
    "statusID" TEXT NOT NULL,
    "webhook" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Event" (
    "eventID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eventID")
);

-- CreateTable
CREATE TABLE "Metric" (
    "metricID" TEXT NOT NULL,
    "metricDefinition" JSONB NOT NULL,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("metricID")
);

-- CreateTable
CREATE TABLE "UserMetricDatastore" (
    "userID" TEXT NOT NULL,
    "metricID" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "UserMetricDatastore_pkey" PRIMARY KEY ("userID","metricID")
);

-- CreateTable
CREATE TABLE "EventMetricDependency" (
    "eventID" TEXT NOT NULL,
    "metricID" TEXT NOT NULL,

    CONSTRAINT "EventMetricDependency_pkey" PRIMARY KEY ("eventID","metricID")
);

-- CreateTable
CREATE TABLE "RuleAction" (
    "customerID" TEXT NOT NULL,
    "ruleActionID" TEXT NOT NULL,
    "webhookData" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "userStatusID" TEXT,

    CONSTRAINT "RuleAction_pkey" PRIMARY KEY ("ruleActionID")
);

-- CreateTable
CREATE TABLE "Rule" (
    "ruleID" TEXT NOT NULL,
    "metricID" TEXT NOT NULL,
    "ruleDefinition" JSONB NOT NULL,
    "ruleActionID" TEXT,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("ruleID")
);

-- CreateTable
CREATE TABLE "UserStatusUpdate" (
    "userStatusUpdateID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "statusID" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "UserStatusUpdate_pkey" PRIMARY KEY ("userStatusUpdateID")
);

-- CreateTable
CREATE TABLE "BanRuleUserStatusUpdateLinkage" (
    "ruleID" TEXT NOT NULL,
    "userStatusUpdateID" TEXT NOT NULL,

    CONSTRAINT "BanRuleUserStatusUpdateLinkage_pkey" PRIMARY KEY ("ruleID","userStatusUpdateID")
);

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatus" ADD CONSTRAINT "UserStatus_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_statusID_fkey" FOREIGN KEY ("statusID") REFERENCES "UserStatus"("statusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMetricDatastore" ADD CONSTRAINT "UserMetricDatastore_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMetricDatastore" ADD CONSTRAINT "UserMetricDatastore_metricID_fkey" FOREIGN KEY ("metricID") REFERENCES "Metric"("metricID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMetricDependency" ADD CONSTRAINT "EventMetricDependency_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMetricDependency" ADD CONSTRAINT "EventMetricDependency_metricID_fkey" FOREIGN KEY ("metricID") REFERENCES "Metric"("metricID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleAction" ADD CONSTRAINT "RuleAction_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleAction" ADD CONSTRAINT "RuleAction_userStatusID_fkey" FOREIGN KEY ("userStatusID") REFERENCES "UserStatus"("statusID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_metricID_fkey" FOREIGN KEY ("metricID") REFERENCES "Metric"("metricID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_ruleActionID_fkey" FOREIGN KEY ("ruleActionID") REFERENCES "RuleAction"("ruleActionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatusUpdate" ADD CONSTRAINT "UserStatusUpdate_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatusUpdate" ADD CONSTRAINT "UserStatusUpdate_statusID_fkey" FOREIGN KEY ("statusID") REFERENCES "UserStatus"("statusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanRuleUserStatusUpdateLinkage" ADD CONSTRAINT "BanRuleUserStatusUpdateLinkage_ruleID_fkey" FOREIGN KEY ("ruleID") REFERENCES "Rule"("ruleID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanRuleUserStatusUpdateLinkage" ADD CONSTRAINT "BanRuleUserStatusUpdateLinkage_userStatusUpdateID_fkey" FOREIGN KEY ("userStatusUpdateID") REFERENCES "UserStatusUpdate"("userStatusUpdateID") ON DELETE RESTRICT ON UPDATE CASCADE;
