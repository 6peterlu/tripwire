import { MetricType, PrismaClient, UserStatusState } from "@prisma/client";

const prisma = new PrismaClient();

// Script to seed data into db
// reset can be run with yarn workspace shared-utils prisma:reset
// reset will purge everything and then run seed
// just seeding can be run with yarn workspace shared-utils prisma:seed

async function main() {
  const customer = await prisma.customer.create({
    data: {},
  });
  await prisma.apiKey.create({
    data: {
      customer: {
        connect: {
          customerID: customer.customerID,
        },
      },
      key: "testkey",
    },
  });
  const unknownStatus = await prisma.userStatus.create({
    data: {
      state: UserStatusState.ACTIVE,
      status: "UNKNOWN",
      priority: 0,
      customerID: customer.customerID,
      default: true,
    },
  });
  const banStatus = await prisma.userStatus.create({
    data: {
      state: UserStatusState.ACTIVE,
      status: "BANNED",
      priority: 1,
      customerID: customer.customerID,
      default: false,
    },
  });

  await prisma.ruleAction.create({
    data: {
      name: "ban user",
      userStatusID: banStatus.statusID,
      webhookData: {},
      customerID: customer.customerID,
    },
  });

  await prisma.ruleAction.create({
    data: {
      name: "mark unknown",
      userStatusID: unknownStatus.statusID,
      webhookData: {},
      customerID: customer.customerID,
    },
  });
  await prisma.metric.createMany({
    data: [
      {
        metricName: "num messages sent in 30 minutes",
        customerID: customer.customerID,
        metricDefinition: {
          eventType: "SEND_MESSAGE",
          conditions: [],
          timeWindowSeconds: 1800,
        },
        metricType: MetricType.COUNT,
      },
      {
        metricName:
          "num messages sent with more than 5 recipients in 30 minutes",
        customerID: customer.customerID,
        metricDefinition: {
          eventType: "SEND_MESSAGE",
          conditions: [
            {
              transformFunction: {
                function: "IDENTITY",
                arguments: ["numRecipients"],
              },
              operator: "GREATER_THAN",
              value: 5,
            },
          ],
          timeWindowSeconds: 1800,
        },
        metricType: MetricType.COUNT,
      },
    ],
  });
}

main();
