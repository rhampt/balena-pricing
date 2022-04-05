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

const computeAverageDM = (alpha, deviceMonthsMax) => {
  return (
    (alpha * Math.pow(deviceMonthsMax, params.beta)) / deviceMonthsMax -
    params.slipdown * Math.pow(deviceMonthsMax / params.dmInfinity, 1.8)
  );
};

const computeMarginalDM = (alpha, deviceMonthsMax, deviceMonths, averageDM) => {
  if (deviceMonths > params.dmInfinity) {
    return averageDM;
  } else {
    const dmsMinusOne = deviceMonthsMax - 1;
    return (
      averageDM * deviceMonths -
      ((alpha * Math.pow(dmsMinusOne, params.beta)) / dmsMinusOne -
        params.slipdown * Math.pow(dmsMinusOne / params.dmInfinity, 1.8)) *
        dmsMinusOne
    );
  }
};

function App() {
  const [inputState, setInputState] = useState({
    devices: 12000,
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
    const deviceMonths = inputState.devices * inputState.months;
    const deviceMonthsMax = deviceMonths > params.dmInfinity ? params.dmInfinity : deviceMonths;
    const averageDM = computeAverageDM(alpha, deviceMonthsMax);

    setOutputState({
      marginalDM: dollarFormat.format(computeMarginalDM(alpha, deviceMonthsMax, deviceMonths, averageDM)),
      averageDM: dollarFormat.format(averageDM),
      totalPrice: dollarFormat.format(averageDM * deviceMonths),
      totalDms: deviceMonths,
    });
  }, [inputState]); // Only re-run the effect if count changes

  return (
    <div className="App">
      <table className="Table">
        <tr>
          <td>
            <strong>Inputs</strong>
          </td>
          <td></td>
        </tr>
        <tr>
          <td className="subTextRow">Devices:</td>
          <td>
            <input type="number" name="devices" value={inputState.devices} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Prepayment Months (12 min):</td>
          <td>
            <input type="number" name="months" min="12" max="60" value={inputState.months} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Microservices: </td>
          <td>
            <input type="checkbox" name="microservices" checked={inputState.microservices} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Fixed License Discount: </td>
          <td>
            <input type="checkbox" name="fixed" checked={inputState.fixed} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Expirable License Discount: </td>
          <td>
            <input type="checkbox" name="expiring" checked={inputState.expiring} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Nonrefundable License Discount: </td>
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
          <td className="subTextRow">Total Price:</td>
          <td className="subTextRow">{outputState.totalPrice}</td>
        </tr>
        <tr>
          <td className="subTextRow">Total Devices Months:</td>
          <td className="subTextRow">{outputState.totalDms}</td>
        </tr>
        <tr>
          <td className="subTextRow">Average DM Price:</td>
          <td className="subTextRow">{outputState.averageDM}</td>
        </tr>
        <tr>
          <td className="subTextRow">Marginal DM Price:</td>
          <td className="subTextRow">{outputState.marginalDM}</td>
        </tr>
      </table>
    </div>
  );
}

export default App;
