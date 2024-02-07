import { gql, useQuery } from "@apollo/client";
import { Event } from "../../generated/types";
import { useMemo } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Link, useLocation } from "react-router-dom";
import qs from "query-string";

const QUERY_GET_EVENTS = gql`
  query GetEvents($userID: String) {
    getEvents(customerUserID: $userID) {
      eventID
      eventType
      timestamp
      stringifiedEventData
      customerUserID
    }
  }
`;

function EventCell({ event, columnKey }: { event: Event; columnKey: number }) {
  if (columnKey === 0) {
    return <p>{event.eventType} </p>;
  }
  if (columnKey === 1) {
    return (
      <p>
        {new Date(event.timestamp).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "numeric",
          second: "numeric",
        })}
      </p>
    );
  }
  if (columnKey === 2) {
    return (
      <Link to={`?userID=${event.customerUserID}`}>
        <Button variant="light">{event.customerUserID}</Button>
      </Link>
    );
  }
  if (columnKey === 3) {
    return (
      <textarea
        style={{ width: "100%" }}
        value={JSON.stringify(JSON.parse(event.stringifiedEventData), null, 2)}
        readOnly
      />
    );
  }
  return null;
}

function renderEventCell(event: Event, columnKey: number) {
  return <EventCell event={event} columnKey={columnKey} />;
}

export default function EventTable() {
  const path = useLocation();
  const parsedQueryString = useMemo(() => {
    return qs.parse(path.search);
  }, [path.search]);
  const {
    loading,
    error,
    data: eventData,
    refetch: getEventsRefetch,
  } = useQuery<{ getEvents: Event[] }>(QUERY_GET_EVENTS, {
    variables: {
      userID: parsedQueryString.userID,
    },
  });
  /// refetch every second
  // useMemo(() => {
  //   const interval = setInterval(() => {
  //     getEventsRefetch();
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [getEventsRefetch]);
  return (
    <div>
      {parsedQueryString.userID && (
        <div className="flex items-center p-4">
          <p>Viewing events for user ID: {parsedQueryString.userID}</p>

          <Link to="/">
            <Button variant="light" color="danger">
              X
            </Button>
          </Link>
        </div>
      )}
      {eventData?.getEvents && (
        // this CSS is so jank but its good enough for now
        <Table
          isHeaderSticky={true}
          aria-label="Event data table"
          className="max-h-[calc(100vh-4rem)] overflow-scroll"
        >
          <TableHeader>
            <TableColumn>Event type</TableColumn>
            <TableColumn>Time</TableColumn>
            <TableColumn>User ID</TableColumn>
            <TableColumn>Event data</TableColumn>
          </TableHeader>
          <TableBody items={eventData?.getEvents}>
            {/* why not array map? https://nextui.org/docs/components/table#why-not-array-map */}
            {(item) => (
              <TableRow key={item.eventID}>
                {(columnKey) => (
                  <TableCell>
                    {renderEventCell(
                      item,
                      Number(columnKey.toString().split(".")[1])
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
