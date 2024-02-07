import prisma, {
  CountMetric,
  Metric,
  MetricUnion,
  UniqueValuesMetric,
  Condition,
} from "shared-utils";
import { Event } from "../receiveEvent";

function eventMatchesCondition(event: Event, condition: Condition) {
  const transformFunction = condition.transformFunction;
  let transformedValue: string | number | null = null;
  if (transformFunction.function === "IDENTITY") {
    // expect arguments list to have length 1 and be a string
    if (transformFunction.arguments.length !== 1) {
      throw new Error("Invalid arguments list");
    }
    const path = transformFunction.arguments[0] as string;
    const splitPath = path.split(".");
    let value = event.eventData;
    for (const pathSegment of splitPath) {
      value = value[pathSegment];
    }
    transformedValue = value;
  }

  switch (condition.operator) {
    case "EQUALS":
      return (
        String(transformedValue) === condition.value ||
        transformedValue === Number(condition.value)
      );
    case "GREATER_THAN":
      return Number(transformedValue) > Number(condition.value);
    case "LESS_THAN":
      return Number(transformedValue) < Number(condition.value);
    case "GREATER_THAN_OR_EQUALS":
      return Number(transformedValue) >= Number(condition.value);
    case "LESS_THAN_OR_EQUALS":
      return Number(transformedValue) <= Number(condition.value);
  }

  // TODO: other transform functions
}

export function eventMatchesMetric(event: Event, metric: Metric) {
  const metricDefinition = metric.metricDefinition as MetricUnion;

  if (metricDefinition.eventType !== event.eventType) {
    return false;
  }
  const conditions = metricDefinition.conditions;
  for (const condition of conditions) {
    if (!eventMatchesCondition(event, condition)) {
      return false;
    }
  }
  return true;
}

async function processCountMetric(
  event: Event,
  metric: CountMetric,
  customerID: string,
  metricID: string
) {
  const timeWindow = metric.timeWindowSeconds;
  const eventTime = event.timestamp;
  const userID = event.userID;
  const userRecord = await prisma.user.findUniqueOrThrow({
    where: {
      customerID_customerUserID: {
        customerID,
        customerUserID: userID,
      },
    },
  });
  const endOfEventImpactWindow = new Date(
    eventTime.getTime() + timeWindow * 1000
  );
  // increment intermediate values (windows that don't require splitting)
  await prisma.userMetricValue.updateMany({
    where: {
      userID: userRecord.userID,
      metricID: metricID,
      // must start before or on the event time
      startTime: {
        gte: eventTime,
      },
      // must end on or after the event time
      endTime: {
        lte: endOfEventImpactWindow,
      },
    },
    data: {
      value: {
        increment: 1,
      },
    },
  });
  const userMetricValues = await prisma.userMetricValue.findMany({
    where: {
      userID: userRecord.userID,
      metricID: metricID,
      // possible boundary records
      OR: [
        // a window interrupted by the start time of the event
        {
          startTime: {
            lt: eventTime,
          },
          endTime: {
            gt: eventTime,
          },
        },
        // a window interrupted by the end time of the event
        {
          startTime: {
            lt: endOfEventImpactWindow,
          },
          endTime: {
            gt: endOfEventImpactWindow,
          },
        },
        // the last window out of all windows
        {
          endTime: null,
        },
        // the first window out of all windows
        {
          startTime: null,
        },
      ],
    },
  });

  if (userMetricValues.length === 0) {
    // if there's no windows at all, create three: before, during, and after
    await prisma.userMetricValue.create({
      data: {
        userID: userRecord.userID,
        metricID: metricID,
        startTime: null,
        endTime: eventTime,
        value: 0,
      },
    });
    await prisma.userMetricValue.create({
      data: {
        userID: userRecord.userID,
        metricID: metricID,
        startTime: eventTime,
        endTime: endOfEventImpactWindow,
        value: 1,
      },
    });
    await prisma.userMetricValue.create({
      data: {
        userID: userRecord.userID,
        metricID: metricID,
        startTime: endOfEventImpactWindow,
        endTime: null,
        value: 0,
      },
    });
  } else {
    // must exist
    const firstWindowThatExists = userMetricValues.find(
      (umv) => umv.startTime === null
    );

    // must exist
    const lastWindowThatExists = userMetricValues.find(
      (umv) => umv.endTime === null
    );

    if (!lastWindowThatExists || !firstWindowThatExists) {
      throw new Error("Invalid first or last window");
    }
    // can be undefined
    const windowContainingEventStartTime = userMetricValues.find(
      (umv) =>
        umv.startTime &&
        umv.startTime <= eventTime &&
        umv.endTime &&
        umv.endTime > eventTime
    );

    // can be undefined
    const windowContainingEventEndTime = userMetricValues.find(
      (umv) =>
        umv.startTime &&
        umv.startTime <= endOfEventImpactWindow &&
        umv.endTime &&
        umv.endTime > endOfEventImpactWindow
    );

    // case 1: new event is after the last window starts
    if (eventTime >= (lastWindowThatExists.startTime as Date)) {
      // create a new window for event and new end window
      if (eventTime > (lastWindowThatExists.startTime as Date)) {
        await prisma.userMetricValue.create({
          data: {
            userID: userRecord.userID,
            metricID: metricID,
            startTime: eventTime,
            endTime: endOfEventImpactWindow,
            value: 1,
          },
        });
        // shorten the last window
        await prisma.userMetricValue.update({
          where: {
            userMetricValueID: lastWindowThatExists.userMetricValueID,
          },
          data: {
            endTime: eventTime,
          },
        });
      } else {
        // update the last window
        await prisma.userMetricValue.update({
          where: {
            userMetricValueID: lastWindowThatExists.userMetricValueID,
          },
          data: {
            endTime: endOfEventImpactWindow,
            value: {
              increment: 1,
            },
          },
        });
      }
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: endOfEventImpactWindow,
          endTime: null,
          value: 0,
        },
      });
    } else if (
      eventTime < (lastWindowThatExists.startTime as Date) &&
      endOfEventImpactWindow >= (lastWindowThatExists.startTime as Date) &&
      windowContainingEventStartTime
    ) {
      // case 2: new event is in the middle of other windows but end is after last window starts

      // split the window containing the event
      await prisma.userMetricValue.update({
        where: {
          userMetricValueID: windowContainingEventStartTime.userMetricValueID,
        },
        data: {
          endTime: eventTime,
        },
      });
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: eventTime,
          endTime: windowContainingEventStartTime.endTime,
          value: windowContainingEventStartTime.value + 1,
        },
      });

      // split the last window
      await prisma.userMetricValue.update({
        where: {
          userMetricValueID: lastWindowThatExists.userMetricValueID,
        },
        data: {
          endTime: endOfEventImpactWindow,
          value: {
            increment: 1,
          },
        },
      });
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: endOfEventImpactWindow,
          endTime: null,
          value: 0,
        },
      });
    } else if (windowContainingEventStartTime && windowContainingEventEndTime) {
      // case 3: new event is in the middle of other windows and end is in the middle of other windows
      // split the window containing the event
      await prisma.userMetricValue.update({
        where: {
          userMetricValueID: windowContainingEventStartTime.userMetricValueID,
        },
        data: {
          endTime: eventTime,
        },
      });
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: eventTime,
          endTime: windowContainingEventStartTime.endTime,
          value: windowContainingEventStartTime.value + 1,
        },
      });

      // split the window containing the end time
      await prisma.userMetricValue.update({
        where: {
          userMetricValueID: windowContainingEventEndTime.userMetricValueID,
        },
        data: {
          endTime: endOfEventImpactWindow,
          value: {
            increment: 1,
          },
        },
      });
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: endOfEventImpactWindow,
          endTime: windowContainingEventEndTime.endTime,
          value: windowContainingEventEndTime.value,
        },
      });
    } else if (
      eventTime < (firstWindowThatExists.endTime as Date) &&
      windowContainingEventEndTime
    ) {
      // case 4: new event is before the first window starts and end is in the middle of other windows
      // split the window containing the end time
      await prisma.userMetricValue.update({
        where: {
          userMetricValueID: windowContainingEventEndTime.userMetricValueID,
        },
        data: {
          endTime: endOfEventImpactWindow,
          value: {
            increment: 1,
          },
        },
      });
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: endOfEventImpactWindow,
          endTime: windowContainingEventEndTime.endTime,
          value: windowContainingEventEndTime.value,
        },
      });

      // split the first window
      await prisma.userMetricValue.update({
        where: {
          userMetricValueID: firstWindowThatExists.userMetricValueID,
        },
        data: {
          startTime: eventTime,
          value: {
            increment: 1,
          },
        },
      });
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: null,
          endTime: eventTime,
          value: 0,
        },
      });
    } else if (
      endOfEventImpactWindow <= (firstWindowThatExists.endTime as Date)
    ) {
      // case 5: new event is before the first window starts and end is before the first window starts
      if (endOfEventImpactWindow < (firstWindowThatExists.endTime as Date)) {
        // split the first window
        await prisma.userMetricValue.update({
          where: {
            userMetricValueID: firstWindowThatExists.userMetricValueID,
          },
          data: {
            startTime: endOfEventImpactWindow,
          },
        });
        // create event impact window
        await prisma.userMetricValue.create({
          data: {
            userID: userRecord.userID,
            metricID: metricID,
            startTime: eventTime,
            endTime: endOfEventImpactWindow,
            value: 1,
          },
        });
      } else {
        // update the first window to the event impact window
        await prisma.userMetricValue.update({
          where: {
            userMetricValueID: firstWindowThatExists.userMetricValueID,
          },
          data: {
            startTime: eventTime,
            value: {
              increment: 1,
            },
          },
        });
      }
      // create starting window
      await prisma.userMetricValue.create({
        data: {
          userID: userRecord.userID,
          metricID: metricID,
          startTime: null,
          endTime: eventTime,
          value: 0,
        },
      });
    }
  }
}

function processUniqueValuesMetric(
  event: Event,
  metric: UniqueValuesMetric,
  customerID: string,
  metricID: string
) {
  // TODO: fill in
}

export async function processMetric(event: Event, metric: Metric) {
  const metricDefinition = metric.metricDefinition as MetricUnion;
  switch (metric.metricType) {
    case "COUNT":
      return await processCountMetric(
        event,
        metricDefinition as CountMetric,
        metric.customerID,
        metric.metricID
      );
    case "UNIQUE_VALUES":
      return processUniqueValuesMetric(
        event,
        metricDefinition as UniqueValuesMetric,
        metric.customerID,
        metric.metricID
      );
  }
}
