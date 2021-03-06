/* eslint no-use-before-define: 1 */
/* eslint camelcase: 1 */
/* eslint brace-style: 1 */
/* eslint no-empty: 1 */
/* eslint no-undef: 1 */
/* eslint-env es6: 1 */
/* eslint no-unused-vars: 1 */
/* eslint arrow-parens: 1 */
/* eslint no-else-return: 1 */

import axios from 'axios';
import jwtDecode from 'jwt-decode';
import React, { createContext, useEffect, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import Loader from './Loader';
import accountReducer from './accountReducer';
import { ACCOUNT_INITIALISE, LOGIN, LOGOUT, SNACKBAR_ERROR } from './actions';
// import API from '../utils/api';

const initialState = {
  isLoggedIn: false,
  isInitialised: false,
  user: null,
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }

  const decoded = jwtDecode(serviceToken);
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken, refreshToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    localStorage.setItem('refreshToken', refreshToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

const JWTContext = createContext({
  ...initialState,
  login: () => Promise.resolve(),
  logout: () => { },
});

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const dispatchSB = useDispatch();

  const login = async (email, password) => {
    const response = await axios.post('https://fyp-en07.hkrnd.com/api/user/login', { email, password });
    const { token, refreshToken } = response.data;
    setSession(token, refreshToken);
    const userResponse = await axios.get('https://fyp-en07.hkrnd.com/api/user/me');
    const user = userResponse.data;
    // const menuResponse = await API.get_menu_item();
    // const menuItem = menuResponse.data;
    dispatch({
      type: LOGIN,
      payload: {
        user,
        // menuItem
      },
    });
  };

  const [refreshing, setRefreshing] = useState(false);
  const callRefreshToken = () => {
    if (!refreshing) {
      runRefreshToken();
      setRefreshing(true);
    }
  };

  const runRefreshToken = async () => {
    try {
      const refresh_token = window.localStorage.getItem('refreshToken');
      const response = await axios.post('https://fyp-en07.hkrnd.com/api/user/refresh_token', { refresh_token });
      setSession(response.data.token, response.data.refreshToken);
    }
    catch (e) {

    }
    finally {
      setRefreshing(false);
    }
  };

  const tokenExpired = () => {
    const refreshToken = window.localStorage.getItem('refreshToken');
    if (refreshToken) axios.post('https://fyp-en07.hkrnd.com/api/user/revoke_token', { refreshToken });
    dispatch({
      type: ACCOUNT_INITIALISE,
      payload: {
        isLoggedIn: false,
        user: null,
        // menuItem: null,
      },
    });
  };

  const logout = () => {
    const refreshToken = window.localStorage.getItem('refreshToken');
    axios.post('https://fyp-en07.hkrnd.com/api/user/revoke_token', { refreshToken });
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        const refreshToken = window.localStorage.getItem('refreshToken');
        if (verifyToken(serviceToken)) {
          setSession(serviceToken, refreshToken);
          const response = await axios.get('https://fyp-en07.hkrnd.com/api/user/me');
          const user = response.data;
          // const menuResponse = await API.get_menu_item();
          // const menuItem = menuResponse.data;
          dispatch({
            type: ACCOUNT_INITIALISE,
            payload: {
              isLoggedIn: true,
              user,
              // menuItem
            },
          });
        } else {
          tokenExpired();
        }
      } catch (err) {
        tokenExpired();
      }

      axios.interceptors.response.use(
        response => {
          const list = [
            'https://fyp-en07.hkrnd.com/api/user/login',
            'https://fyp-en07.hkrnd.com/api/user/refresh_token',
            'https://fyp-en07.hkrnd.com/api/user/revoke_token',
          ];

          if (!list.includes(response.config.url)) {
            callRefreshToken();
            return response;
          }
          return response;
        },
        error => {
          if (error.response.config.url.split('/').splice(-1)[0] === 'login') {
            dispatchSB({ ...SNACKBAR_ERROR, message: 'Invalid email or password.' });
            return error.response;
          } else if (error.response.status === 401 || error.response.data.error === 'jwt expired') {
            dispatchSB({ ...SNACKBAR_ERROR, message: 'Your session has expired, please login again.' });
            tokenExpired();
            return error.response;
          }

          throw error;
        },
      );
    };

    init();
  }, []);

  if (!state.isInitialised) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
