import prisma from "shared-utils";
import {
  cleanupDatabaseRecords,
  createCountMetric,
  expect_toBeDefined,
  setupDefaultCustomer,
} from "./utils";
import { Event, writeEvent } from "../src/receiveEvent";
import { v4 } from "uuid";
import { processMetric } from "../src/utils/metrics";
import { getDefaultStatusForCustomer } from "../src/utils/customer";

test("receiving first event for user creates user record", async () => {
  // set up
  const customer = await setupDefaultCustomer();
  // receive event
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: new Date(),
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: v4(),
  };
  await writeEvent(newEvent, customer.customerID);
  // check that the user was created
  const users = await prisma.user.findMany({
    where: {
      customerID: customer.customerID,
    },
  });
  expect(users.length).toBe(1);
  expect(users[0].customerUserID).toBe(newEvent.userID);
  // check that the user has default status
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  expect(users[0].statusID).toBe(defaultStatus.statusID);
  // translate customer user id to internal user id
  const userID = users[0].userID;
  // check that the event was created
  const events = await prisma.event.findMany({
    where: {
      userID: userID,
    },
  });
  expect(events.length).toBe(1);
  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("receiving second event for user doesn't create new user", async () => {
  // set up
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: new Date(),
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // receive event
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: new Date(),
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  await writeEvent(newEvent, customer.customerID);
  // check that the user was not created
  const users = await prisma.user.findMany({
    where: {
      customerID: customer.customerID,
    },
  });
  expect(users.length).toBe(1);
  // check that the event was created
  const events = await prisma.event.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(events.length).toBe(2);
  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing first count metric produces three windows", async () => {
  const customer = await setupDefaultCustomer();
  // receive event
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: new Date(),
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: v4(),
  };
  await writeEvent(newEvent, customer.customerID);
  // create metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: 1800,
    name: "test count metric",
  });
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were created
  const createdUser = await prisma.user.findUnique({
    where: {
      customerID_customerUserID: {
        customerID: customer.customerID,
        customerUserID: newEvent.userID,
      },
    },
  });
  expect_toBeDefined(createdUser);
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: createdUser.userID,
    },
  });
  expect(metricValues.length).toBe(3);
  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event starts when last event impact window ends", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: null,
      },
    ],
  });
  // receive event
  const newEventTime = new Date(
    eventTime.getTime() + metricWindowSeconds * 1000
  );
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were created
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(4);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(eventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    new Date(newEventTime.getTime() + metricWindowSeconds * 1000)
  );
  expect(endWindow.value).toBe(0);
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(firstValueWindow);
  expect(firstValueWindow.value).toBe(1);
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(secondValueWindow);
  expect(secondValueWindow.value).toBe(1);
  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event starts after last event impact window ends", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: null,
      },
    ],
  });
  // receive event
  const newEventTime = new Date(
    eventTime.getTime() + (metricWindowSeconds + 10) * 1000
  );
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were created
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(5);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(eventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    new Date(newEventTime.getTime() + metricWindowSeconds * 1000)
  );
  expect(endWindow.value).toBe(0);
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(firstValueWindow);
  expect(firstValueWindow.value).toBe(1);
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() === newEventTime.getTime()
  );
  expect_toBeDefined(secondValueWindow);
  expect(secondValueWindow.value).toBe(0);
  const thirdValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        new Date(newEventTime.getTime() + metricWindowSeconds * 1000).getTime()
  );
  expect_toBeDefined(thirdValueWindow);
  expect(thirdValueWindow.value).toBe(1);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event starts before last event impact window ends, new event impact window is later", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: null,
      },
    ],
  });
  // receive event
  const newEventTime = new Date(
    // note minus instead of plus to produce overlap
    eventTime.getTime() + (metricWindowSeconds - 10) * 1000
  );
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were created
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(5);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(eventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    new Date(newEventTime.getTime() + metricWindowSeconds * 1000)
  );
  expect(endWindow.value).toBe(0);
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() === newEventTime.getTime()
  );
  expect_toBeDefined(firstValueWindow);
  expect(firstValueWindow.value).toBe(1);
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(secondValueWindow);
  expect(secondValueWindow.value).toBe(2);
  const thirdValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(thirdValueWindow);
  expect(thirdValueWindow.value).toBe(1);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event starts before last event impact window ends, new event impact window ends before", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 2, // note this is set to 2 so we can check it easier in the test
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 2 * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(
          eventTime.getTime() + metricWindowSeconds * 2 * 1000
        ),
        endTime: null,
      },
    ],
  });
  // receive event
  const newEventTime = new Date(
    // new event occurs slightly after the original window to produce shifting
    eventTime.getTime() + 10 * 1000
  );
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were created
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(6);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(eventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    // should be unchanged
    new Date(eventTime.getTime() + metricWindowSeconds * 2 * 1000)
  );
  expect(endWindow.value).toBe(0);
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() === newEventTime.getTime()
  );
  expect_toBeDefined(firstValueWindow);
  expect(firstValueWindow.value).toBe(1);

  // the second and third windows should be incremented
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(secondValueWindow);
  expect(secondValueWindow.value).toBe(2);
  const thirdValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(thirdValueWindow);
  expect(thirdValueWindow.value).toBe(3);

  const fourthValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 2 * 1000
  );
  expect_toBeDefined(fourthValueWindow);
  expect(fourthValueWindow.value).toBe(2);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event starts before last event impact window ends, new event impact window ends before, and smaller windows in between are incremented", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(
          eventTime.getTime() + (metricWindowSeconds / 2) * 1000
        ),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 3,
        startTime: new Date(
          eventTime.getTime() + (metricWindowSeconds / 2) * 1000
        ),
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 2, // note this is set to 2 so we can check it easier in the test
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 2 * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(
          eventTime.getTime() + metricWindowSeconds * 2 * 1000
        ),
        endTime: null,
      },
    ],
  });
  // receive event
  const newEventTime = new Date(
    // new event occurs slightly after the original window to produce shifting
    eventTime.getTime() + 10 * 1000
  );
  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were created
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(7);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(eventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    // should be unchanged
    new Date(eventTime.getTime() + metricWindowSeconds * 2 * 1000)
  );
  expect(endWindow.value).toBe(0);
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() === newEventTime.getTime()
  );
  expect_toBeDefined(firstValueWindow);
  expect(firstValueWindow.value).toBe(1);

  // the second, third, and fourth windows should be incremented
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + (metricWindowSeconds / 2) * 1000
  );
  expect_toBeDefined(secondValueWindow);
  expect(secondValueWindow.value).toBe(2);
  const thirdValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() ===
        eventTime.getTime() + (metricWindowSeconds / 2) * 1000 &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(thirdValueWindow);
  expect(thirdValueWindow.value).toBe(4);
  const fourthValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(fourthValueWindow);
  expect(fourthValueWindow.value).toBe(3);

  const fifthValueWindow = metricValues.find(
    (metricValue) =>
      metricValue.startTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 2 * 1000
  );
  expect_toBeDefined(fifthValueWindow);
  expect(fifthValueWindow.value).toBe(2);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event directly overlaps with an old one", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: null,
      },
    ],
  });
  // receive event

  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: eventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were modified
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(3);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(eventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    new Date(eventTime.getTime() + metricWindowSeconds * 1000)
  );
  expect(endWindow.value).toBe(0);
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(firstValueWindow);
  // expect value to be incremented
  expect(firstValueWindow.value).toBe(2);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event starts before first window but ends after", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: null,
      },
    ],
  });
  // receive event

  const newEventTime = new Date(eventTime.getTime() - 10 * 1000);

  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were modified
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(5);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(newEventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    new Date(eventTime.getTime() + metricWindowSeconds * 1000)
  );
  expect(endWindow.value).toBe(0);

  // window that is created before the previous window
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() === eventTime.getTime()
  );
  expect_toBeDefined(firstValueWindow);
  // expect value to be incremented
  expect(firstValueWindow.value).toBe(1);

  // overlapping window
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(secondValueWindow);
  // expect value to be incremented
  expect(secondValueWindow.value).toBe(2);

  const thirdValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(thirdValueWindow);
  // expect value not to be incremented
  expect(thirdValueWindow.value).toBe(1);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event ends right when first window starts", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: null,
      },
    ],
  });
  // receive event

  const newEventTime = new Date(
    eventTime.getTime() - metricWindowSeconds * 1000
  );

  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were modified
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(4);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(newEventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    new Date(eventTime.getTime() + metricWindowSeconds * 1000)
  );
  expect(endWindow.value).toBe(0);

  // window that is created before the previous window
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() === eventTime.getTime()
  );
  expect_toBeDefined(firstValueWindow);
  // expect value to be incremented
  expect(firstValueWindow.value).toBe(1);

  // overlapping window
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(secondValueWindow);
  // expect value to be incremented
  expect(secondValueWindow.value).toBe(1);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("processing count metric: new event window ends before first window starts", async () => {
  // setup
  const customer = await setupDefaultCustomer();
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);
  const user = await prisma.user.create({
    data: {
      customerID: customer.customerID,
      customerUserID: v4(),
      statusID: defaultStatus.statusID,
    },
  });
  const eventTime = new Date("2021-01-01T00:00:00.000Z");
  const metricWindowSeconds = 1800;
  // create existing event
  await prisma.event.create({
    data: {
      eventType: "SEND_MESSAGE",
      timestamp: eventTime,
      eventData: {
        recipients: {
          to: ["test@example.com"],
        },
      },
      userID: user.userID,
    },
  });
  // create count metric
  const metric = await createCountMetric({
    customerID: customer.customerID,
    eventType: "SEND_MESSAGE",
    timeWindowSeconds: metricWindowSeconds,
    name: "test count metric",
  });
  // create metric windows
  await prisma.userMetricValue.createMany({
    data: [
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: null,
        endTime: eventTime,
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 1,
        startTime: eventTime,
        endTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
      },
      {
        userID: user.userID,
        metricID: metric.metricID,
        value: 0,
        startTime: new Date(eventTime.getTime() + metricWindowSeconds * 1000),
        endTime: null,
      },
    ],
  });
  // receive event

  const newEventTime = new Date(
    eventTime.getTime() - (metricWindowSeconds + 10) * 1000
  );

  const newEvent: Event = {
    eventType: "SEND_MESSAGE",
    timestamp: newEventTime,
    eventData: {
      recipients: {
        to: ["test@example.com"],
      },
    },
    userID: user.customerUserID,
  };
  // process metric
  await processMetric(newEvent, metric);
  // check that the metric windows were modified
  const metricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: user.userID,
    },
  });
  expect(metricValues.length).toBe(5);
  const startWindow = metricValues.find(
    (metricValue) => metricValue.startTime === null
  );
  expect_toBeDefined(startWindow);
  expect(startWindow.endTime).toEqual(newEventTime);
  expect(startWindow.value).toBe(0);
  const endWindow = metricValues.find(
    (metricValue) => metricValue.endTime === null
  );
  expect_toBeDefined(endWindow);
  expect(endWindow.startTime).toEqual(
    new Date(eventTime.getTime() + metricWindowSeconds * 1000)
  );
  expect(endWindow.value).toBe(0);

  // window that is created before the previous window
  const firstValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === newEventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(firstValueWindow);
  // expect value to be incremented
  expect(firstValueWindow.value).toBe(1);

  // window in between the other windows
  const secondValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() ===
        newEventTime.getTime() + metricWindowSeconds * 1000 &&
      metricValue.endTime?.getTime() === eventTime.getTime()
  );
  expect_toBeDefined(secondValueWindow);
  // expect value to be zero
  expect(secondValueWindow.value).toBe(0);

  const thirdValueWindow = metricValues.find(
    (metricValue) =>
      // get time must be used since otherwise javascript compares object by reference
      // which would always be false
      metricValue.startTime?.getTime() === eventTime.getTime() &&
      metricValue.endTime?.getTime() ===
        eventTime.getTime() + metricWindowSeconds * 1000
  );
  expect_toBeDefined(thirdValueWindow);
  // expect value to be unchanged from before
  expect(thirdValueWindow.value).toBe(1);

  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});
