import './App.css';
import React, { useState, useEffect } from 'react';

const dollarFormat = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function App() {
  const [input, setinput] = useState({
    existingLicenses: 0,
    purchasedLicenses: 1000,
    duration: 12,
    base: 0.75,
    multiplier: 1.5,
  });

  const [output, setoutput] = useState({
    marginal: 0,
    average: 0,
    total: 0,
    savings: 0,
  });

  const changeHandler = (event) => {
    event.persist();
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (typeof value != 'boolean') {
      value = parseInt(value);
    }
    setinput((prevState) => ({
      ...prevState,
      [event.target.name]: value,
    }));
  };

  useEffect(() => {
    const newDMs = input.duration * input.purchasedLicenses;
    const existingDMs = input.duration * input.existingLicenses;
    const totalDMs = newDMs + existingDMs;
    const m = input.duration * input.multiplier;

    const previousTotal =
      input.multiplier * existingDMs * Math.pow(input.base, Math.log10(Math.max(existingDMs / 1000, 1)));

    const fullTotal = input.multiplier * totalDMs * Math.pow(input.base, Math.log10(Math.max(totalDMs / 1000, 1)));

    const newAverage = m * Math.pow(input.base, Math.log10(Math.max(totalDMs / 1000, 1)));

    const newMarginal =
      m *
      (totalDMs * Math.pow(input.base, Math.log10(Math.max(totalDMs / 1000, 1))) -
        (totalDMs - 1) * Math.pow(input.base, Math.log10(Math.max((totalDMs - 1) / 1000, 1))));

    setoutput({
      marginal: dollarFormat.format(newMarginal),
      average: dollarFormat.format(newAverage),
      total: dollarFormat.format(fullTotal - previousTotal),
      savings: dollarFormat.format(newDMs * 2 - (fullTotal - previousTotal)),
      marginalDM: dollarFormat.format(newMarginal / input.duration),
      averageDM: dollarFormat.format(newAverage / input.duration),
    });
  }, [input]); // Only re-run the effect if count changes

  return (
    <div className="App">
      {/* <br></br>
      <strong className="Warning">
        Warning: This project is currently in active development and does NOT indicate balena's current volume pricing
        structure. It is a a WIP project to experiment with more transparent, self-service pricing for balena customers.
        When this calculator accurately reflects our pricing structure and becomes feature-complete, I'll remove this
        warning.
      </strong> 
      <br></br>*/}
      <table className="Table">
        <tr>
          <td>
            <strong>Inputs</strong>
          </td>
          <td></td>
        </tr>
        <tr>
          <td className="subTextRow">Device Licenses to Purchase</td>
          <td>
            <input type="number" name="purchasedLicenses" value={input.purchasedLicenses} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">License Duration (Months)</td>
          <td>
            <input type="number" name="duration" min="1" max="120" value={input.duration} onChange={changeHandler} />
          </td>
        </tr>
        <br></br>
        <tr>
          <td className="subTextRow">Already Purchased Unused Licenses</td>
          <td>
            <input type="number" name="existingLicenses" value={input.existingLicenses} onChange={changeHandler} />
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
          <td className="subTextRow">
            <strong>Total price for new licenses</strong>
          </td>
          <td className="subTextRow">
            <strong>{output.total}</strong>
          </td>
        </tr>
        <tr>
          <td className="subTextRow">
            <strong>Savings over $2 dynamic charge</strong>
          </td>
          <td className="subTextRow">
            <strong>{output.savings}</strong>
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Average price for a {input.duration} month license</td>
          <td className="subTextRow">{output.average}</td>
        </tr>
        {/* <tr>
          <td className="subTextRow">Marginal price for a {input.duration} month license</td>
          <td className="subTextRow">{output.marginal}</td>
        </tr> */}
        <tr>
          <td className="subTextRow">Average price for a device-month</td>
          <td className="subTextRow">{output.averageDM}</td>
        </tr>
        {/* <tr>
          <td className="subTextRow">Marginal price for a device-month</td>
          <td className="subTextRow">{output.marginalDM}</td>
        </tr> */}
      </table>
      <strong>
        <a className="repo" href="https://github.com/rhampt/balena-pricing">
          https://github.com/rhampt/balena-pricing
        </a>
      </strong>
    </div>
  );
}

export default App;
