import {
  put, take, all, takeEvery,
} from 'redux-saga/effects';
import * as actions from '../actions/users.actions';

export function* getUsers({ domain, token }) {
  yield put({ type: actions.GET_USERS_START });

  // get all groups
  yield put({
    type: 'REQUEST',
    payload: {
      url: `https://${domain}/wp-json/dt/v1/users/get_users?s=`,
      data: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      action: actions.GET_USERS_RESPONSE,
    },
  });

  try {
    const res = yield take(actions.GET_USERS_RESPONSE);
    if (res) {
      const response = res.payload;
      const jsonData = yield response.clone().json();
      if (response.status === 200) {
        if (jsonData) {
          yield put({
            type: actions.GET_USERS_SUCCESS,
            users: jsonData,
          });
        }
      } else {
        yield put({
          type: actions.GET_USERS_FAILURE,
          error: {
            code: jsonData.code,
            message: jsonData.message,
            data: jsonData.data,
          },
        });
      }
    }
  } catch (error) {
    yield put({
      type: actions.GET_USERS_FAILURE,
      error: {
        code: '400',
        message: '(400) Unable to process the request. Please try again later.',
      },
    });
  }
}

export default function* usersSaga() {
  yield all([takeEvery(actions.GET_USERS, getUsers)]);
}
