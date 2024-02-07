import { v4 } from "uuid";
import { Event, writeEvent } from "../src/receiveEvent";
import {
  cleanupDatabaseRecords,
  generateEvent,
  setupDefaultCustomer,
} from "./utils";
import prisma, { GenericRuleActionType, UserStatusState } from "shared-utils";
import { processRulesForEvent } from "../src/receiveEventGeneric";
import { getDefaultStatusForCustomer } from "../src/utils/customer";

test("receiving event produces rule state record correctly", async () => {
  // set up
  const customer = await setupDefaultCustomer();
  const genericRuleAction = await prisma.genericRuleAction.create({
    data: {
      ruleActionType: GenericRuleActionType.UpdateUserAttribute,
      ruleActionData: { path: "status", value: "BANNED" },
      customerID: customer.customerID,
    },
  });
  const userID = v4();

  const counterFunctionInstanceID = "4e56a3d3-fd4b-42e5-a756-df8f0229b106";
  await prisma.genericRule.create({
    data: {
      customerID: customer.customerID,
      ruleDefinition: {
        // numeric comparison operator
        functionID: "384e4f11-7629-4b56-9b31-0596e192f4b2",
        functionInstanceID: "26258bbc-5b1d-4660-bafd-6c7a539630f4",
        arguments: [
          {
            // count event instances in last X seconds for user
            functionID: "28d1541e-0a57-4946-bcde-6bd5b6ea645f",
            functionInstanceID: counterFunctionInstanceID,
            arguments: [
              {
                // string equals
                functionID: "3ffa69b1-30dd-4b7b-9262-733b5b66327a",
                functionInstanceID: "cf40b95c-b0dd-4212-a2e3-23a20827bacf",
                arguments: [
                  {
                    // extract field
                    functionID: "be0c785e-3b94-42ba-905b-f2f28efc5c7b",
                    functionInstanceID: "7c97227c-683a-4969-b912-3308bb89e6fb",
                    arguments: [["eventType"]],
                  },
                  "SEND_MESSAGE",
                ],
              },
              60,
            ],
          },
          ">",
          5,
        ],
      },
      signatureDefinition: {
        functionID: "f426bde7-98b4-42f6-9341-8d1716da6b67",
        functionInstanceID: "f74c5ef0-6e8b-46ed-b468-580f10e7a67a",
        arguments: [],
      },
      GenericRuleActionLinkage: {
        create: {
          ruleActionID: genericRuleAction.ruleActionID,
        },
      },
    },
  });
  for (let i = 0; i < 10; i++) {
    const newEventRecord = await writeEvent(
      generateEvent({ eventType: "SEND_MESSAGE", userID, eventData: {} }),
      customer.customerID
    );
    await processRulesForEvent({
      event: newEventRecord,
      customerID: customer.customerID,
    });
  }
  const genericRuleActionEvents = await prisma.genericRuleActionEvent.findMany({
    where: {
      ruleActionID: genericRuleAction.ruleActionID,
    },
  });
  expect(genericRuleActionEvents.length).toBe(5);
  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});

test("receiving event produces rule state record correctly with user attribute signature function", async () => {
  // set up
  const customer = await setupDefaultCustomer();
  const genericRuleAction = await prisma.genericRuleAction.create({
    data: {
      ruleActionType: GenericRuleActionType.UpdateUserAttribute,
      ruleActionData: { path: "status", value: "BANNED" },
      customerID: customer.customerID,
    },
  });
  const defaultStatus = await getDefaultStatusForCustomer(customer.customerID);

  // create users
  await prisma.user.createMany({
    data: [
      {
        userID: v4(),
        customerID: customer.customerID,
        statusID: defaultStatus.statusID,
        customerUserID: v4(),
        attributeMap: {
          ip: "221.216.137.208", // random ip
        },
      },
      {
        userID: v4(),
        customerID: customer.customerID,
        statusID: defaultStatus.statusID,
        customerUserID: v4(),
        attributeMap: {
          ip: "221.216.137.208", // random ip
        },
      },
      {
        userID: v4(),
        customerID: customer.customerID,
        statusID: defaultStatus.statusID,
        customerUserID: v4(),
        attributeMap: {
          ip: "201.29.43.84", // different random ip
        },
      },
    ],
  });

  const [user1, user2] = await prisma.user.findMany({
    where: {
      attributeMap: {
        path: ["ip"],
        equals: "221.216.137.208",
      },
    },
  });
  const [user3] = await prisma.user.findMany({
    where: {
      attributeMap: {
        path: ["ip"],
        equals: "201.29.43.84",
      },
    },
  });

  const counterFunctionInstanceID = "4e56a3d3-fd4b-42e5-a756-df8f0229b106";

  // rule: ip is sending more than 5 messages in 60 seconds"
  await prisma.genericRule.create({
    data: {
      customerID: customer.customerID,
      ruleDefinition: {
        // numeric comparison operator
        functionID: "384e4f11-7629-4b56-9b31-0596e192f4b2",
        functionInstanceID: "26258bbc-5b1d-4660-bafd-6c7a539630f4",
        arguments: [
          {
            // count event instances in last X seconds for user
            functionID: "28d1541e-0a57-4946-bcde-6bd5b6ea645f",
            functionInstanceID: counterFunctionInstanceID,
            arguments: [
              {
                // string equals
                functionID: "3ffa69b1-30dd-4b7b-9262-733b5b66327a",
                functionInstanceID: "cf40b95c-b0dd-4212-a2e3-23a20827bacf",
                arguments: [
                  {
                    // extract field
                    functionID: "be0c785e-3b94-42ba-905b-f2f28efc5c7b",
                    functionInstanceID: "7c97227c-683a-4969-b912-3308bb89e6fb",
                    arguments: [["eventType"]],
                  },
                  "SEND_MESSAGE",
                ],
              },
              60,
            ],
          },
          ">",
          5,
        ],
      },
      signatureDefinition: {
        functionID: "c06db706-7a07-4ab2-82b2-49ec512a7cb6",
        functionInstanceID: "c25bb70a-10e9-431c-bad5-3f289744b37f",
        arguments: [
          {
            functionID: "13293f8d-a457-4a24-96cc-249e397698e1",
            functionInstanceID: "c60f512f-77c9-4c08-9aee-4ba598f1765f",
            arguments: [["ip"]],
          },
        ],
      },
      GenericRuleActionLinkage: {
        create: {
          ruleActionID: genericRuleAction.ruleActionID,
        },
      },
    },
  });
  for (let i = 0; i < 3; i++) {
    const newEventRecord = await writeEvent(
      generateEvent({
        eventType: "SEND_MESSAGE",
        userID: user1.customerUserID,
        eventData: {},
      }),
      customer.customerID
    );
    await processRulesForEvent({
      event: newEventRecord,
      customerID: customer.customerID,
    });
  }
  let genericRuleActionEvents = await prisma.genericRuleActionEvent.findMany({
    where: {
      ruleActionID: genericRuleAction.ruleActionID,
    },
  });
  expect(genericRuleActionEvents.length).toBe(0);
  for (let i = 0; i < 3; i++) {
    const newEventRecord = await writeEvent(
      generateEvent({
        eventType: "SEND_MESSAGE",
        userID: user3.customerUserID,
        eventData: {},
      }),
      customer.customerID
    );
    await processRulesForEvent({
      event: newEventRecord,
      customerID: customer.customerID,
    });
  }
  genericRuleActionEvents = await prisma.genericRuleActionEvent.findMany({
    where: {
      ruleActionID: genericRuleAction.ruleActionID,
    },
  });
  expect(genericRuleActionEvents.length).toBe(0);
  // this will trigger the rule because 6 mail was sent from the IP cluster
  for (let i = 0; i < 3; i++) {
    const newEventRecord = await writeEvent(
      generateEvent({
        eventType: "SEND_MESSAGE",
        userID: user2.customerUserID,
        eventData: {},
      }),
      customer.customerID
    );
    await processRulesForEvent({
      event: newEventRecord,
      customerID: customer.customerID,
    });
  }
  genericRuleActionEvents = await prisma.genericRuleActionEvent.findMany({
    where: {
      ruleActionID: genericRuleAction.ruleActionID,
    },
  });
  expect(genericRuleActionEvents.length).toBe(1);
  await cleanupDatabaseRecords({
    customerID: customer.customerID,
  });
});
