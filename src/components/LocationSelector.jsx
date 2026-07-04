import React from 'react';
import { useMachine } from '@xstate/react';
import { locationMachine } from '../machines/locationMachine';

const LocationSelector = () => {
  const [state, send] = useMachine(locationMachine);

  const {
    countries,
    states,
    cities,
    selectedCountry,
    selectedState,
    selectedCity,
    error
  } = state.context;

  const isCountriesLoading = state.matches('loadingCountries');
  const isStatesLoading = state.matches('loadingStates');
  const isCitiesLoading = state.matches('loadingCities');

  const countryDisabled = isCountriesLoading;
  const stateDisabled = !selectedCountry || isStatesLoading;
  const cityDisabled = !selectedState || isCitiesLoading;

  return (
    <div className="location-page">
      {/* Centered heading */}
      <h2 className="location-heading">Select Location</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Three boxes on one line */}
      <div className="location-row">
        {/* Country */}
        <select
          id="country-select"
          className="location-select"
          value={selectedCountry}
          disabled={countryDisabled}
          onChange={(e) =>
            send({ type: 'SELECT_COUNTRY', value: e.target.value })
          }
        >
          <option key="country-placeholder" value="">
            Select Country
          </option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        {/* State */}
        <select
          id="state-select"
          className="location-select"
          value={selectedState}
          disabled={stateDisabled}
          onChange={(e) =>
            send({ type: 'SELECT_STATE', value: e.target.value })
          }
        >
          <option key="state-placeholder" value="">
            Select State
          </option>
          {states.map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}
        </select>

        {/* City */}
        <select
          id="city-select"
          className="location-select"
          value={selectedCity}
          disabled={cityDisabled}
          onChange={(e) =>
            send({ type: 'SELECT_CITY', value: e.target.value })
          }
        >
          <option key="city-placeholder" value="">
            Select City
          </option>
          {cities.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
      </div>

      {isCountriesLoading && <span>Loading countries...</span>}
      {isStatesLoading && <span>Loading states...</span>}
      {isCitiesLoading && <span>Loading cities...</span>}

      {selectedCountry && selectedState && selectedCity && (
        <p className="location-summary">
          You selected {selectedCity}, {selectedState}, {selectedCountry}
        </p>
      )}
    </div>
  );
};

export default LocationSelector;