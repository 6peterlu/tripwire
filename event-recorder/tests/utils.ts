import prisma, { MetricType, UserStatusState } from "shared-utils";
import { Event } from "../src/receiveEvent";

export async function setupDefaultCustomer() {
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
  await prisma.userStatus.create({
    data: {
      state: UserStatusState.ACTIVE,
      status: "UNKNOWN",
      priority: 0,
      customer: {
        connect: {
          customerID: customer.customerID,
        },
      },
      default: true,
    },
  });
  return customer;
}

export async function createCountMetric({
  customerID,
  eventType,
  timeWindowSeconds,
  name,
}: {
  customerID: string;
  eventType: string;
  timeWindowSeconds: number;
  name: string;
}) {
  const createdMetric = await prisma.metric.create({
    data: {
      metricName: name,
      customerID: customerID,
      metricDefinition: {
        eventType: eventType,
        conditions: [],
        timeWindowSeconds: timeWindowSeconds,
      },
      metricType: MetricType.COUNT,
    },
  });
  return createdMetric;
}

export async function cleanupDatabaseRecords({
  customerID,
}: {
  customerID: string;
}) {
  const users = await prisma.user.findMany({
    where: {
      customerID: customerID,
    },
  });
  await prisma.event.deleteMany({
    where: {
      userID: {
        in: users.map((user) => user.userID),
      },
    },
  });
  await prisma.userMetricValue.deleteMany({
    where: {
      userID: {
        in: users.map((user) => user.userID),
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      customerID: customerID,
    },
  });
  await prisma.apiKey.deleteMany({
    where: {
      customerID: customerID,
    },
  });
  await prisma.metric.deleteMany({
    where: {
      customerID: customerID,
    },
  });
  await prisma.userStatus.deleteMany({
    where: {
      customerID: customerID,
    },
  });
  await prisma.customer.deleteMany({
    where: {
      customerID: customerID,
    },
  });
}

export function expect_toBeDefined<T>(arg: T): asserts arg is NonNullable<T> {
  expect(arg).toBeDefined();
}

export function generateEvent({
  eventType,
  eventData,
  userID,
  timestamp,
}: {
  eventType: string;
  eventData: any;
  userID: string;
  timestamp?: Date;
}): Event {
  return {
    eventType: eventType,
    eventData: eventData,
    userID: userID,
    timestamp: timestamp ? timestamp : new Date(),
  };
}
