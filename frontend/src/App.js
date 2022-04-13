import './App.css';
import React, { useState, useEffect } from 'react';

const params = {
  baseStepDown: 0.9,
  beta: 0.954243,
  slipdown: 0.1832,
  baseDiscount: 0.1,
  factorDiscount: 0.05,
  dmInfinity: 6000000,
};

const dollarFormat = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const computeAverageDM = (alpha, dms) => {
  if (dms === 0) return 0;
  else return (alpha * Math.pow(dms, params.beta)) / dms - params.slipdown * Math.pow(dms / params.dmInfinity, 1.8);
};

const computeMarginalDM = (alpha, totalDMsMax, totalDMs, averageDM) => {
  if (totalDMs > params.dmInfinity) {
    return averageDM;
  } else {
    const dmsMinusOne = totalDMsMax - 1;
    return (
      averageDM * totalDMsMax -
      ((alpha * Math.pow(dmsMinusOne, params.beta)) / dmsMinusOne -
        params.slipdown * Math.pow(dmsMinusOne / params.dmInfinity, 1.8)) *
        dmsMinusOne
    );
  }
};

function App() {
  const [inputState, setInputState] = useState({
    existingDMs: 0,
    purchasedDMs: 12000,
    months: 12,
    microservices: true,
    fixed: true,
    expiring: false,
    nonRefundable: false,
  });

  const [outputState, setOutputState] = useState({
    marginalDM: 0,
    averageDM: 0,
    total: 0,
  });

  const changeHandler = (event) => {
    event.persist();
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (typeof value != 'boolean') {
      value = parseInt(value);
    }
    setInputState((prevState) => ({
      ...prevState,
      [event.target.name]: value,
    }));
  };

  useEffect(() => {
    const fixedDiscount = inputState.fixed ? params.factorDiscount : 0.0;
    const expiringDiscount = inputState.expiring ? params.factorDiscount : 0.0;
    const nonrefundableDiscount = inputState.nonRefundable ? params.factorDiscount : 0.0;
    const discountFactor = 1.0 - params.baseDiscount - fixedDiscount - expiringDiscount - nonrefundableDiscount;
    const basePrice = inputState.microservices ? 1.5 : 1.0;
    const alpha = (discountFactor * basePrice) / Math.pow(params.baseStepDown, 3);
    const totalDMs = inputState.existingDMs + inputState.purchasedDMs;
    const totalDMsMax = totalDMs > params.dmInfinity ? params.dmInfinity : totalDMs;

    const averageExistingDMs = computeAverageDM(alpha, inputState.existingDMs);
    const averageTotalDMs = computeAverageDM(alpha, totalDMsMax);

    const totalNewPrice = averageTotalDMs * totalDMs - averageExistingDMs * inputState.existingDMs;

    setOutputState({
      marginalDM: dollarFormat.format(computeMarginalDM(alpha, totalDMsMax, totalDMs, averageTotalDMs)),
      averageDM: dollarFormat.format(averageTotalDMs),
      totalPrice: dollarFormat.format(totalNewPrice),
      totalDms: inputState.purchasedDMs,
    });
  }, [inputState]); // Only re-run the effect if count changes

  return (
    <div className="App">
      <strong className="Warning">
        Warning: This project is currently in active development and does NOT indicate balena's current volume pricing
        structure. It is a a WIP project to experiment with more transparent, self-service pricing for balena customers.
        When this calculator accurately reflects our pricing structure and becomes feature-complete, I'll remove this
        warning :)
      </strong>
      <table className="Table">
        <tr>
          <td>
            <strong>Inputs</strong>
          </td>
          <td></td>
        </tr>
        <tr>
          <td className="subTextRow">Device-Months currently in the bank:</td>
          <td>
            <input type="number" name="existingDMs" value={inputState.existingDMs} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Device-Months to be purchased:</td>
          <td>
            <input type="number" name="purchasedDMs" value={inputState.purchasedDMs} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Prepayment Months (12 min):</td>
          <td>
            <input type="number" name="months" min="12" max="60" value={inputState.months} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Does the app use multiple containers (microservices)?</td>
          <td>
            <input type="checkbox" name="microservices" checked={inputState.microservices} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Is the license "fixed" to a single device?</td>
          <td>
            <input type="checkbox" name="fixed" checked={inputState.fixed} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Does the license expire?</td>
          <td>
            <input type="checkbox" name="expiring" checked={inputState.expiring} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Is the license non-refundable?</td>
          <td>
            <input type="checkbox" name="nonRefundable" checked={inputState.nonRefundable} onChange={changeHandler} />
          </td>
        </tr>
      </table>
      <table className="Table">
        <tr>
          <td>
            <strong>Outputs</strong>
          </td>
          <td></td>
        </tr>
        <tr>
          <td className="subTextRow">Total price for new device-months:</td>
          <td className="subTextRow">{outputState.totalPrice}</td>
        </tr>
        {/* <tr>
          <td className="subTextRow">Total Devices Months:</td>
          <td className="subTextRow">{outputState.totalDms}</td>
        </tr> */}
        <tr>
          <td className="subTextRow">Average price for all device-months:</td>
          <td className="subTextRow">{outputState.averageDM}</td>
        </tr>
        <tr>
          <td className="subTextRow">Marginal price for more device-months:</td>
          <td className="subTextRow">{outputState.marginalDM}</td>
        </tr>
      </table>
    </div>
  );
}

export default App;
