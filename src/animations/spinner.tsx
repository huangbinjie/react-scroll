import * as React from "react"

type Props = { display: "none" | "block" }
const Spinner = ({display}: Props) =>
  <li className="spinner" style={{ display: display }}>
    <div className="bounce1"></div>
    <div className="bounce2"></div>
    <div className="bounce3"></div>
  </li>

export default Spinner