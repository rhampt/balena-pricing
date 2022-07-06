import './App.css';
import React, { useState, useEffect } from 'react';

const dollarFormat = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function App() {
  const [inputState, setInputState] = useState({
    existingLicenses: 0,
    purchasedLicenses: 1000,
    duration: 12,
    base: 0.75,
    multiplier: 1.5,
  });

  const [outputState, setOutputState] = useState({
    marginal: 0,
    average: 0,
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
    const newDMs = inputState.duration * inputState.purchasedLicenses;
    const existingDMs = inputState.duration * inputState.existingLicenses;
    const totalDMs = newDMs + existingDMs;

    const previousTotal =
      inputState.multiplier * existingDMs * Math.pow(inputState.base, Math.log10(Math.max(existingDMs / 1000, 1)));
    const fullTotal =
      inputState.multiplier * totalDMs * Math.pow(inputState.base, Math.log10(Math.max(totalDMs / 1000, 1)));

    console.log(previousTotal + '   ' + fullTotal);

    const newAverage = inputState.multiplier * Math.pow(inputState.base, Math.log10(Math.max(totalDMs / 1000, 1)));
    const newMarginal =
      inputState.multiplier *
      (totalDMs * Math.pow(inputState.base, Math.log10(Math.max(totalDMs / 1000, 1))) -
        (totalDMs - 1) * Math.pow(inputState.base, Math.log10(Math.max((totalDMs - 1) / 1000, 1))));

    setOutputState({
      marginal: dollarFormat.format(newMarginal),
      average: dollarFormat.format(newAverage),
      total: dollarFormat.format(fullTotal - previousTotal),
    });
  }, [inputState]); // Only re-run the effect if count changes

  return (
    <div className="App">
      <strong className="Warning">
        Warning: This project is currently in active development and does NOT indicate balena's current volume pricing
        structure. It is a a WIP project to experiment with more transparent, self-service pricing for balena customers.
        When this calculator accurately reflects our pricing structure and becomes feature-complete, I'll remove this
        warning.
      </strong>
      <br></br>
      <table className="Table">
        <tr>
          <td>
            <strong>Inputs</strong>
          </td>
          <td></td>
        </tr>
        <tr>
          <td className="subTextRow">Existing Device Licenses</td>
          <td>
            <input type="number" name="existingLicenses" value={inputState.existingLicenses} onChange={changeHandler} />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">Device Licenses to Purchase</td>
          <td>
            <input
              type="number"
              name="purchasedLicenses"
              value={inputState.purchasedLicenses}
              onChange={changeHandler}
            />
          </td>
        </tr>
        <tr>
          <td className="subTextRow">License Duration (Months)</td>
          <td>
            <input
              type="number"
              name="duration"
              min="1"
              max="120"
              value={inputState.duration}
              onChange={changeHandler}
            />
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
          <td className="subTextRow">Total price (for new): </td>
          <td className="subTextRow">{outputState.total}</td>
        </tr>
        <tr>
          <td className="subTextRow">Average price for all device-months:</td>
          <td className="subTextRow">{outputState.average}</td>
        </tr>
        <tr>
          <td className="subTextRow">Marginal price for more device-months:</td>
          <td className="subTextRow">{outputState.marginal}</td>
        </tr>
      </table>
    </div>
  );
}

export default App;
