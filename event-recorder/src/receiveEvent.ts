import { getDefaultStatusForCustomer } from "./utils/customer";
import prisma from "shared-utils";
import { Chance } from "chance";
import { eventMatchesMetric, processMetric } from "./utils/metrics";
import { generateNUUIDs } from "./utils/uuid";
import { processRulesForEvent } from "./receiveEventGeneric";
// eventually, this will receive events via api call

export const EVENT_TYPES = ["SEND_MESSAGE", "LOGIN", "LOGOUT", "VIEW_THREAD"];

// list of random UUIDs
export const USER_IDS = generateNUUIDs(100);

export type Event = {
  eventType: string;
  timestamp: Date;
  eventData: any;
  userID: string;
};

function generateSendMessageEvent(userID: string): Event {
  const chance = new Chance();
  return {
    eventType: "SEND_MESSAGE",
    timestamp: new Date(),
    eventData: {
      numRecipients: chance.integer({ min: 1, max: 10 }),
      attachmentSizeBytes: chance.integer({ min: 0, max: 1000000 }),
    },
    userID,
  };
}

function generateEvent(): Event {
  // choose random event type from EVENT_TYPES
  const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  // generate random userID
  const userID = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
  if (eventType === "SEND_MESSAGE") {
    return generateSendMessageEvent(userID);
  }
  return {
    eventType,
    timestamp: new Date(),
    eventData: {},
    userID,
  };
}

export async function writeEvent(event: Event, customerID: string) {
  // TODO: error handling
  const customer = await prisma.customer.findUnique({
    where: {
      customerID: customerID,
    },
  });
  if (!customer) {
    throw new Error(`writeEvent: Customer ${customerID} not found.`);
  }

  const allUsers = await prisma.user.findMany();

  // note that events contain the customer user id, not the internal user id.
  // the internal user id is never outwardly exposed to the customer.
  const customerUserID = event.userID;
  let user = await prisma.user.findUnique({
    where: {
      customerID_customerUserID: {
        customerID: customerID,
        customerUserID: customerUserID,
      },
    },
  });
  const defaultStatus = await getDefaultStatusForCustomer(customerID);

  // create user with default status if it doesn't exist
  if (!user) {
    user = await prisma.user.create({
      data: {
        customerUserID: customerUserID,
        customer: {
          connect: {
            customerID: customerID,
          },
        },
        status: {
          connect: {
            statusID: defaultStatus.statusID,
          },
        },
      },
    });
  }
  const newEvent = await prisma.event.create({
    data: {
      eventType: event.eventType,
      timestamp: event.timestamp,
      eventData: event.eventData,
      user: {
        connect: {
          userID: user.userID,
        },
      },
    },
  });
  return newEvent;
}

async function writeMetrics(event: Event, customerID: string) {
  // TODO: write metric to database
  const metrics = await prisma.metric.findMany({
    where: {
      customerID: customerID,
    },
  });
  const matchingMetrics = metrics.filter((metric) =>
    eventMatchesMetric(event, metric)
  );
  for (const metric of matchingMetrics) {
    await processMetric(event, metric);
  }
}

async function receiveEvent() {
  const event = generateEvent();
  const defaultCustomer = await prisma.customer.findFirstOrThrow();
  const newEvent = await writeEvent(event, defaultCustomer.customerID);
  // await writeMetrics(event, defaultCustomer.customerID);
  await processRulesForEvent({
    event: newEvent,
    customerID: defaultCustomer.customerID,
  });
}

export async function startEventLoop() {
  setInterval(receiveEvent, 100);
}
