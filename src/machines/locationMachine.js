import { createMachine, assign } from 'xstate';

const API_BASE = 'https://location-selector.labs.crio.do';

async function fetchCountries() {
  const res = await fetch(`${API_BASE}/countries`);
  if (!res.ok) throw new Error('Failed to fetch countries');
  return res.json();
}

async function fetchStates(country) {
  const res = await fetch(`${API_BASE}/country=${encodeURIComponent(country)}/states`);
  if (!res.ok) throw new Error('Failed to fetch states');
  return res.json();
}

async function fetchCities(country, state) {
  const res = await fetch(
    `${API_BASE}/country=${encodeURIComponent(country)}/state=${encodeURIComponent(state)}/cities`
  );
  if (!res.ok) throw new Error('Failed to fetch cities');
  return res.json();
}

export const locationMachine = createMachine(
  {
    id: 'locationSelector',
    initial: 'loadingCountries',
    context: {
      countries: [],
      states: [],
      cities: [],
      selectedCountry: '',
      selectedState: '',
      selectedCity: '',
      error: ''
    },
    states: {
      loadingCountries: {
        invoke: {
          id: 'getCountries',
          src: () => fetchCountries(),
          onDone: {
            target: 'idleCountry',
            actions: assign({
              countries: (_ctx, event) => event.data,
              error: (_ctx, _event) => ''
            })
          },
          onError: {
            target: 'failure',
            actions: assign({
              error: (_ctx, event) => event.data?.message || 'Could not load countries'
            })
          }
        }
      },

      idleCountry: {
        on: {
          SELECT_COUNTRY: {
            target: 'loadingStates',
            actions: assign({
              selectedCountry: (_ctx, event) => event.value,
              // Reset dependent selections
              selectedState: '',
              selectedCity: '',
              states: [],
              cities: [],
              error: ''
            })
          }
        }
      },

      loadingStates: {
        invoke: {
          id: 'getStates',
          src: (ctx) => fetchStates(ctx.selectedCountry),
          onDone: {
            target: 'idleState',
            actions: assign({
              states: (_ctx, event) => event.data,
              error: (_ctx, _event) => ''
            })
          },
          onError: {
            target: 'failure',
            actions: assign({
              error: (_ctx, event) => event.data?.message || 'Could not load states'
            })
          }
        }
      },

      idleState: {
        on: {
          SELECT_STATE: {
            target: 'loadingCities',
            actions: assign({
              selectedState: (_ctx, event) => event.value,
              selectedCity: '',
              cities: [],
              error: ''
            })
          },
          // if user changes country again from this state
          SELECT_COUNTRY: {
            target: 'loadingStates',
            actions: assign({
              selectedCountry: (_ctx, event) => event.value,
              selectedState: '',
              selectedCity: '',
              states: [],
              cities: [],
              error: ''
            })
          }
        }
      },

      loadingCities: {
        invoke: {
          id: 'getCities',
          src: (ctx) => fetchCities(ctx.selectedCountry, ctx.selectedState),
          onDone: {
            target: 'idleCity',
            actions: assign({
              cities: (_ctx, event) => event.data,
              error: (_ctx, _event) => ''
            })
          },
          onError: {
            target: 'failure',
            actions: assign({
              error: (_ctx, event) => event.data?.message || 'Could not load cities'
            })
          }
        }
      },

      idleCity: {
        on: {
          SELECT_CITY: {
            actions: assign({
              selectedCity: (_ctx, event) => event.value,
              error: ''
            })
          },
          // Handle changes to country or state after we reached city
          SELECT_COUNTRY: {
            target: 'loadingStates',
            actions: assign({
              selectedCountry: (_ctx, event) => event.value,
              selectedState: '',
              selectedCity: '',
              states: [],
              cities: [],
              error: ''
            })
          },
          SELECT_STATE: {
            target: 'loadingCities',
            actions: assign({
              selectedState: (_ctx, event) => event.value,
              selectedCity: '',
              cities: [],
              error: ''
            })
          }
        }
      },

      failure: {
        on: {
          RETRY_COUNTRIES: 'loadingCountries',
          RETRY_STATES: 'loadingStates',
          RETRY_CITIES: 'loadingCities'
        }
      }
    }
  }
);