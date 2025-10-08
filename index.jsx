function sanitizeExpression(expr) {
  return expr.replace(/×/g, "*").replace(/÷/g, "/");
}

function lastTokenIsOperator(expr) {
  return /[+\-*/]$/.test(expr);
}

function getLastNumber(expr) {
  const parts = expr.split(/(?=[+\-*/])/g);
  const last = parts[parts.length - 1];
  // If last begins with operator (like +-, *-), remove leading operator(s)
  return last.replace(/^[+\-*/]+/, "");
}

function evaluateExpression(expr) {
  try {
    const sanitized = sanitizeExpression(expr);
    // Use eval here for simplicity; rounding to avoid floating errors
    const raw = Function(`return (${sanitized})`)();
    if (!isFinite(raw) || Number.isNaN(raw)) return "Error";
    const rounded = Math.round((raw + Number.EPSILON) * 1e6) / 1e6;
    // Remove trailing zeros
    return rounded.toString();
  } catch {
    return "Error";
  }
}

function App() {
  const [expr, setExpr] = React.useState("");
  const [display, setDisplay] = React.useState("0");
  const [lastAction, setLastAction] = React.useState(null);

  const inputDigit = (d) => {
    if (lastAction === "equals") {
      setExpr(d === "0" ? "" : d);
      setDisplay(d);
      setLastAction("digit");
      return;
    }

    // prevent multiple leading zeros
    const lastNum = getLastNumber(expr);
    if (lastNum === "0" && d === "0") return;
    if (lastNum === "0" && d !== "0" && !lastNum.includes(".")) {
      // replace that leading zero
      const newExpr = expr.replace(/0$/, "") + d;
      setExpr(newExpr);
      setDisplay(getLastNumber(newExpr));
      setLastAction("digit");
      return;
    }

    const newExpr = expr + d;
    setExpr(newExpr);
    setDisplay(getLastNumber(newExpr));
    setLastAction("digit");
  };

  const inputDecimal = () => {
    const lastNum = getLastNumber(expr);
    if (lastNum.includes(".")) return;
    if (lastAction === "equals") {
      setExpr("0.");
      setDisplay("0.");
      setLastAction("digit");
      return;
    }
    const toAppend = lastNum === "" ? "0." : ".";
    const newExpr = expr + toAppend;
    setExpr(newExpr);
    setDisplay(getLastNumber(newExpr));
    setLastAction("digit");
  };

  const inputOperator = (op) => {
    if (expr === "" && op !== "-") return;
    if (lastAction === "equals") {
      const newExpr = display === "Error" ? "" : display + op;
      setExpr(newExpr);
      setLastAction("operator");
      return;
    }

    if (!lastTokenIsOperator(expr)) {
      setExpr(expr + op);
      setLastAction("operator");
      return;
    }

    // expr ends with operator(s)
    const trailing = (expr.match(/([+\-*/])+$/) || [""])[0];
    if (op === "-" && trailing.length === 1 && trailing !== "-") {
      // allow sequence like "+-" to form negative number
      setExpr(expr + "-");
      setLastAction("operator");
      return;
    }
    // replace trailing operators with the new one
    const newExpr = expr.replace(/([+\-*/])+$/g, "") + op;
    setExpr(newExpr);
    setLastAction("operator");
  };

  const clearAll = () => {
    setExpr("");
    setDisplay("0");
    setLastAction(null);
  };

  const doEquals = () => {
    if (expr === "") return;
    // Remove trailing operators
    let toEval = expr.replace(/([+\-*/])+$/g, "");
    // Avoid empty
    if (toEval === "") return;
    const result = evaluateExpression(toEval);
    setDisplay(result);
    setExpr(result === "Error" ? "" : result);
    setLastAction("equals");
  };

  // UI helper: map button clicks
  const onButtonClick = (val, type) => {
    if (type === "digit") inputDigit(val);
    if (type === "operator") inputOperator(val);
    if (type === "decimal") inputDecimal();
    if (type === "clear") clearAll();
    if (type === "equals") doEquals();
  };

  return (
    <div className="calc-wrap">
      <div className="calc">
        <div id="display" className="display">{display}</div>

        <div className="buttons">
          <button id="clear" className="btn wide" onClick={() => onButtonClick("C", "clear")}>AC</button>

          <button id="divide" className="btn op" onClick={() => onButtonClick("/", "operator")}>÷</button>

          <button id="seven" className="btn" onClick={() => onButtonClick("7", "digit")}>7</button>
          <button id="eight" className="btn" onClick={() => onButtonClick("8", "digit")}>8</button>
          <button id="nine" className="btn" onClick={() => onButtonClick("9", "digit")}>9</button>
          <button id="multiply" className="btn op" onClick={() => onButtonClick("*", "operator")}>×</button>

          <button id="four" className="btn" onClick={() => onButtonClick("4", "digit")}>4</button>
          <button id="five" className="btn" onClick={() => onButtonClick("5", "digit")}>5</button>
          <button id="six" className="btn" onClick={() => onButtonClick("6", "digit")}>6</button>
          <button id="subtract" className="btn op" onClick={() => onButtonClick("-", "operator")}>−</button>

          <button id="one" className="btn" onClick={() => onButtonClick("1", "digit")}>1</button>
          <button id="two" className="btn" onClick={() => onButtonClick("2", "digit")}>2</button>
          <button id="three" className="btn" onClick={() => onButtonClick("3", "digit")}>3</button>
          <button id="add" className="btn op" onClick={() => onButtonClick("+", "operator")}>+</button>

          <button id="zero" className="btn wide" onClick={() => onButtonClick("0", "digit")}>0</button>
          <button id="decimal" className="btn" onClick={() => onButtonClick(".", "decimal")}>.</button>
          <button id="equals" className="btn op" onClick={() => onButtonClick("=", "equals")}>=</button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
