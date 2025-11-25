/*!
=========================================================
* Light Bootstrap Dashboard React - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2022 Creative Tim
* Licensed under MIT

=========================================================
*/

import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/TableList.js";
import Typography from "views/Typography.js";

import Icons from "views/Icons.js";
import Maps from "views/Maps.js";
import Notifications from "views/Notifications.js";
import Upgrade from "views/Upgrade.js";

import CaseForm from "./views/CaseForm.js";
import CaseAutoLoadForm from "./views/CaseAutoLoadForm.js";
import NoticeLetterGenerator from "./views/NoticeLetterGenerator";
import GenerateNoticeWithDates from "views/GenerateNoticeWithDates.js";
import ValuationReport from "./views/ValuationReport.js";
import OtherCase from "./views/OtherCase.js";   // ✅ NEW COMPONENT IMPORT


const dashboardRoutes = [
  {
    path: "/icons",
    name: "Icons",
    icon: "nc-icon nc-atom",
    component: Icons,
    layout: "/admin"
  },

  {
    path: "/case-entry",
    name: "Case Entry",
    icon: "nc-icon nc-paper-2",
    component: CaseForm,
    layout: "/admin"
  },
  {
    path: "/case-auto-load",
    name: "Case Valuation",
    icon: "nc-icon nc-notes",
    component: CaseAutoLoadForm,
    layout: "/admin"
  },

  {
    path: "/other-case",
    name: "Other Case",
    icon: "nc-icon nc-badge",
    component: OtherCase,
    layout: "/admin"
  },
  {
    path: "/valuation-report",
    name: "Other Case Valuation",
    icon: "nc-icon nc-single-copy-04",
    component: ValuationReport,
    layout: "/admin"
  },


  {
    path: "/notice-generator/:caseId",
    name: "Order-Sheet",
    icon: "nc-icon nc-spaceship",
    component: NoticeLetterGenerator,
    layout: "/admin"
  },

  {
    path: "/notice/:caseId",
    name: "Notice",
    icon: "nc-icon nc-alien-33",
    component: GenerateNoticeWithDates,
    layout: "/admin"
  },



];

export default dashboardRoutes;
