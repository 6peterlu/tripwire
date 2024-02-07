import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarItem,
  commonColors,
} from "@nextui-org/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import EventTable from "../components/eventTable/EventTable";
import TransformFunctionComponent from "../components/createGenericRuleModal/transformFunctions/TransformFunctionComponent";
import CreateGenericRuleModal from "../components/createGenericRuleModal/CreateGenericRuleModal";

function Logo() {
  return (
    <svg
      width="auto"
      height="auto"
      viewBox="0 0 347 253"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0H180L69.5 147.5H185.5L113 252.5H0V0Z"
        fill="url(#paint0_linear_83_14)"
      />
      <path
        d="M346.5 252.5L166.5 252.5L277 105L161 105L233.5 -9.87877e-06L346.5 0L346.5 252.5Z"
        fill="url(#paint1_linear_83_14)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_83_14"
          x1="0"
          y1="0"
          x2="344.5"
          y2="253"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#EB5757" />
          <stop offset="1" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_83_14"
          x1="347"
          y1="253"
          x2="-0.500004"
          y2="-1.4599e-05"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stop-color="#EB5757" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NavigationItem({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  return (
    <NavbarItem isActive={location.pathname === to}>
      <Link to={to} aria-current="page">
        <p className="text-red-500">{label}</p>
      </Link>
    </NavbarItem>
  );
}

export default function Root() {
  return (
    <div className="max-h-full h-full">
      <Navbar>
        <NavbarBrand>
          <div className="flex items-center">
            <Link to="/">
              <div className="h-10 mr-4">
                <Logo />
              </div>
            </Link>
            <p className="text-red-500">TRIPWIRE DEMO</p>
          </div>
        </NavbarBrand>
      </Navbar>
      <div style={{ width: "100%" }}>
        <CreateGenericRuleModal />
      </div>
      <Outlet />
    </div>
  );
}
