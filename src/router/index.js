
import React, { Component } from "react";
 // eslint-disable-next-line 
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import Layout from "../components/layout";

import MyMail from "../views/MyText/mailbox";
import SMS from "../views/MyText/SMS";
import dingdingRecord from "../views/MyText/dingdingRecord";
import dingdingRobot from "../views/MyText/dingdingRobot";
import dingdingGroup from "../views/MyText/dingdingGroup";
import dingdingNotice from "../views/MyText/dingdingNotice";


import MyHistory from "../views/task/history";
import HistoryDetail from "../views/task/historyDetail";

import MyTask from "../views/task/task";






export default class Router extends Component {
    render() {
      return (
        <HashRouter>
          <Layout>
            <Switch>
              <Route exact path="/my/mailbox" component={MyMail} />
              <Route exact path="/my/SMS" component={SMS} />
              <Route exact path="/my/dingdingRecord" component={dingdingRecord} />
              <Route exact path="/my/dingdingRobot" component={dingdingRobot} />
              <Route exact path="/my/dingdingGroup" component={dingdingGroup} />
              <Route exact path="/my/dingdingNotice" component={dingdingNotice} />


              <Route exact path="/task/history" component={MyHistory} />
              <Route exact path="/task/historyDetail" component={HistoryDetail} />
              <Route exact path="/task" component={MyTask} />


              

            </Switch>

          </Layout>
       </HashRouter>
    );
  }
}