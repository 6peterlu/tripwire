import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { NextUIProvider } from "@nextui-org/react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import Rules from "./routes/root/rules";
import Metrics from "./routes/root/metrics";
import Events from "./routes/root/events";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: undefined, // TODO: figure out what this does
    children: [
      {
        path: "/",
        element: <Events />,
        loader: undefined,
      },
      {
        path: "rules",
        element: <Rules />,
        loader: undefined,
      },
      {
        path: "metrics",
        element: <Metrics />,
        loader: undefined,
      },
    ],
  },
]);

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </NextUIProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
